import { test, expect } from "../fixtures/echo-intercept";

const RENDER_TIMEOUT = 20_000;
type ProviderConfig = {
  name: string;
  pagePath: string;
  changeEvent: string;
  exposesHostValue: boolean;
};

const providers: ProviderConfig[] = [
  {
    name: "shoelace",
    pagePath: "/test-web-components-shoelace.html",
    changeEvent: "sl-change",
    exposesHostValue: true,
  },
  {
    name: "tinymce",
    pagePath: "/test-web-components-tinymce.html",
    changeEvent: "Change",
    exposesHostValue: false,
  },
];

async function waitForWebComponentsForm(page: any, provider: ProviderConfig) {
  await page.goto(provider.pagePath);
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

async function getComponentValues(page: any) {
  return page.evaluate(() => ({
    projectName: (document.querySelector("[id^='project-name-']") as any)?.value ?? "",
    ownerEmail: (document.querySelector("[id^='owner-email-']") as any)?.value ?? "",
    releaseNotes: (document.querySelector("[id^='release-notes-']") as any)?.value ?? "",
  }));
}

providers.forEach((provider) => {
  test.describe(`Web components integration (${provider.name})`, () => {
    test("hydrates model values into rendered components", async ({ page }) => {
      await waitForWebComponentsForm(page, provider);

      await expect(page.locator("#out-project-name")).toContainText("Acme Migration");
      await expect(page.locator("#out-owner-email")).toContainText("owner@example.test");
      await expect(page.locator("#out-release-notes")).toContainText("Initial draft notes");

      await expect(page.locator("[id^='project-name-']")).toHaveAttribute("data-xf-component", "true");
      await expect(page.locator("[id^='owner-email-']")).toHaveAttribute("data-xf-component", "true");
      await expect(page.locator("[id^='release-notes-']")).toHaveAttribute("data-xf-component", "true");
      if (provider.exposesHostValue) {
        await expect
          .poll(async () => getComponentValues(page))
          .toMatchObject({
            projectName: expect.stringContaining("Acme Migration"),
            ownerEmail: expect.stringContaining("owner@example.test"),
            releaseNotes: expect.stringContaining("Initial draft notes"),
          });
      }
    });

    test("view to model updates work for custom and native events", async ({ page }) => {
      await waitForWebComponentsForm(page, provider);

      await setComponentValueAndDispatch(
        page,
        "[id^='project-name-']",
        "project-ui-update",
        provider.changeEvent
      );
      await setComponentValueAndDispatch(
        page,
        "[id^='owner-email-']",
        "owner-ui-update@example.test",
        provider.changeEvent
      );
      await setComponentValueAndDispatch(
        page,
        "[id^='release-notes-']",
        "release notes ui update",
        provider.changeEvent
      );

      await expect(page.locator("#out-project-name")).toContainText("project-ui-update");
      await expect(page.locator("#out-owner-email")).toContainText("owner-ui-update@example.test");
      await expect(page.locator("#out-release-notes")).toContainText("release notes ui update");
    });

    test("model refresh updates component values and repeat rows stay isolated", async ({ page }) => {
      await waitForWebComponentsForm(page, provider);

      await page.locator("button[data-action*='set-main-values']").click();
      await expect(page.locator("#out-project-name")).toContainText("Acme Migration v2");
      await expect(page.locator("#out-owner-email")).toContainText("release.manager@example.test");
      await expect(page.locator("#out-release-notes")).toContainText("Release approved for staging deploy.");
      if (provider.exposesHostValue) {
        await expect
          .poll(async () => getComponentValues(page))
          .toMatchObject({
            projectName: expect.stringContaining("Acme Migration v2"),
            ownerEmail: expect.stringContaining("release.manager@example.test"),
            releaseNotes: expect.stringContaining("Release approved for staging deploy."),
          });
      }

      const repeatInputs = page.locator("[id^='repeat-sl-']");
      await expect(repeatInputs).toHaveCount(2);

      await setComponentValueAndDispatch(
        page,
        "[id^='repeat-sl-']",
        "repeat-a-ui-update",
        provider.changeEvent
      );
      const repeatOutputs = page.locator("[id^='repeat-name-out-']");
      await expect(repeatOutputs.nth(0)).toContainText("repeat-a-ui-update");
      await expect(repeatOutputs.nth(1)).toContainText("Run load tests");

      await page.locator("button[data-action*='set-repeat-second']").click();
      await expect(repeatOutputs.nth(1)).toContainText("repeat-b-model-update");
      if (provider.exposesHostValue) {
        await expect
          .poll(async () => {
            return page.evaluate(() => {
              const rows = Array.from(document.querySelectorAll("[id^='repeat-sl-']")) as any[];
              return rows.map((row) => row?.value ?? "");
            });
          })
          .toMatchObject([
            expect.stringContaining("repeat-a-ui-update"),
            expect.stringContaining("repeat-b-model-update"),
          ]);
      }
    });

    test("miswired event does not mutate model and no runtime page errors are raised", async ({ page }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => {
        pageErrors.push(error.message);
      });

      await waitForWebComponentsForm(page, provider);

      await setComponentValueAndDispatch(
        page,
        "[id^='sl-miswired-']",
        "should-not-persist",
        provider.changeEvent
      );
      await expect(page.locator("#out-miswired")).toContainText("keep-original");

      const relevantPageErrors = pageErrors.filter(
        (msg) => !msg.includes("Unexpected token '<'")
      );
      expect(relevantPageErrors).toEqual([]);
    });

    test("renders one web component per xf:repeat item", async ({ page }) => {
      await waitForWebComponentsForm(page, provider);

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
      await waitForWebComponentsForm(page, provider);

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
});
