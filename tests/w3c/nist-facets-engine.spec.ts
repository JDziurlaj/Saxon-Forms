import { test, expect, RENDER_TIMEOUT, submitAndCapture } from "./helpers";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

type ManifestFacetEntry = {
  valid_groups?: string[];
  invalid_groups?: string[];
};

type Manifest = {
  source_test_set: string;
  facets: Record<string, ManifestFacetEntry>;
};

type GroupSelection = {
  facet: string;
  origin: "valid_groups" | "invalid_groups";
  group: string;
};

type InstanceCase = {
  href: string;
  expectedValid: boolean;
};

type EngineCase = {
  caseId: string;
  title: string;
  expectedValid: boolean;
  schemaText: string;
  schemaHref: string;
  typeName: string;
  rootName: string;
  lexicalValue: string;
};

function loadManifest(): Manifest {
  const manifestPath = path.resolve(repoRoot, "tests/w3c/nist-simpletype-facets.manifest.json");
  return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Manifest;
}

function selectGroups(manifest: Manifest): GroupSelection[] {
  const rows: GroupSelection[] = [];
  for (const facet of Object.keys(manifest.facets)) {
    const payload = manifest.facets[facet] ?? {};
    for (const group of payload.valid_groups ?? []) rows.push({ facet, origin: "valid_groups", group });
    for (const group of payload.invalid_groups ?? []) rows.push({ facet, origin: "invalid_groups", group });
  }
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (seen.has(row.group)) return false;
    seen.add(row.group);
    return true;
  });
}

function extractGroupBody(testsetXml: string, groupName: string): string {
  const escaped = groupName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<testGroup\\b[^>]*\\bname=\"${escaped}\"[^>]*>([\\s\\S]*?)<\\/testGroup>`);
  const match = testsetXml.match(re);
  if (!match) throw new Error(`Missing group ${groupName} in source testSet`);
  return match[1];
}

function extractSchemaHref(groupBody: string): string {
  const match = groupBody.match(/<schemaDocument\b[^>]*\bxlink:href="([^"]+)"/);
  if (!match) throw new Error("Missing schemaDocument href");
  return match[1];
}

function extractInstanceCases(groupBody: string): InstanceCase[] {
  const out: InstanceCase[] = [];
  const re = /<instanceTest\b[^>]*>([\s\S]*?)<\/instanceTest>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(groupBody)) !== null) {
    const body = m[1];
    const hrefMatch = body.match(/<instanceDocument\b[^>]*\bxlink:href="([^"]+)"/);
    const validityMatch = body.match(/<expected\b[^>]*\bvalidity="(valid|invalid)"/);
    if (!hrefMatch || !validityMatch) continue;
    out.push({ href: hrefMatch[1], expectedValid: validityMatch[1] === "valid" });
  }
  return out;
}

function extractSchemaRootAndType(schemaXml: string): { rootName: string; typeName: string } {
  const elementMatch = schemaXml.match(/<xs:element\b[^>]*\bname="([^"]+)"[^>]*\btype="([^"]+)"/);
  if (!elementMatch) throw new Error("Unable to extract xs:element/@name and @type from schema");
  return { rootName: elementMatch[1], typeName: elementMatch[2] };
}

function extractInstanceLexicalValue(instanceXml: string): string {
  const noXmlDecl = instanceXml.replace(/^\s*<\?xml[^>]*>\s*/i, "");
  const rootMatch = noXmlDecl.match(/<[^!?][^>]*>([\s\S]*)<\/[^>]+>\s*$/);
  if (!rootMatch) return "";
  const inner = rootMatch[1];
  // NIST atomic instances contain only character content between root tags.
  return inner.replace(/^[\r\n\s]+|[\r\n\s]+$/g, "");
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildXhtml(caseDef: EngineCase): string {
  const valueLiteral = xmlEscape(caseDef.lexicalValue);
  const schemaLiteral = `schema-${encodeURIComponent(caseDef.caseId)}.xsd`;
  const inlineSchema = caseDef.schemaText.replace(/^\s*<\?xml[^>]*>\s*/i, "").trim();
  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:xforms="http://www.w3.org/2002/xforms"
      xmlns:ev="http://www.w3.org/2001/xml-events">
  <head>
    <title>NIST ${xmlEscape(caseDef.title)}</title>
    <xforms:model>
      <xforms:instance id="nist">
        <${caseDef.rootName} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:nist ${schemaLiteral}">${valueLiteral}</${caseDef.rootName}>
      </xforms:instance>
      <xforms:bind nodeset="/${caseDef.rootName}" type="${xmlEscape(caseDef.typeName)}"/>
      ${inlineSchema}
      <xforms:submission id="nist-submit" instance="nist" resource="/echo.sh" method="post"/>
    </xforms:model>
  </head>
  <body>
    <xforms:input ref="/${caseDef.rootName}" incremental="true">
      <xforms:label>Value</xforms:label>
    </xforms:input>
    <xforms:submit submission="nist-submit">
      <xforms:label>Submit</xforms:label>
    </xforms:submit>
  </body>
</html>`;
}

function buildEngineCases(): EngineCase[] {
  const manifest = loadManifest();
  const testsetPath = path.resolve(repoRoot, manifest.source_test_set);
  const testsetDir = path.dirname(testsetPath);
  const testsetXml = fs.readFileSync(testsetPath, "utf8");
  const selected = selectGroups(manifest);

  const cases: EngineCase[] = [];
  for (const row of selected) {
    const groupBody = extractGroupBody(testsetXml, row.group);
    const schemaHref = extractSchemaHref(groupBody);
    const instanceCases = extractInstanceCases(groupBody);
    const preferredValidity = row.origin === "valid_groups";
    const chosen = instanceCases.find((c) => c.expectedValid === preferredValidity) ?? instanceCases[0];
    if (!chosen) continue;

    const schemaPath = path.resolve(testsetDir, schemaHref);
    const instancePath = path.resolve(testsetDir, chosen.href);
    const schemaText = fs.readFileSync(schemaPath, "utf8");
    const instanceText = fs.readFileSync(instancePath, "utf8");
    const { rootName, typeName } = extractSchemaRootAndType(schemaText);

    cases.push({
      caseId: `${row.facet}-${row.group}`,
      title: `${row.facet} / ${row.group}`,
      expectedValid: chosen.expectedValid,
      schemaText,
      schemaHref,
      typeName,
      rootName,
      lexicalValue: extractInstanceLexicalValue(instanceText),
    });
  }
  return cases;
}

const engineCases = buildEngineCases();

test.describe("NIST facets through Saxon-Forms engine", () => {
  test.describe.configure({ mode: "serial" });

  for (const caseDef of engineCases) {
    test(`${caseDef.title} => ${caseDef.expectedValid ? "valid" : "invalid"}`, async ({ page }) => {
      const xhtmlPath = "**/w3c-suite/nist-generated/nist-case.xhtml*";
      await page.route(xhtmlPath, async (route) => {
        const url = new URL(route.request().url());
        const caseId = url.searchParams.get("caseId");
        if (caseId !== caseDef.caseId) {
          await route.fulfill({ status: 404, body: "unknown case" });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: "application/xhtml+xml",
          body: buildXhtml(caseDef),
        });
      });

      const testFile = `nist-generated/nist-case.xhtml?caseId=${encodeURIComponent(caseDef.caseId)}`;
      await page.goto(`/w3c-runner.html?test=${encodeURIComponent(testFile)}`);
      await expect(page.locator("#xForm")).not.toBeEmpty({ timeout: RENDER_TIMEOUT });

      const input = page.locator("#xForm input").first();
      await expect(input).toBeVisible();

      // TEST-TRACE: dispatch both input and change so Saxon-Forms updates instance before submit.
      await input.evaluate((node, value) => {
        const el = node as HTMLInputElement;
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }, caseDef.lexicalValue);

      const submitButton = page.getByRole("button", { name: "Submit" });
      const request = await submitAndCapture(page, submitButton, 1200);

      if (caseDef.expectedValid) {
        expect(request).not.toBeNull();
      } else {
        expect(request).toBeNull();
      }

      await page.unroute(xhtmlPath);
    });
  }
});
