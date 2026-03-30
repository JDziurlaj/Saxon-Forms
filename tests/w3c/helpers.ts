import { test as base, expect } from "@playwright/test";

/**
 * Shared test fixture that intercepts echo.sh requests, plus helper
 * functions used by all per-chapter W3C XForms 1.1 test specs.
 */

export const test = base.extend<{}>({
  page: async ({ page }, use) => {
    await page.route(/echo\.sh/, async (route) => {
      const body = route.request().postData() || "";
      await route.fulfill({ status: 200, contentType: "text/plain", body });
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

export async function getInstanceXML(page: any, instanceId?: string): Promise<string> {
  return page.evaluate((id: string | undefined) => {
    const g = window as any;
    const key = id || g.getInstanceKeys?.()[0];
    const inst = key ? g.getInstance(key) : null;
    if (!inst) return "";
    return new XMLSerializer().serializeToString(inst);
  }, instanceId);
}

export async function submitAndCapture(page: any, submitButton: any, timeout = 2000) {
  const requestPromise = page.waitForRequest(
    (req: any) => req.url().includes("echo.sh"),
    { timeout }
  ).catch(() => null);
  await submitButton.click();
  return requestPromise;
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
  await page.waitForTimeout(300);
  const newMessages = dialogMessages.slice(beforeCount);
  expect(newMessages.some((message) => messagePattern.test(message))).toBe(true);
}
