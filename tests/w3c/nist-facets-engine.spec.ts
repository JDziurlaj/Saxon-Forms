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
  targetNamespace: string;
  lexicalValue: string;
};
type UnsupportedGroup = {
  facet: string;
  group: string;
  reason: string;
};

type EngineCaseBuildResult = {
  selectedCount: number;
  runnableCases: EngineCase[];
  unsupportedGroups: UnsupportedGroup[];
};

function loadManifest(): Manifest {
  const manifestPath = path.resolve(repoRoot, "tests/w3c/nist-simpletype-facets.manifest.json");
  return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Manifest;
}

function extractSchemaTargetNamespace(schemaXml: string): string {
  const schemaMatch = schemaXml.match(/<(?:\w+:)?schema\b[^>]*\btargetNamespace="([^"]+)"/);
  return schemaMatch?.[1] ?? "";
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

function analyzeSchemaRootAndType(schemaXml: string): { ok: true; rootName: string; typeName: string } | { ok: false; reason: string } {
  const elementMatch = schemaXml.match(/<(?:\w+:)?element\b[^>]*\bname="([^"]+)"[^>]*\btype="([^"]+)"/);
  if (!elementMatch) {
    return { ok: false, reason: "schema has no top-level element with both @name and @type" };
  }
  return { ok: true, rootName: elementMatch[1], typeName: elementMatch[2] };
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
  // TEST-TRACE: use local-name() nodesets so generated tests work for namespaced NIST roots; helps tests/w3c/nist-facets-engine.spec.ts expanded manifest coverage.
  const rootNodeset = `/*[local-name()='${caseDef.rootName}']`;
  const rootQName = caseDef.targetNamespace ? `nist:${caseDef.rootName}` : caseDef.rootName;
  const rootNamespaceDecl = caseDef.targetNamespace ? ` xmlns:nist="${xmlEscape(caseDef.targetNamespace)}"` : "";
  const schemaLocationNs = caseDef.targetNamespace || "urn:nist";
  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:xforms="http://www.w3.org/2002/xforms"
      xmlns:ev="http://www.w3.org/2001/xml-events">
  <head>
    <title>NIST ${xmlEscape(caseDef.title)}</title>
    <xforms:model>
      <xforms:instance id="nist">
        <${rootQName}${rootNamespaceDecl} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="${xmlEscape(schemaLocationNs)} ${schemaLiteral}">${valueLiteral}</${rootQName}>
      </xforms:instance>
      <xforms:bind nodeset="${rootNodeset}" type="${xmlEscape(caseDef.typeName)}"/>
      ${inlineSchema}
      <xforms:submission id="nist-submit" instance="nist" resource="/echo.sh" method="post"/>
    </xforms:model>
  </head>
  <body>
    <xforms:input ref="${rootNodeset}" incremental="true">
      <xforms:label>Value</xforms:label>
    </xforms:input>
    <xforms:submit submission="nist-submit">
      <xforms:label>Submit</xforms:label>
    </xforms:submit>
  </body>
</html>`;
}

function buildEngineCases(): EngineCaseBuildResult {
  const manifest = loadManifest();
  const testsetPath = path.resolve(repoRoot, manifest.source_test_set);
  const testsetDir = path.dirname(testsetPath);
  const testsetXml = fs.readFileSync(testsetPath, "utf8");
  const selected = selectGroups(manifest);
  const runnableCases: EngineCase[] = [];
  const unsupportedGroups: UnsupportedGroup[] = [];
  for (const row of selected) {
    const groupBody = extractGroupBody(testsetXml, row.group);
    const schemaHref = extractSchemaHref(groupBody);
    const instanceCases = extractInstanceCases(groupBody);
    const preferredValidity = row.origin === "valid_groups";
    const chosen = instanceCases.find((c) => c.expectedValid === preferredValidity) ?? instanceCases[0];
    if (!chosen) {
      // TEST-TRACE: classify groups with no instance cases as unsupported; helps tests/w3c/nist-facets-engine.spec.ts "NIST facets through Saxon-Forms engine".
      unsupportedGroups.push({ facet: row.facet, group: row.group, reason: "group has no instanceTest cases" });
      continue;
    }

    const schemaPath = path.resolve(testsetDir, schemaHref);
    const instancePath = path.resolve(testsetDir, chosen.href);
    const schemaText = fs.readFileSync(schemaPath, "utf8");
    const instanceText = fs.readFileSync(instancePath, "utf8");
    const shape = analyzeSchemaRootAndType(schemaText);
    if (!shape.ok) {
      // TEST-TRACE: skip unsupported schema shapes instead of throwing; helps tests/w3c/nist-facets-engine.spec.ts expanded non-complex manifest run.
      unsupportedGroups.push({ facet: row.facet, group: row.group, reason: shape.reason });
      continue;
    }

    runnableCases.push({
      caseId: `${row.facet}-${row.group}`,
      title: `${row.facet} / ${row.group}`,
      expectedValid: chosen.expectedValid,
      schemaText,
      schemaHref,
      typeName: shape.typeName,
      rootName: shape.rootName,
      // TEST-TRACE: preserve schema targetNamespace so generated instance QName matches element declaration; helps tests/w3c/nist-facets-engine.spec.ts atomic-QName* groups.
      targetNamespace: extractSchemaTargetNamespace(schemaText),
      lexicalValue: extractInstanceLexicalValue(instanceText),
    });
  }
  return { selectedCount: selected.length, runnableCases, unsupportedGroups };
}

const buildResult = buildEngineCases();
const engineCases = buildResult.runnableCases;
const unsupportedGroups = buildResult.unsupportedGroups;

test.describe("NIST facets through Saxon-Forms engine", () => {
  test.describe.configure({ mode: "serial" });

  test("manifest selection partitions into runnable and unsupported groups", async () => {
    // TEST-TRACE: guard against module-load abort regressions when manifest scope expands; helps tests/w3c/nist-facets-engine.spec.ts "NIST facets through Saxon-Forms engine".
    expect(engineCases.length + unsupportedGroups.length).toBe(buildResult.selectedCount);
    expect(engineCases.length).toBeGreaterThan(0);
  });

  test.beforeAll(async () => {
    if (!unsupportedGroups.length) return;
    const sample = unsupportedGroups.slice(0, 10).map((g) => `${g.group} (${g.reason})`).join(", ");
    // TEST-TRACE: emit one-time unsupported-group diagnostics for expanded manifest triage; helps tests/w3c/nist-facets-engine.spec.ts "NIST facets through Saxon-Forms engine".
    console.warn(`[nist-engine] runnable=${engineCases.length} unsupported=${unsupportedGroups.length} selected=${buildResult.selectedCount}`);
    console.warn(`[nist-engine] unsupported sample: ${sample}`);
  });
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
