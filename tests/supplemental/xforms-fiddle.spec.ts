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
const compileTimeoutMs = 45_000;
const busBookingXFormsSource = `<?xml version="1.0" encoding="UTF-8"?>
<xf:xform
    xmlns:xf="http://www.w3.org/2002/xforms"
    xmlns:ev="http://www.w3.org/2001/xml-events">

    <xf:model id="bus-booking">
        <xf:instance id="booking-data">
            <data xmlns="">
                <name/>
                <route/>
                <date/>
                <passengers>1</passengers>
                <fare-per-person/>
                <total-fare/>
                <phone/>
            </data>
        </xf:instance>

        <xf:bind nodeset="name" required="true()" type="xs:string"/>
        <xf:bind nodeset="route" required="true()" type="xs:string"/>
        <xf:bind nodeset="date" required="true()" type="xs:date"/>
        <xf:bind nodeset="passengers" required="true()" type="xs:integer" constraint=". &gt;= 1 and . &lt;= 10"/>
        <xf:bind nodeset="fare-per-person"
                 calculate="if(../route = 'NY-BOS', 35,
                              if(../route = 'NY-PHI', 25,
                              if(../route = 'BOS-PHI', 40, 0)))"/>
        <xf:bind nodeset="total-fare" calculate="../passengers * ../fare-per-person"/>
        <xf:bind nodeset="phone" type="xs:string"/>

        <xf:submission id="submit-booking"
                       method="post"
                       action="https://httpbin.org/post"
                       replace="instance"
                       ev:event="xforms-submit-done">
            <xf:message level="ephemeral">🎟️ Booking successful! Thank you for choosing our bus service.</xf:message>
        </xf:submission>
    </xf:model>

    <xf:group>
        <xf:label>Full Name</xf:label>
        <xf:input ref="name" incremental="true">
            <xf:alert>Please enter your full name</xf:alert>
        </xf:input>
    </xf:group>

    <xf:group>
        <xf:label>Select Route</xf:label>
        <xf:select1 ref="route" appearance="full" incremental="true">
            <xf:item>
                <xf:label>New York → Boston ($35)</xf:label>
                <xf:value>NY-BOS</xf:value>
            </xf:item>
            <xf:item>
                <xf:label>New York → Philadelphia ($25)</xf:label>
                <xf:value>NY-PHI</xf:value>
            </xf:item>
            <xf:item>
                <xf:label>Boston → Philadelphia ($40)</xf:label>
                <xf:value>BOS-PHI</xf:value>
            </xf:item>
        </xf:select1>
    </xf:group>

    <xf:group>
        <xf:label>Travel Date</xf:label>
        <xf:input ref="date" type="date" incremental="true"/>
    </xf:group>

    <xf:group>
        <xf:label>Number of Passengers (1-10)</xf:label>
        <xf:input ref="passengers" incremental="true" size="3"/>
        <xf:range ref="passengers" start="1" end="10" step="1" incremental="true"/>
    </xf:group>

    <xf:group>
        <xf:label>Phone Number (optional)</xf:label>
        <xf:input ref="phone" incremental="true"/>
    </xf:group>

    <xf:group>
        <xf:output ref="fare-per-person" label="Fare per person: $"/>
        <xf:output ref="total-fare" label="Total Fare: $"/>
    </xf:group>

    <xf:submit submission="submit-booking">
        <xf:label>🚍 Book Tickets Now</xf:label>
    </xf:submit>

</xf:xform>`;

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
    await expect(page.locator("#saxonforms-source-editor")).toHaveValue(/<xsl:stylesheet/, { timeout: renderTimeoutMs });
    await expect(page.locator("#saxonforms-source-highlight .xml-tag-name").first()).toBeVisible({ timeout: renderTimeoutMs });
    await expect(page.locator("#stylesheet-source-select")).toHaveValue("precompiled");
    await expect(page.locator("#xforms-source-editor")).toHaveValue(/<xf:xform/);
    await expect(page.locator("#xForm .xforms-input").first()).toBeVisible({ timeout: renderTimeoutMs });
    await expect(page.locator("#fiddle-console")).toContainText("Render complete.");
  });

  test("compile enables compiled source mode and uses compiled snapshot", async ({ page }) => {
    test.slow();
    await page.goto(`${examplesServer.baseUrl}/xforms-fiddle.html`);
    await expect(page.locator("#xForm .xforms-input").first()).toBeVisible({ timeout: renderTimeoutMs });

    const sourceSelect = page.locator("#stylesheet-source-select");
    await expect(sourceSelect).toHaveValue("precompiled");
    await expect(sourceSelect.locator("option[value='compiled']")).toBeDisabled();

    await page.getByRole("button", { name: "Compile SaxonForms" }).click();
    await expect(page.locator("#fiddle-console")).toContainText("Compile complete. Using compiled source v1.", { timeout: compileTimeoutMs });
    await expect(sourceSelect).toHaveValue("compiled");
    await expect(sourceSelect.locator("option[value='compiled']")).not.toBeDisabled();

    const saxonFormsEditor = page.locator("#saxonforms-source-editor");
    await saxonFormsEditor.fill("<xsl:stylesheet");
    await expect(sourceSelect).toHaveValue("compiled");

    await page.getByRole("button", { name: "Refresh XForms" }).click();
    const compiledInput = page.locator("#xForm input.xforms-input").first();
    await expect(compiledInput).toBeVisible({ timeout: renderTimeoutMs });
    await compiledInput.fill("Compiled Alice");
    await compiledInput.blur();
    await expect(page.locator("#xForm .xforms-output").first()).toContainText("Compiled Alice", { timeout: renderTimeoutMs });
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

  test("refreshing same bind-heavy source twice does not fail", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => {
      pageErrors.push(String(error));
    });

    await page.goto(`${examplesServer.baseUrl}/xforms-fiddle.html`);
    await expect(page.locator("#xForm .xforms-input").first()).toBeVisible({ timeout: renderTimeoutMs });

    await page.locator("#xforms-source-editor").fill(busBookingXFormsSource);

    await page.getByRole("button", { name: "Refresh XForms" }).click();
    await expect(page.locator("#fiddle-console")).toContainText("Render complete.", { timeout: renderTimeoutMs });
    await expect(page.locator("#fiddle-console")).not.toContainText("Transformation failure");
    await expect(page.locator("#fiddle-console")).not.toContainText("XTTE0570");

    await page.getByRole("button", { name: "Refresh XForms" }).click();
    await expect(page.locator("#fiddle-console")).toContainText("Render complete.", { timeout: renderTimeoutMs });
    await expect(page.locator("#fiddle-console")).not.toContainText("Transformation failure");
    await expect(page.locator("#fiddle-console")).not.toContainText("XTTE0570");
    await expect(page.locator("#xForm .xforms-input").first()).toBeVisible({ timeout: renderTimeoutMs });

    expect(pageErrors).toEqual([]);
  });
});
