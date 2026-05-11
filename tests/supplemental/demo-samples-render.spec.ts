import { test, expect } from "@playwright/test";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const examplesPort = 5196;
const host = "127.0.0.1";
const renderTimeoutMs = 15_000;

type RunningServer = {
  baseUrl: string;
  child: ChildProcess;
  name: string;
};

function startNodeServer({
  env,
  name,
  scriptPath
}: {
  env: Record<string, string>;
  name: string;
  scriptPath: string;
}): RunningServer {
  const child = spawn("node", [scriptPath], {
    cwd: repoRoot,
    env: {
      ...process.env,
      ...env
    },
    stdio: "pipe"
  });

  return {
    baseUrl: `http://${host}:${env.EXAMPLES_PORT}`,
    child,
    name
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
      const response = await fetch(`${server.baseUrl}/`);
      if (response.ok || response.status === 404) {
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
    new Promise((resolve) => setTimeout(resolve, 2_000))
  ]);
  if (server.child.exitCode === null) {
    server.child.kill("SIGKILL");
  }
}

test.describe("Examples XForms render smoke", () => {
  test.describe.configure({ mode: "serial" });
  let examplesServer: RunningServer;

  test.beforeAll(async () => {
    examplesServer = startNodeServer({
      // TEST-TRACE: run unified examples Node server in-test so pages can fetch SaxonJS3 + SEF assets and render controls; helps tests/supplemental/demo-samples-render.spec.ts examples render checks.
      env: {
        EXAMPLES_HOST: host,
        EXAMPLES_PORT: String(examplesPort)
      },
      name: "examples-server",
      scriptPath: "examples/server.mjs"
    });
    await waitForServerReady(examplesServer);
  });

  test.afterAll(async () => {
    await stopServer(examplesServer);
  });

  test("examples fundamentals page renders XForms controls", async ({ page }) => {
    await page.goto(`${examplesServer.baseUrl}/demo-repeat.html`);
    // TEST-TRACE: assert rendered repeat controls exist after runtime transform; helps tests/supplemental/demo-samples-render.spec.ts fundamentals render check.
    await expect(page.locator("#xForm .xforms-repeat").first()).toBeVisible({ timeout: renderTimeoutMs });
  });

  test("examples booking page renders XForms controls", async ({ page }) => {
    await page.goto(`${examplesServer.baseUrl}/sample1.html`);
    // TEST-TRACE: assert rendered booking form controls exist after runtime transform; helps tests/supplemental/demo-samples-render.spec.ts booking render check.
    await expect(page.locator("#xForm .xforms-input").first()).toBeVisible({ timeout: renderTimeoutMs });
  });
});
