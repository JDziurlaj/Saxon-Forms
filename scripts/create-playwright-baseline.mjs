#!/usr/bin/env node
/**
 * create-playwright-baseline.mjs
 *
 * CLI tool to generate Playwright test baselines for regression-gate.
 *
 * Usage:
 *   node scripts/create-playwright-baseline.mjs [--suite <id[,id]>] [--mandatory] [--all]
 *
 * Options:
 *   --suite <id[,id]>   Run baseline for one or more suite IDs (comma-separated)
 *   --mandatory         Run baseline for all mandatory suites (from suites.json)
 *   --all               Run baseline for all suites in registry
 *   --help, -h          Show this help message
 *
 * Default behavior: initializes baseline for default_suite_id in suites.json.
 *
 * Examples:
 *   node scripts/create-playwright-baseline.mjs --suite w3c-core
 *   node scripts/create-playwright-baseline.mjs --all
 *   node scripts/create-playwright-baseline.mjs --mandatory
 *
 * This script:
 *   - Selects suites from .agents/skills/regression-gate/playwright/suites.json
 *   - Prepares W3C data if needed
 *   - Compiles SEF and copies to test-app
 *   - Runs Playwright for each suite and writes JSON baseline
 *   - Evaluates results and writes summary
 */
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRootNative = path.resolve(__dirname, "..");

function toMntPath(inputPath) {
  if (inputPath.startsWith("/mnt/")) return inputPath;
  const match = inputPath.match(/^\/([a-zA-Z])\/(.*)$/);
  if (!match) return inputPath;
  return `/mnt/${match[1].toLowerCase()}/${match[2]}`;
}

const repoRoot = toMntPath(repoRootNative);

const suitesPath = path.join(
  repoRoot,
  ".agents",
  "skills",
  "regression-gate",
  "playwright",
  "suites.json"
);
const evaluatorPath = path.join(
  repoRoot,
  ".agents",
  "skills",
  "regression-gate",
  "scripts",
  "evaluate_playwright_baseline.mjs"
);
const fetchW3CPath = path.join(repoRoot, "scripts", "fetch-w3c-suite.sh");
const sefPath = path.join(repoRoot, "sef", "saxon-xforms.sef.json");
const testAppSefPath = path.join(repoRoot, "test-app", "sef", "saxon-xforms.sef.json");

function fail(message) {
  console.error(message);
  process.exit(1);
}
function resolveSuitePath(inputPath) {
  if (!inputPath) return inputPath;
  return path.isAbsolute(inputPath) ? inputPath : path.resolve(repoRootNative, inputPath);
}

function toRepoRelative(inputPath) {
  const relative = path.relative(repoRootNative, inputPath);
  if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
    return relative.split(path.sep).join("/");
  }
  return inputPath;
}

function run(command, args, options = {}) {
  const { cwd = repoRoot, allowFailure = false, stdio = "inherit" } = options;
  const result = spawnSync(command, args, { cwd, stdio, encoding: "utf8" });
  if (result.error) {
    fail(`Failed to run ${command}: ${result.error.message}`);
  }
  if (!allowFailure && result.status !== 0) {
    fail(`Command failed (${result.status}): ${command} ${args.join(" ")}`);
  }
  return result;
}

function timestampUtcCompact() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function collectSpecs(suites, parentTitles = []) {
  const collected = [];
  for (const suite of suites || []) {
    const title = suite?.title || "";
    const nextParents =
      title && !title.endsWith(".spec.ts") ? [...parentTitles, title] : parentTitles;

    for (const spec of suite?.specs || []) {
      const specTitle = spec?.title || "(unnamed test)";
      const displayTitle = nextParents.length
        ? `${nextParents.join(" › ")} › ${specTitle}`
        : specTitle;
      const statuses = (spec?.tests || []).map((t) => t?.status).filter(Boolean);
      const failedFromStatus = statuses.some((s) =>
        ["unexpected", "flaky", "timedOut", "interrupted"].includes(s)
      );
      const failed = failedFromStatus || spec?.ok === false;
      collected.push({ title: displayTitle, failed });
    }

    collected.push(...collectSpecs(suite?.suites || [], nextParents));
  }
  return collected;
}

function parseArgs(argv) {
  const suiteIds = [];
  let all = false;
  let mandatory = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--suite") {
      const value = argv[i + 1];
      if (!value) fail("Missing value for --suite <suite-id[,suite-id]>");
      suiteIds.push(
        ...value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      );
      i++;
      continue;
    }
    if (arg === "--all") {
      all = true;
      continue;
    }
    if (arg === "--mandatory") {
      mandatory = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log(
        "Usage: node scripts/create-playwright-baseline.mjs [--suite <id[,id]>] [--mandatory] [--all]\n" +
        "Default behavior: initialize baseline for default_suite_id in suites.json."
      );
      process.exit(0);
    }
    fail(`Unknown argument: ${arg}`);
  }

  return { suiteIds: [...new Set(suiteIds)], all, mandatory };
}

if (!fs.existsSync(suitesPath)) {
  fail(`Suite registry not found: ${suitesPath}`);
}

const suiteRegistry = JSON.parse(fs.readFileSync(suitesPath, "utf8"));
const rawSuiteMap = suiteRegistry?.suites || {};
const suiteMap = Object.fromEntries(
  Object.entries(rawSuiteMap).map(([suiteId, suiteConfig]) => [
    suiteId,
    {
      ...suiteConfig,
      config_path: resolveSuitePath(suiteConfig.config_path),
      test_path: resolveSuitePath(suiteConfig.test_path),
      baseline_path: resolveSuitePath(suiteConfig.baseline_path)
    }
  ])
);
const allSuiteIds = Object.keys(suiteMap);
if (allSuiteIds.length === 0) {
  fail(`No suites found in registry: ${suitesPath}`);
}

const { suiteIds: requestedSuiteIds, all, mandatory } = parseArgs(process.argv.slice(2));

let selectedSuiteIds = [];
if (all) {
  selectedSuiteIds = allSuiteIds;
} else if (requestedSuiteIds.length > 0) {
  selectedSuiteIds = requestedSuiteIds;
} else if (mandatory && Array.isArray(suiteRegistry?.mandatory_suite_ids) && suiteRegistry.mandatory_suite_ids.length > 0) {
  selectedSuiteIds = suiteRegistry.mandatory_suite_ids;
} else if (suiteRegistry?.default_suite_id) {
  selectedSuiteIds = [suiteRegistry.default_suite_id];
} else if (Array.isArray(suiteRegistry?.mandatory_suite_ids) && suiteRegistry.mandatory_suite_ids.length > 0) {
  selectedSuiteIds = suiteRegistry.mandatory_suite_ids;
}

selectedSuiteIds = [...new Set(selectedSuiteIds)];
if (selectedSuiteIds.length === 0) {
  fail("No suite IDs selected for baseline generation.");
}

for (const suiteId of selectedSuiteIds) {
  if (!suiteMap[suiteId]) {
    fail(`Unknown suite ID: ${suiteId}`);
  }
}

const workers = Math.max(1, Math.floor((os.cpus()?.length || 1) * 0.75));
const playwrightTimeoutMs = Number(process.env.BASELINE_PLAYWRIGHT_TIMEOUT_MS || 1200000);

console.log(
  JSON.stringify(
    {
      selected_suites: selectedSuiteIds,
      workers,
      playwright_timeout_ms: playwrightTimeoutMs
    },
    null,
    2
  )
);

const needsW3CData = selectedSuiteIds.some((suiteId) => suiteId.startsWith("w3c-"));
if (needsW3CData) {
  console.log("Preparing W3C test data...");
  run("bash", [fetchW3CPath]);
  const linkPath = path.join(repoRoot, "test-app", "w3c-suite");
  if (!fs.existsSync(linkPath)) {
    fs.symlinkSync(path.resolve(repoRoot, "public-test", "w3c-suite"), linkPath, "junction");
  }
}
console.log("Compiling/refreshing SEF...");

const compileResult = run(
  "npx",
  [
    "xslt3",
    "-t",
    `-xsl:${path.join(repoRoot, "src", "saxon-xforms.xsl")}`,
    `-export:${sefPath}`,
    "-nogo",
    "-ns:##html5"
  ],
  { allowFailure: true }
);
if (compileResult.status !== 0) {
  if (!fs.existsSync(sefPath)) {
    fail(
      "Stylesheet compilation failed and no existing SEF is available at " +
      `${sefPath} to continue baseline generation.`
    );
  }
  console.warn(
    "SEF compilation failed in this environment; continuing with existing " +
    `${sefPath}`
  );
}
fs.copyFileSync(sefPath, testAppSefPath);

const summaries = [];

for (const suiteId of selectedSuiteIds) {
  const suite = suiteMap[suiteId];
  const startedAt = Date.now();
  const runDir = path.join(
    repoRoot,
    ".agents",
    "skills",
    "regression-gate",
    "runs",
    suiteId,
    timestampUtcCompact()
  );
  fs.mkdirSync(runDir, { recursive: true });

  const reportPath = path.join(runDir, "playwright-report.json");
  const stderrPath = path.join(runDir, "playwright-stderr.log");
  const comparisonPath = path.join(runDir, "comparison.json");

  const reportFd = fs.openSync(reportPath, "w");
  const stderrFd = fs.openSync(stderrPath, "w");

  console.log(`Running Playwright for suite '${suiteId}'...`);

  const playwrightResult = spawnSync(
    "npx",
    [
      "--prefix",
      repoRoot,
      "playwright",
      "test",
      "--workers",
      String(workers),
      "--config",
      suite.config_path,
      suite.test_path,
      "--reporter=json"
    ],
    {
      cwd: repoRoot,
      stdio: ["ignore", reportFd, stderrFd],
      encoding: "utf8",
      timeout: playwrightTimeoutMs
    }
  );

  fs.closeSync(reportFd);
  fs.closeSync(stderrFd);

  if (playwrightResult.error) {
    if (playwrightResult.error.code === "ETIMEDOUT") {
      fail(
        `Playwright timed out for suite ${suiteId} after ${playwrightTimeoutMs}ms. ` +
        `Increase BASELINE_PLAYWRIGHT_TIMEOUT_MS if needed.`
      );
    }
    fail(`Playwright failed for suite ${suiteId}: ${playwrightResult.error.message}`);
  }
  if (!fs.existsSync(reportPath) || fs.statSync(reportPath).size === 0) {
    fail(
      `No Playwright JSON report produced for suite ${suiteId}. ` +
      `Check ${stderrPath} for details.`
    );
  }

  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const specs = collectSpecs(report?.suites || []);
  const failures = [...new Set(specs.filter((s) => s.failed).map((s) => s.title))].sort();
  const stats = report?.stats || {};

  const baseline = {
    suite_id: suiteId,
    test_path: toRepoRelative(suite.test_path),
    config_path: toRepoRelative(suite.config_path),
    last_updated: new Date().toISOString(),
    stats: {
      total:
        (stats.expected || 0) +
        (stats.unexpected || 0) +
        (stats.flaky || 0) +
        (stats.skipped || 0),
      passed: stats.expected || 0,
      failed: stats.unexpected || 0,
      flaky: stats.flaky || 0,
      skipped: stats.skipped || 0
    },
    allowed_failures: failures
  };

  fs.mkdirSync(path.dirname(suite.baseline_path), { recursive: true });
  fs.writeFileSync(suite.baseline_path, JSON.stringify(baseline, null, 2) + "\n");

  run("node", [
    evaluatorPath,
    "--report",
    reportPath,
    "--baseline",
    suite.baseline_path,
    "--out",
    comparisonPath
  ]);

  summaries.push({
    suite_id: suiteId,
    policy: suite.regression_policy || null,
    workers,
    playwright_exit_code: playwrightResult.status,
    run_dir: toRepoRelative(runDir),
    baseline_path: toRepoRelative(suite.baseline_path),
    stats: baseline.stats,
    allowed_failures_count: baseline.allowed_failures.length,
    duration_seconds: Math.round((Date.now() - startedAt) / 1000)
  });
  console.log(`Baseline written for '${suiteId}' -> ${toRepoRelative(suite.baseline_path)}`);
  console.log(`Baseline written for '${suiteId}' -> ${suite.baseline_path}`);
}

console.log(
  JSON.stringify(
    {
      created_at: new Date().toISOString(),
      selected_suites: selectedSuiteIds,
      summaries
    },
    null,
    2
  )
);
