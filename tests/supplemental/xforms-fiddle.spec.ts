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
const renderTimeoutMs = 20_000;

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

test.describe("XForms fiddle", () => {
  test.describe.configure({ mode: "serial" });
  let examplesServer: RunningServer;

  test.beforeAll(async () => {
    examplesServer = startExamplesServer();
    await waitForServerReady(examplesServer);
  });

  test.afterAll(async () => {
    await stopServer(examplesServer);
  });

  test("renders all panes, XML coloring, and default form", async ({ page }) => {
    await page.goto(`${examplesServer.baseUrl}/xforms-fiddle.html`);
    await expect(page).toHaveTitle("XForms Fiddle");

    await expect(page.locator("#xslt-source")).toContainText("<xsl:stylesheet", { timeout: renderTimeoutMs });
    await expect(page.locator("#xslt-source .xml-tag-name").first()).toBeVisible({ timeout: renderTimeoutMs });
    await expect(page.locator("#xforms-source-editor")).toHaveValue(/<xf:xform/);
    await expect(page.locator("#xForm .xforms-input").first()).toBeVisible({ timeout: renderTimeoutMs });
    await expect(page.locator("#fiddle-console")).toContainText("Render complete.");
  });

  test("refresh clears console and re-renders edited XForms", async ({ page }) => {
    await page.goto(`${examplesServer.baseUrl}/xforms-fiddle.html`);
    await expect(page.locator("#xForm .xforms-input").first()).toBeVisible({ timeout: renderTimeoutMs });

    await page.evaluate(() => {
      console.log("before-refresh-sentinel");
    });
    await expect(page.locator("#fiddle-console")).toContainText("before-refresh-sentinel");

    const editor = page.locator("#xforms-source-editor");
    const currentXForms = await editor.inputValue();
    const updatedXForms = currentXForms.replace(
      "<xf:label>Name</xf:label>",
      "<xf:label>Full name</xf:label>"
    );
    expect(updatedXForms).not.toBe(currentXForms);

    await editor.fill(updatedXForms);
    await page.getByRole("button", { name: "Refresh XForms" }).click();

    await expect(page.locator("#xForm")).toContainText("Full name", { timeout: renderTimeoutMs });
    await expect(page.locator("#fiddle-console")).not.toContainText("before-refresh-sentinel");
    await expect(page.locator("#fiddle-console")).toContainText("Render complete.");
  });

  test("refresh then blur does not trigger stale-output errors", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => {
      pageErrors.push(String(error));
    });

    await page.goto(`${examplesServer.baseUrl}/xforms-fiddle.html`);
    await expect(page.locator("#xForm .xforms-input").first()).toBeVisible({ timeout: renderTimeoutMs });

    await page.getByRole("button", { name: "Refresh XForms" }).click();
    await expect(page.locator("#fiddle-console")).toContainText("Render complete.", { timeout: renderTimeoutMs });

    const renderedInput = page.locator("#xForm input.xforms-input").first();
    await renderedInput.fill("Alice");
    await renderedInput.blur();

    await expect(page.locator("#xForm .xforms-output").first()).toContainText("Alice", { timeout: renderTimeoutMs });
    await page.waitForTimeout(250);

    expect(pageErrors).toEqual([]);
    await expect(page.locator("#fiddle-console")).not.toContainText("Required cardinality of value in 'ixsl:set-attribute/@object' expression");
    await expect(page.locator("#fiddle-console")).not.toContainText("[refreshOutputs-JS] Can't find form control");
  });
});
