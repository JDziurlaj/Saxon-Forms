#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

function parseArgs(argv) {
  const args = {
    manifest: "tests/w3c/nist-simpletype-facets.manifest.json",
    validatorCmd: 'xmllint --noout --schema "{schema}" "{instance}"',
    schemaValidatorCmd: "",
    engine: "saxonforms",
    facets: [],
    maxGroups: 0,
    listOnly: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--manifest") args.manifest = argv[++i];
    else if (arg === "--validator-cmd") args.validatorCmd = argv[++i];
    else if (arg === "--schema-validator-cmd") args.schemaValidatorCmd = argv[++i];
    else if (arg === "--engine") args.engine = argv[++i];
    else if (arg === "--facet") args.facets.push(argv[++i]);
    else if (arg === "--max-groups") args.maxGroups = Number(argv[++i] || "0");
    else if (arg === "--list-only") args.listOnly = true;
    else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/run-nist-facet-harness.mjs [options]
Options:
  --manifest <path>              Manifest JSON path
  --validator-cmd <template>     Instance validator command (uses {schema}, {instance})
  --schema-validator-cmd <tmpl>  Optional schema validator command (uses {schema})
  --engine <saxonforms|xmllint>  Validation engine for instance tests (default: saxonforms)
  --facet <name>                 Restrict to facet (repeatable)
  --max-groups <n>               Limit selected groups
  --list-only                    Select and list tests without executing validators`);
}

function getRepoRoot() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(scriptDir, "..");
}

function loadManifest(manifestPath) {
  const text = fs.readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(text);
  if (!manifest.source_test_set || !manifest.facets) {
    throw new Error("Manifest must contain source_test_set and facets.");
  }
  return manifest;
}

function selectGroups(manifest, facetsFilter) {
  const selectedFacetNames = facetsFilter.length ? facetsFilter : Object.keys(manifest.facets);
  const missing = selectedFacetNames.filter((name) => !(name in manifest.facets));
  if (missing.length) {
    throw new Error(`Facet(s) not found in manifest: ${missing.join(", ")}`);
  }
  const rows = [];
  for (const facet of selectedFacetNames) {
    const payload = manifest.facets[facet] ?? {};
    for (const group of payload.valid_groups ?? []) rows.push({ facet, origin: "valid_groups", group });
    for (const group of payload.invalid_groups ?? []) rows.push({ facet, origin: "invalid_groups", group });
  }
  const seen = new Set();
  const deduped = [];
  for (const row of rows) {
    if (seen.has(row.group)) continue;
    seen.add(row.group);
    deduped.push(row);
  }
  return deduped;
}

function extractGroupBlocks(xml) {
  const groups = new Map();
  const groupRe = /<testGroup\b[^>]*\bname="([^"]+)"[^>]*>([\s\S]*?)<\/testGroup>/g;
  let m;
  while ((m = groupRe.exec(xml)) !== null) {
    groups.set(m[1], m[2]);
  }
  return groups;
}

function extractExpectedValidity(block) {
  const match = block.match(/<expected\b[^>]*\bvalidity="(valid|invalid)"/);
  if (!match) throw new Error("Missing <expected validity=...> in test metadata.");
  return match[1] === "valid";
}

function extractSchemaTests(groupBody, testsetDir) {
  const tests = [];
  const re = /<schemaTest\b[^>]*\bname="([^"]+)"[^>]*>([\s\S]*?)<\/schemaTest>/g;
  let m;
  while ((m = re.exec(groupBody)) !== null) {
    const name = m[1];
    const body = m[2];
    const hrefMatch = body.match(/<schemaDocument\b[^>]*\bxlink:href="([^"]+)"/);
    if (!hrefMatch) continue;
    tests.push({
      kind: "schema",
      name,
      expectedValid: extractExpectedValidity(body),
      schema: path.resolve(testsetDir, hrefMatch[1]),
    });
  }
  return tests;
}

function extractInstanceTests(groupBody, testsetDir) {
  const tests = [];
  const re = /<instanceTest\b[^>]*\bname="([^"]+)"[^>]*>([\s\S]*?)<\/instanceTest>/g;
  let m;
  while ((m = re.exec(groupBody)) !== null) {
    const name = m[1];
    const body = m[2];
    const hrefMatch = body.match(/<instanceDocument\b[^>]*\bxlink:href="([^"]+)"/);
    if (!hrefMatch) continue;
    tests.push({
      kind: "instance",
      name,
      expectedValid: extractExpectedValidity(body),
      instance: path.resolve(testsetDir, hrefMatch[1]),
    });
  }
  return tests;
}

function runTemplate(template, replacements) {
  let cmd = template;
  for (const [key, value] of Object.entries(replacements)) {
    cmd = cmd.replaceAll(`{${key}}`, value);
  }
  const proc = spawnSync(cmd, { shell: true, encoding: "utf8" });
  const output = `${proc.stdout ?? ""}${proc.stderr ?? ""}`.trim();
  return { ok: proc.status === 0, detail: output };
}
function runSaxonFormsInstanceCheck(checkerPath, schemaPath, instancePath) {
  const proc = spawnSync("npx", [
    "xslt3",
    `-xsl:${checkerPath}`,
    "-it:main",
    `schema-uri=${schemaPath}`,
    `instance-uri=${instancePath}`,
  ], { encoding: "utf8" });
  const output = `${proc.stdout ?? ""}${proc.stderr ?? ""}`.trim();
  const m = output.match(/<result\b[^>]*\bvalid="(true|false)"/);
  if (proc.status !== 0 || !m) {
    return { ok: false, actualValid: false, detail: output || "unable to parse SaxonForms checker output" };
  }
  return { ok: true, actualValid: m[1] === "true", detail: output };
}


function main() {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = getRepoRoot();
  const manifestPath = path.resolve(repoRoot, args.manifest);
  const checkerPath = path.resolve(repoRoot, "scripts/nist-xsd-instance-check.xsl");
  if (!fs.existsSync(manifestPath)) throw new Error(`Manifest not found: ${manifestPath}`);
  const manifest = loadManifest(manifestPath);
  const testsetPath = path.resolve(repoRoot, manifest.source_test_set);
  if (!fs.existsSync(testsetPath)) throw new Error(`Source testSet not found: ${testsetPath}`);
  const testsetXml = fs.readFileSync(testsetPath, "utf8");
  const groupsIndex = extractGroupBlocks(testsetXml);
  let selected = selectGroups(manifest, args.facets);
  if (args.maxGroups > 0) selected = selected.slice(0, args.maxGroups);

  console.log(`manifest=${manifestPath}`);
  console.log(`testset=${testsetPath}`);
  console.log(`selected_groups=${selected.length}`);

  const missing = selected.filter((row) => !groupsIndex.has(row.group));
  if (missing.length) {
    console.error("Missing groups in source testSet:");
    for (const row of missing) console.error(`  - ${row.group}`);
    process.exit(2);
  }

  const allResults = [];
  if (!["saxonforms", "xmllint"].includes(args.engine)) throw new Error(`Unsupported --engine value: ${args.engine}`);
  for (const row of selected) {
    const groupBody = groupsIndex.get(row.group);
    const schemaCases = extractSchemaTests(groupBody, path.dirname(testsetPath));
    const instanceCases = extractInstanceTests(groupBody, path.dirname(testsetPath));
    const schemaCase = schemaCases[0] ?? null;
    const groupCases = [...schemaCases, ...instanceCases];

    for (const c of groupCases) {
      if (args.listOnly) {
        allResults.push({ ...c, passed: true, skipped: true, actualValid: null, detail: "list-only" });
        continue;
      }
      if (c.kind === "schema") {
        if (args.engine === "saxonforms") {
          allResults.push({
            ...c,
            passed: true,
            skipped: true,
            actualValid: null,
            detail: "schema test skipped for saxonforms engine",
          });
          continue;
        }
        if (!args.schemaValidatorCmd) {
          allResults.push({
            ...c,
            passed: true,
            skipped: true,
            actualValid: null,
            detail: "schema-validator-cmd not provided; schema test skipped",
          });
          continue;
        }
        const result = runTemplate(args.schemaValidatorCmd, { schema: c.schema });
        const actualValid = result.ok;
        allResults.push({ ...c, actualValid, passed: actualValid === c.expectedValid, skipped: false, detail: result.detail });
        continue;
      }
      if (!schemaCase?.schema) {
        allResults.push({ ...c, passed: false, skipped: true, actualValid: null, detail: `missing schemaTest in group ${row.group}` });
        continue;
      }
      if (args.engine === "saxonforms") {
        // TEST-TRACE: run instance checks through Saxon-Forms xsd-helpers facet logic; helps NIST facet manifest execution.
        const result = runSaxonFormsInstanceCheck(checkerPath, schemaCase.schema, c.instance);
        const actualValid = result.actualValid;
        allResults.push({ ...c, actualValid, passed: result.ok && actualValid === c.expectedValid, skipped: false, detail: result.detail });
        continue;
      }
      const result = runTemplate(args.validatorCmd, { schema: schemaCase.schema, instance: c.instance });
      const actualValid = result.ok;
      allResults.push({ ...c, actualValid, passed: actualValid === c.expectedValid, skipped: false, detail: result.detail });
    }

    const own = allResults.slice(allResults.length - groupCases.length);
    const passed = own.filter((r) => r.passed).length;
    const skipped = own.filter((r) => r.skipped).length;
    console.log(
      `[group] facet=${row.facet} origin=${row.origin} name=${row.group} cases=${groupCases.length} passed=${passed} skipped=${skipped}`,
    );
  }

  const total = allResults.length;
  const passed = allResults.filter((r) => r.passed).length;
  const skipped = allResults.filter((r) => r.skipped).length;
  const failed = allResults.filter((r) => !r.passed && !r.skipped);
  console.log(`[summary] total=${total} passed=${passed} failed=${failed.length} skipped=${skipped}`);
  for (const r of failed.slice(0, 30)) {
    console.log(
      `[fail] kind=${r.kind} name=${r.name} expected=${r.expectedValid ? "valid" : "invalid"} actual=${r.actualValid ? "valid" : "invalid"}`,
    );
    if (r.detail) console.log(`       detail=${String(r.detail).slice(0, 500)}`);
  }
  process.exit(failed.length ? 1 : 0);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}
