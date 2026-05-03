import { test as base, expect } from "@playwright/test";

/**
 * Shared test fixture that intercepts echo.sh requests, plus helper
 * functions used by all per-chapter W3C XForms 1.1 test specs.
 */

const configuredPlaywrightBaseUrl =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://${process.env.PLAYWRIGHT_TEST_HOST || "127.0.0.1"}:${process.env.PLAYWRIGHT_TEST_PORT || "5174"}`;
const configuredPlaywrightHost = (() => {
  try {
    return new URL(configuredPlaywrightBaseUrl).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return "127.0.0.1";
  }
})();
const localHarnessHosts = new Set<string>([
  "localhost",
  "127.0.0.1",
  "::1",
  "[::1]",
  configuredPlaywrightHost,
]);
const echoServiceHosts = new Set<string>([
  "xformstest.org",
  "www.xformstest.org",
  "www.w3.org",
]);
const forcedExternalFailureHosts = new Set<string>([
  "bad.url",
  "invalid",
  "invaliduri",
  "invaliduri.com",
  "invaliduri.com8565",
]);

export const test = base.extend<{}>({
  page: async ({ page }, use) => {
    const virtualLocalFiles = new Map<string, string>();
    const initializedVirtualFiles = new Set<string>();
    // TEST-TRACE: make external requests deterministic so W3C specs do not fail purely due to internet availability; helps tests/w3c/ch10.spec.ts and tests/w3c/ch11.spec.ts.
    await page.context().route("**/*", async (route) => {
      const request = route.request();
      const method = request.method().toUpperCase();
      const requestUrl = request.url();
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(requestUrl);
      } catch {
        await route.continue();
        return;
      }

      const protocol = parsedUrl.protocol.toLowerCase();
      if (protocol !== "http:" && protocol !== "https:") {
        await route.continue();
        return;
      }

      const pathname = parsedUrl.pathname.toLowerCase();
      const hostname = parsedUrl.hostname.toLowerCase().replace(/\.$/, "");
      const key = pathname || requestUrl.toLowerCase();

      if (/\/echo\.sh$/i.test(pathname) && (localHarnessHosts.has(hostname) || echoServiceHosts.has(hostname))) {
        const body = request.postData() || "";
        await route.fulfill({ status: 200, contentType: "text/plain", body });
        return;
      }

      if (localHarnessHosts.has(hostname)) {
        if (/(?:myfile|deleteme)\.txt$/i.test(pathname)) {
          if (key.endsWith("/deleteme.txt") && !initializedVirtualFiles.has(key)) {
            virtualLocalFiles.set(key, "seed");
            initializedVirtualFiles.add(key);
          }
          if (method === "PUT" || method === "POST") {
            const body = request.postData() || "";
            virtualLocalFiles.set(key, body);
            await route.fulfill({ status: 200, contentType: "text/plain", body });
            return;
          }
          if (method === "DELETE") {
            virtualLocalFiles.delete(key);
            await route.fulfill({ status: 200, contentType: "text/plain", body: "" });
            return;
          }
          if (method === "GET") {
            if (virtualLocalFiles.has(key)) {
              await route.fulfill({
                status: 200,
                contentType: "text/plain",
                body: virtualLocalFiles.get(key) || "",
              });
              return;
            }
            await route.fulfill({ status: 404, contentType: "text/plain", body: "Not Found" });
            return;
          }
          await route.fulfill({
            status: 405,
            contentType: "text/plain",
            body: `Unsupported method: ${method}`,
          });
          return;
        }

        await route.continue();
        return;
      }

      if (forcedExternalFailureHosts.has(hostname)) {
        await route.abort("addressunreachable");
        return;
      }

      const fallbackBody =
        method === "HEAD"
          ? ""
          : request.postData() || "<?xml version=\"1.0\" encoding=\"UTF-8\"?><data>offline-stub</data>";
      await route.fulfill({
        status: 200,
        contentType: "application/xml",
        body: fallbackBody,
      });
    });
    await use(page);
  },
});

export { expect };

export const RENDER_TIMEOUT = 15_000;

export async function loadTest(page: any, file: string) {
  await page.goto(`/w3c-runner.html?test=${file}`);
  await expect(page.locator("#xForm")).not.toBeEmpty({ timeout: RENDER_TIMEOUT });
}

export async function loadAndWait(page: any, file: string) {
  await page.goto(`/w3c-runner.html?test=${file}`);
  await expect(page.locator("#xForm")).not.toBeEmpty({ timeout: RENDER_TIMEOUT });
  await page.waitForTimeout(1000);
}

export function getRenderedText(page: any): Promise<string> {
  return page.locator("#xForm").innerText();
}

/**
 * Like getRenderedText but strips the W3C title and instruction labels
 * so that assertions don't accidentally match the pass-criteria text.
 */
export async function getFormControlText(page: any): Promise<string> {
  return page.evaluate(() => {
    const el = document.querySelector("#xForm");
    if (!el) return "";
    const clone = el.cloneNode(true) as HTMLElement;
    // Remove the title group (contains <label class="title">)
    clone.querySelector(".xforms-group:has(label.title)")?.remove();
    // Remove the first remaining instruction-only group
    // (a group whose only content is a <label> with no form controls)
    for (const g of clone.querySelectorAll(":scope > .xforms-group")) {
      if (!g.querySelector("input, select, button, textarea, .xforms-output, .xforms-input, .xforms-select, .xforms-repeat")) {
        g.remove();
        break;
      }
    }
    return clone.innerText;
  });
}

export async function getInstanceXML(page: any, instanceId?: string): Promise<string> {
  return page.evaluate((id: string | undefined) => {
    const g = window as any;
    const key = id || g.getInstanceKeys?.()[0];
    const inst = key ? g.getInstance(key) : null;
    if (!inst) return "";
    return new XMLSerializer().serializeToString(inst);
  }, instanceId);
}

export async function clickAndCaptureRequest(
  page: any,
  trigger: any,
  requestPredicate: (req: any) => boolean,
  timeout = 2000
) {
  const requestPromise = page.waitForRequest(
    (req: any) => requestPredicate(req),
    { timeout }
  ).catch(() => null);
  await trigger.click();
  return requestPromise;
}

export async function submitAndCapture(page: any, submitButton: any, timeout = 2000) {
  return clickAndCaptureRequest(
    page,
    submitButton,
    (req: any) => /\/echo\.sh(?:\?|$)/i.test(req.url()),
    timeout
  );
}

export async function waitForCondition(
  page: any,
  predicate: () => Promise<boolean> | boolean,
  options?: {
    timeoutMs?: number;
    intervalMs?: number;
    description?: string;
  }
) {
  const timeoutMs = options?.timeoutMs ?? 3_000;
  const intervalMs = options?.intervalMs ?? 100;
  const description = options?.description ?? "condition";
  const startedAt = Date.now();
  let attempts = 0;
  while ((Date.now() - startedAt) < timeoutMs) {
    attempts += 1;
    if (await predicate()) {
      return;
    }
    await page.waitForTimeout(intervalMs);
  }
  throw new Error(`Timed out after ${timeoutMs}ms waiting for ${description} (attempts: ${attempts}).`);
}

export async function isUnavailable(input: any): Promise<boolean> {
  const visible = await input.isVisible().catch(() => false);
  if (!visible) return true;
  const enabled = await input.isEnabled().catch(() => false);
  return !enabled;
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function collectDialogMessages(page: any): string[] {
  const dialogMessages: string[] = [];
  page.on("dialog", async (dialog: any) => {
    dialogMessages.push(normalizeWhitespace(dialog.message()));
    await dialog.dismiss();
  });
  return dialogMessages;
}

export async function getEventModelResults(page: any): Promise<string[]> {
  return page.evaluate(() => {
    const g = window as any;
    const raw = g.getModelDefaultInstanceKey?.("event_model");
    const instanceKey = Array.isArray(raw) ? raw[0] : raw;
    const instance = instanceKey ? g.getInstance(instanceKey) : null;
    if (!instance) return [];
    return Array.from(instance.getElementsByTagName("event")).map((node: any) =>
      String(node?.textContent ?? "").replace(/\s+/g, " ").trim()
    );
  });
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function expectDatatypeEvents(
  values: string[],
  eventName: "xforms-valid" | "XFORMS-INVALID",
  typeNames: string[]
) {
  const normalized = values.map(normalizeWhitespace);
  for (const typeName of typeNames) {
    const pattern = new RegExp(
      `${escapeRegex(eventName)}[^\\)]*\\(${escapeRegex(typeName)}\\)`,
      "i"
    );
    expect(normalized.some((value) => pattern.test(value))).toBe(true);
  }
}

export async function clickTrigger(page: any, label: string) {
  await page.getByRole("button", { name: label, exact: true }).click();
  await page.waitForTimeout(300);
}

export async function expectDialogAfterTrigger(
  page: any,
  dialogMessages: string[],
  triggerLabel: string,
  messagePattern: RegExp
) {
  const beforeCount = dialogMessages.length;
  await clickTrigger(page, triggerLabel);
  await waitForCondition(
    page,
    () => dialogMessages.slice(beforeCount).some((message) => messagePattern.test(message)),
    { description: `dialog matching ${messagePattern}` }
  );
}
