import { test, expect, RENDER_TIMEOUT } from "../xforms/w3c/helpers";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SaxonJS 3 ixsl:promise migration coverage.
 *
 * Verifies the three migrated async paths end-to-end against the live engine:
 *   1. HTTP submission via ixsl:promise (ixsl:http-request) with on-completion
 *      data phase + deferred-drain event dispatch and refresh.
 *   2. Non-2xx responses dispatching xforms-submit-error with context properties.
 *   3. Transport failures firing the on-failure handler (xforms:serverError)
 *      with resource-uri reaching the submit-error context.
 *   4. Delayed xf:dispatch via ixsl:sleep with event name and context carried
 *      by partial application.
 *   5. xf:upload via the Promise-returning readFileAsXMLAsync helper, with the
 *      deferred drain projecting the replaced instance into the DOM.
 */

// Virtual test files served from <PM_BASE> under the w3c-suite directory;
// the runner itself prefixes "/w3c-suite/" onto the ?test= value.
const PM_BASE = "pm";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSubmissionXhtml(action: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<xhtml:html xmlns:ev="http://www.w3.org/2001/xml-events"
            xmlns:xforms="http://www.w3.org/2002/xforms"
            xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xhtml:head>
    <xhtml:title>promise migration submission</xhtml:title>
    <xforms:model>
      <xforms:instance id="data">
        <data xmlns=""><item>original</item></data>
      </xforms:instance>
      <xforms:instance id="error_catcher">
        <sub_error xmlns="">
          <error_name/>
          <error_info/>
          <error_code/>
        </sub_error>
      </xforms:instance>
      <xforms:submission action="${escapeXml(action)}" id="sub_1" method="post"
                         ref="instance('data')" replace="instance" instance="data">
        <xforms:action ev:event="xforms-submit-error">
          <xforms:setvalue ref="instance('error_catcher')/error_name" value="event('error-type')"/>
          <xforms:setvalue ref="instance('error_catcher')/error_info" value="event('resource-uri')"/>
          <xforms:setvalue ref="instance('error_catcher')/error_code" value="event('response-status-code')"/>
        </xforms:action>
      </xforms:submission>
    </xforms:model>
  </xhtml:head>
  <xhtml:body>
    <xforms:group>
      <xforms:label class="title">promise migration submission</xforms:label>
    </xforms:group>
    <xforms:submit submission="sub_1">
      <xforms:label>Submit</xforms:label>
    </xforms:submit>
    <xforms:output ref="instance('data')/item">
      <xforms:label>Item: </xforms:label>
    </xforms:output>
    <xforms:output ref="instance('error_catcher')/error_name">
      <xforms:label>Error Name: </xforms:label>
    </xforms:output>
    <xforms:output ref="instance('error_catcher')/error_info">
      <xforms:label>Error Info: </xforms:label>
    </xforms:output>
    <xforms:output ref="instance('error_catcher')/error_code">
      <xforms:label>Error Code: </xforms:label>
    </xforms:output>
  </xhtml:body>
</xhtml:html>`;
}

const DELAY_XHTML = `<?xml version="1.0" encoding="UTF-8"?>
<xhtml:html xmlns:ev="http://www.w3.org/2001/xml-events"
            xmlns:xforms="http://www.w3.org/2002/xforms"
            xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xhtml:head>
    <xhtml:title>promise migration delayed dispatch</xhtml:title>
    <xforms:model>
      <xforms:instance id="state">
        <state xmlns=""><fired>no</fired></state>
      </xforms:instance>
    </xforms:model>
  </xhtml:head>
  <xhtml:body>
    <xforms:group>
      <xforms:label class="title">promise migration delayed dispatch</xforms:label>
    </xforms:group>
    <xforms:trigger id="dispatch-trigger">
      <xforms:label>Dispatch Later</xforms:label>
      <xforms:action ev:event="DOMActivate">
        <xforms:dispatch name="late-event" targetid="late-target" delay="300"/>
      </xforms:action>
    </xforms:trigger>
    <xforms:group id="late-target">
      <xforms:label/>
      <xforms:action ev:event="late-event">
        <xforms:setvalue ref="instance('state')/fired" value="'yes'"/>
      </xforms:action>
    </xforms:group>
    <xforms:output ref="instance('state')/fired">
      <xforms:label>Fired: </xforms:label>
    </xforms:output>
  </xhtml:body>
</xhtml:html>`;

async function routeVirtualTest(page: Parameters<typeof test>[0]["page"], testPath: string, body: string) {
  // Match the runner's fetch URL ("/w3c-suite/<test>") only: a bare `**pm/...`
  // glob would also match the w3c-runner.html?test=pm/... navigation URL and
  // serve the raw XHTML instead of the runner page.
  await page.route(`**/w3c-suite/${PM_BASE}/${testPath}`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/xhtml+xml", body });
  });
}

test.describe("SaxonJS 3 promise migration", () => {
  test("submission promise completion replaces instance and refreshes outputs", async ({ page }) => {
    await routeVirtualTest(page, "pm-submit.xhtml", buildSubmissionXhtml("/pm-target"));
    await page.route("**/pm-target", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/xml",
        body: '<?xml version="1.0" encoding="UTF-8"?><data><item>replaced</item></data>',
      });
    });
    await page.goto(`/w3c-runner.html?test=${PM_BASE}/pm-submit.xhtml`);
    await expect(page.locator("#xForm")).not.toBeEmpty({ timeout: RENDER_TIMEOUT });

    await page.getByRole("button", { name: "Submit" }).click();

    // Promise completion runs the data phase (instance replace) and the deferred
    // drain dispatches xforms-submit-done + refresh, projecting the new value.
    await expect
      .poll(async () => page.locator("#xForm").innerText(), { timeout: 10_000 })
      .toContain("replaced");
    const text = await page.locator("#xForm").innerText();
    expect(text).toContain("Item: replaced");
    expect(text).not.toContain("resource-error");
  });

  test("non-2xx submission dispatches xforms-submit-error with context properties", async ({ page }) => {
    await routeVirtualTest(page, "pm-404.xhtml", buildSubmissionXhtml("/pm-target-404"));
    await page.route("**/pm-target-404", async (route) => {
      await route.fulfill({ status: 404, contentType: "text/plain", body: "Not Found" });
    });
    await page.goto(`/w3c-runner.html?test=${PM_BASE}/pm-404.xhtml`);
    await expect(page.locator("#xForm")).not.toBeEmpty({ timeout: RENDER_TIMEOUT });

    await page.getByRole("button", { name: "Submit" }).click();

    await expect
      .poll(async () => page.locator("#xForm").innerText(), { timeout: 10_000 })
      .toContain("resource-error");
    const text = await page.locator("#xForm").innerText();
    expect(text).toContain("Error Name: resource-error");
    expect(text).toContain("404");
    expect(text).toContain("pm-target-404");
  });

  test("transport failure fires on-failure handler with resource-uri in submit-error context", async ({ page }) => {
    // invaliduri.com8565 is routed to abort() by the deterministic network fixture.
    await routeVirtualTest(page, "pm-netfail.xhtml", buildSubmissionXhtml("http://invaliduri.com8565/pm-inval1d"));
    await page.goto(`/w3c-runner.html?test=${PM_BASE}/pm-netfail.xhtml`);
    await expect(page.locator("#xForm")).not.toBeEmpty({ timeout: RENDER_TIMEOUT });

    await page.getByRole("button", { name: "Submit" }).click();

    await expect
      .poll(async () => page.locator("#xForm").innerText(), { timeout: 10_000 })
      .toContain("resource-error");
    const text = await page.locator("#xForm").innerText();
    expect(text).toContain("Error Name: resource-error");
    expect(text).toContain("http://invaliduri.com8565/pm-inval1d");
  });

  test("delayed xf:dispatch fires after ixsl:sleep, not immediately", async ({ page }) => {
    await routeVirtualTest(page, "pm-delay.xhtml", DELAY_XHTML);
    await page.goto(`/w3c-runner.html?test=${PM_BASE}/pm-delay.xhtml`);
    await expect(page.locator("#xForm")).not.toBeEmpty({ timeout: RENDER_TIMEOUT });
    expect(await page.locator("#xForm").innerText()).toContain("Fired: no");

    await page.getByRole("button", { name: "Dispatch Later" }).click();

    // delay=300ms: the late-event must not have fired after only 100ms.
    await page.waitForTimeout(100);
    expect(await page.locator("#xForm").innerText()).toContain("Fired: no");

    // ... but must fire through the sleep promise + deferred drain well within 10s.
    await expect
      .poll(async () => page.locator("#xForm").innerText(), { timeout: 10_000 })
      .toContain("Fired: yes");
  });

  test("upload promise populates instance and projects it into the DOM", async ({ page }) => {
    await page.goto("/");
    const fileInput = page.locator("input[type='file'][data-ref=\"instance('upload-target')\"]");
    await expect(fileInput).toBeAttached({ timeout: RENDER_TIMEOUT });

    await fileInput.setInputFiles(path.resolve(__dirname, "../fixtures/upload-data.xml"));

    // The readFileAsXMLAsync promise replaces the instance; the deferred drain
    // runs the refresh cycle so the bound output renders the uploaded record labels
    // (the output bound to the instance root renders its string value).
    await expect
      .poll(async () => page.locator("#upload-result").innerText(), { timeout: 10_000 })
      .toContain("Record One");
  });
});
