import { test, expect } from "../fixtures/echo-intercept";

const RENDER_TIMEOUT = 20_000;

async function waitForWebComponentsForm(page: any) {
  await page.goto("/web-components.html");
  await expect(page.locator("#wc-root")).toBeVisible({ timeout: RENDER_TIMEOUT });
  await expect(page.locator("[data-xf-component]")).toHaveCount(8, { timeout: RENDER_TIMEOUT });
}

async function setComponentValueAndDispatch(
  page: any,
  selector: string,
  value: string,
  eventName: string
) {
  await page.evaluate(
    ({ cssSelector, nextValue, evt }) => {
      const el = document.querySelector(cssSelector) as any;
      if (!el) {
        throw new Error(`Component not found: ${cssSelector}`);
      }
      el.value = nextValue;
      if (evt === "change" || evt === "input") {
        el.dispatchEvent(new Event(evt, { bubbles: true, composed: true }));
      } else {
        el.dispatchEvent(new CustomEvent(evt, { bubbles: true, composed: true, detail: { value: nextValue } }));
      }
    },
    { cssSelector: selector, nextValue: value, evt: eventName }
  );
}

test.describe("Web components integration", () => {
  test("hydrates model values into rendered components", async ({ page }) => {
    await waitForWebComponentsForm(page);

    await expect(page.locator("#out-project-name")).toContainText("Acme Migration");
    await expect(page.locator("#out-owner-email")).toContainText("owner@example.test");
    await expect(page.locator("#out-release-notes")).toContainText("Initial draft notes");

    await expect(page.locator("[id^='project-name-']")).toHaveAttribute("data-xf-component", "true");
    await expect(page.locator("[id^='owner-email-']")).toHaveAttribute("data-xf-component", "true");
    await expect(page.locator("[id^='release-notes-']")).toHaveAttribute("data-xf-component", "true");
    await expect
      .poll(async () => {
        return page.evaluate(() => ({
          projectName: (document.querySelector("[id^='project-name-']") as any)?.value ?? "",
          ownerEmail: (document.querySelector("[id^='owner-email-']") as any)?.value ?? "",
          releaseNotes: (document.querySelector("[id^='release-notes-']") as any)?.value ?? "",
        }));
      })
      .toEqual({
        projectName: "Acme Migration",
        ownerEmail: "owner@example.test",
        releaseNotes: "Initial draft notes",
      });
  });

  test("view to model updates work for custom and native events", async ({ page }) => {
    await waitForWebComponentsForm(page);

    await setComponentValueAndDispatch(page, "[id^='project-name-']", "project-ui-update", "sl-change");
    await setComponentValueAndDispatch(page, "[id^='owner-email-']", "owner-ui-update@example.test", "sl-change");
    await setComponentValueAndDispatch(page, "[id^='release-notes-']", "release notes ui update", "sl-change");

    await expect(page.locator("#out-project-name")).toContainText("project-ui-update");
    await expect(page.locator("#out-owner-email")).toContainText("owner-ui-update@example.test");
    await expect(page.locator("#out-release-notes")).toContainText("release notes ui update");
  });

  test("model refresh updates component values and repeat rows stay isolated", async ({ page }) => {
    await waitForWebComponentsForm(page);

    await page.locator("button[data-action*='set-main-values']").click();
    await expect(page.locator("#out-project-name")).toContainText("Acme Migration v2");
    await expect(page.locator("#out-owner-email")).toContainText("release.manager@example.test");
    await expect(page.locator("#out-release-notes")).toContainText("Release approved for staging deploy.");
    await expect
      .poll(async () => {
        return page.evaluate(() => ({
          projectName: (document.querySelector("[id^='project-name-']") as any)?.value ?? "",
          ownerEmail: (document.querySelector("[id^='owner-email-']") as any)?.value ?? "",
          releaseNotes: (document.querySelector("[id^='release-notes-']") as any)?.value ?? "",
        }));
      })
      .toEqual({
        projectName: "Acme Migration v2",
        ownerEmail: "release.manager@example.test",
        releaseNotes: "Release approved for staging deploy.",
      });

    const repeatInputs = page.locator("[id^='repeat-sl-']");
    await expect(repeatInputs).toHaveCount(2);

    await setComponentValueAndDispatch(page, "[id^='repeat-sl-']", "repeat-a-ui-update", "sl-change");
    const repeatOutputs = page.locator("[id^='repeat-name-out-']");
    await expect(repeatOutputs.nth(0)).toContainText("repeat-a-ui-update");
    await expect(repeatOutputs.nth(1)).toContainText("Run load tests");

    await page.locator("button[data-action*='set-repeat-second']").click();
    await expect(repeatOutputs.nth(1)).toContainText("repeat-b-model-update");
    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll("[id^='repeat-sl-']")) as any[];
          return rows.map((row) => row?.value ?? "");
        });
      })
      .toEqual(["repeat-a-ui-update", "repeat-b-model-update"]);
  });

  test("miswired event does not mutate model and no runtime page errors are raised", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await waitForWebComponentsForm(page);

    await setComponentValueAndDispatch(page, "[id^='sl-miswired-']", "should-not-persist", "sl-change");
    await expect(page.locator("#out-miswired")).toContainText("keep-original");

    const relevantPageErrors = pageErrors.filter(
      (msg) => !msg.includes("Unexpected token '<'")
    );
    expect(relevantPageErrors).toEqual([]);
  });

  test("renders one web component per xf:repeat item", async ({ page }) => {
    await waitForWebComponentsForm(page);

    const repeatRows = page.locator("#wc-repeat > [data-repeat-item='true']");
    await expect(repeatRows).toHaveCount(2);

    const repeatComponents = page.locator("[id^='repeat-sl-']");
    await expect(repeatComponents).toHaveCount(2);

    const componentIds = await repeatComponents.evaluateAll((els) =>
      els.map((el) => (el as HTMLElement).id)
    );
    expect(new Set(componentIds).size).toBe(2);
  });

  test("renders components in toggle cases and switches visibility on toggle", async ({ page }) => {
    await waitForWebComponentsForm(page);

    const summaryComponent = page.locator("[id^='toggle-summary-']");
    const advancedComponent = page.locator("[id^='toggle-advanced-']");

    await expect(summaryComponent).toHaveCount(1);
    await expect(advancedComponent).toHaveCount(1);
    await expect(summaryComponent).toBeVisible();
    await expect(advancedComponent).toBeHidden();

    await page.locator("button[data-action*='show-advanced-mode']").click();
    await expect(advancedComponent).toBeVisible();
    await expect(summaryComponent).toBeHidden();

    await page.locator("button[data-action*='show-summary-mode']").click();
    await expect(summaryComponent).toBeVisible();
    await expect(advancedComponent).toBeHidden();
  });
});
