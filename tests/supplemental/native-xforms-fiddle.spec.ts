import { test, expect } from "@playwright/test";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const examplesHost = "127.0.0.1";
const examplesPort = 5197;
const renderTimeoutMs = 25_000;

type RunningServer = {
  baseUrl: string;
  child: ChildProcess;
  name: string;
};

function startExamplesServer(): RunningServer {
  const child = spawn("node", ["examples/server.mjs"], {
    cwd: repoRoot,
    env: {
      ...process.env,
      EXAMPLES_HOST: examplesHost,
      EXAMPLES_PORT: String(examplesPort),
    },
    stdio: "pipe",
  });

  return {
    baseUrl: `http://${examplesHost}:${examplesPort}`,
    child,
    name: "examples-server",
  };
}

async function waitForServerReady(server: RunningServer, timeoutMs = 15_000): Promise<void> {
  const startedAt = Date.now();
  while ((Date.now() - startedAt) < timeoutMs) {
    if (server.child.exitCode !== null) {
      const errorOutput = server.child.stderr?.read?.()?.toString() ?? "";
      throw new Error(`${server.name} exited before ready (code ${server.child.exitCode}). ${errorOutput}`);
    }
    try {
      const response = await fetch(`${server.baseUrl}/index.html`);
      if (response.ok) {
        return;
      }
    } catch {
      // wait and retry
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${server.name} at ${server.baseUrl}.`);
}

async function stopServer(server: RunningServer): Promise<void> {
  if (!server || server.child.exitCode !== null) {
    return;
  }
  server.child.kill("SIGTERM");
  await Promise.race([
    once(server.child, "exit"),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);
  if (server.child.exitCode === null) {
    server.child.kill("SIGKILL");
  }
}

test.describe("native XForms fiddle", () => {
  test.describe.configure({ mode: "serial" });
  let examplesServer: RunningServer;

  test.beforeAll(async () => {
    examplesServer = startExamplesServer();
    await waitForServerReady(examplesServer);
  });

  test.afterAll(async () => {
    await stopServer(examplesServer);
  });

  test("loads host controls and renders default nested form", async ({ page }) => {
    await page.goto(`${examplesServer.baseUrl}/native-xforms-fiddle.html`);
    await expect(page).toHaveTitle("Native XForms Fiddle");
    await expect(page.getByRole("button", { name: "Refresh XForms" })).toBeVisible({ timeout: renderTimeoutMs });
    await expect(page.locator("textarea[id^='native-fiddle-xforms-source']")).toBeVisible({ timeout: renderTimeoutMs });
    await expect(page.frameLocator("#native-fiddle-render-target").locator(".xforms-input").first()).toBeVisible({ timeout: renderTimeoutMs });
    await expect(page.locator("#native-fiddle-console")).toContainText("Render complete.", { timeout: renderTimeoutMs });
  });

  test("refreshes nested form from edited source", async ({ page }) => {
    await page.goto(`${examplesServer.baseUrl}/native-xforms-fiddle.html`);
    await expect(page.frameLocator("#native-fiddle-render-target").locator(".xforms-input").first()).toBeVisible({ timeout: renderTimeoutMs });
    const didUpdateSource = await page.evaluate(() => {
      const sourceEditor = document.querySelector("textarea[id^='native-fiddle-xforms-source']");
      if (!(sourceEditor instanceof HTMLTextAreaElement)) {
        return false;
      }
      const updatedSource = sourceEditor.value.replace(
        "<xf:label>Name</xf:label>",
        "<xf:label>Full name</xf:label>"
      );
      if (updatedSource === sourceEditor.value) {
        return false;
      }
      sourceEditor.value = updatedSource;
      sourceEditor.dispatchEvent(new Event("input", { bubbles: true }));
      sourceEditor.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    });
    expect(didUpdateSource).toBeTruthy();
    await page.evaluate(() => window.nativeXFormsFiddle.refresh());

    await expect(page.frameLocator("#native-fiddle-render-target").locator("body")).toContainText("Full name", { timeout: renderTimeoutMs });
    await expect(page.locator("#native-fiddle-console")).toContainText("Render complete.", { timeout: renderTimeoutMs });
  });

  test("supports repeated refresh operations", async ({ page }) => {
    await page.goto(`${examplesServer.baseUrl}/native-xforms-fiddle.html`);
    await expect(page.frameLocator("#native-fiddle-render-target").locator(".xforms-input").first()).toBeVisible({ timeout: renderTimeoutMs });

    await page.getByRole("button", { name: "Refresh XForms" }).click();
    await expect(page.locator("#native-fiddle-console")).toContainText("Render complete.", { timeout: renderTimeoutMs });

    await page.getByRole("button", { name: "Refresh XForms" }).click();
    await expect(page.locator("#native-fiddle-console")).toContainText("Render complete.", { timeout: renderTimeoutMs });
    await expect(page.frameLocator("#native-fiddle-render-target").locator(".xforms-input").first()).toBeVisible({ timeout: renderTimeoutMs });
  });
});
