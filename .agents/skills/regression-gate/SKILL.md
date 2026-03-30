---
name: regression-gate
description: Run compile + targeted + full regression checks for Saxon-Forms-fork using stored baselines, with mandatory no-regression enforcement for W3C suites and justification-only waivers for non-W3C suites.
---

# Regression Gate (Saxon-Forms-fork)

## When to use
Use this skill after any code change in `src/`, `test-app/xforms/`, `tests/`, or build/test config files.

## Goal
Prevent regressions by requiring:
1. successful stylesheet compilation,
2. targeted verification for changed behavior,
3. mandatory no-regression verification for W3C suites,
4. full suite verification against stored baseline snapshots (no baseline re-discovery runs).

## Playwright organization and persistent baseline artifacts
- Suite registry (source of truth for test organization):
  - `.agents/skills/regression-gate/playwright/suites.json`
- Baseline snapshots (one per suite):
  - `.agents/skills/regression-gate/baselines/<suite-id>.json`
- Baseline generation script (repeatable workflow):
  - `scripts/create-playwright-baseline.mjs`
  - npm alias: `npm run test:baseline`
- Run artifacts (timestamped):
  - `.agents/skills/regression-gate/runs/<suite-id>/<timestamp>/`
  - Must contain at least:
    - `playwright-report.json`
    - `comparison.json`
- W3C Playwright coverage lives in:
  - `tests/w3c/ch02.spec.ts` ... `tests/w3c/ch10.spec.ts`
  - `tests/w3c/appendix.spec.ts`

Do not infer baseline from ad-hoc reruns. Always compare to the stored baseline file for the selected suite.

## Baseline bootstrap commands
Use the repeatable baseline script for initialization/refresh instead of manual baseline JSON edits:
- default suite baseline:
  - `npm run test:baseline`
- specific suite baseline:
  - `npm run test:baseline -- --suite <suite-id>`
- mandatory suites from registry:
  - `npm run test:baseline -- --mandatory`
- all suites:
  - `npm run test:baseline -- --all`

## W3C-suite integrity policy (mandatory)
1. **Never modify W3C Working Group test documents.**
   - Files under the official `w3c-suite` corpus (`public-test/w3c-suite/**`, also exposed via `test-app/w3c-suite`) are immutable.
   - Under no circumstance should these `.xhtml` test documents be edited, rewritten, normalized, or reformatted.
2. **Playwright tests may be modified only when they mismatch W3C pass criteria.**
   - A Playwright assertion may be changed only if it does **not** correctly reflect the pass criteria in the corresponding `w3c-suite` `.xhtml`.
   - When changing Playwright tests, first read the corresponding `.xhtml`, identify the exact pass condition, and align assertions to that condition (not stricter, not looser).
   - If no mismatch is demonstrable from the `.xhtml`, do not change the Playwright test.

## Regression policy tiers
1. **Mandatory no-regression suites** (`regression_policy: mandatory-no-regressions`)
   - Includes all W3C suites and every suite ID listed in `mandatory_suite_ids` in `.agents/skills/regression-gate/playwright/suites.json`.
   - Any new regression is a hard failure and cannot be waived.
2. **Waivable suites** (`regression_policy: waivable-with-justification`)
   - Regressions are still undesirable and should be fixed first.
   - A regression may proceed only when explicitly justified in run artifacts and user-visible reporting.

## Required workflow
1. **Inspect scope of change**
   - Run:
     - `git -C /mnt/c/Users/John/Documents/GitHub/Saxon-Forms-fork --no-pager diff --name-only`
2. **Select primary suite and build execution queue**
   - Default:
     - `SUITE_ID=issues-spec`
   - Optionally set another suite:
     - `SUITE_ID=<suite-id-from-.agents/skills/regression-gate/playwright/suites.json>`
     - Examples: `w3c-ch02`, `w3c-ch10`, `w3c-appendix`, `w3c-conformance`
   - Resolve registry metadata:
     - `SUITES_JSON=/mnt/c/Users/John/Documents/GitHub/Saxon-Forms-fork/.agents/skills/regression-gate/playwright/suites.json`
     - `PRIMARY_CONFIG_PATH=$(node -e "const s=require(process.argv[1]);const id=process.argv[2];console.log(s.suites[id].config_path)" "$SUITES_JSON" "$SUITE_ID")`
     - `PRIMARY_TEST_PATH=$(node -e "const s=require(process.argv[1]);const id=process.argv[2];console.log(s.suites[id].test_path)" "$SUITES_JSON" "$SUITE_ID")`
     - `PRIMARY_BASELINE_PATH=$(node -e "const s=require(process.argv[1]);const id=process.argv[2];console.log(s.suites[id].baseline_path)" "$SUITES_JSON" "$SUITE_ID")`
     - `PRIMARY_POLICY=$(node -e "const s=require(process.argv[1]);const id=process.argv[2];console.log(s.suites[id].regression_policy)" "$SUITES_JSON" "$SUITE_ID")`
     - `MANDATORY_SUITES=$(node -e "const s=require(process.argv[1]);console.log((s.mandatory_suite_ids||[]).join(' '))" "$SUITES_JSON")`
     - `SUITE_QUEUE="$SUITE_ID"`
     - `for MANDATORY_ID in $MANDATORY_SUITES; do if [[ " $SUITE_QUEUE " != *" $MANDATORY_ID "* ]]; then SUITE_QUEUE="$SUITE_QUEUE $MANDATORY_ID"; fi; done`
3. **Ensure W3C suite data exists (when any queued suite is `w3c-*`)**
   - Run:
     - `if printf '%s\n' $SUITE_QUEUE | grep -q '^w3c-'; then bash /mnt/c/Users/John/Documents/GitHub/Saxon-Forms-fork/scripts/fetch-w3c-suite.sh; fi`
     - `if printf '%s\n' $SUITE_QUEUE | grep -q '^w3c-'; then node -e "const fs=require('fs');const p=require('path');const t='/mnt/c/Users/John/Documents/GitHub/Saxon-Forms-fork/test-app/w3c-suite';if(!fs.existsSync(t)){fs.symlinkSync(p.resolve('/mnt/c/Users/John/Documents/GitHub/Saxon-Forms-fork/public-test/w3c-suite'),t,'junction')}"; fi`
4. **Compile engine**
   - Run:
     - `npx xslt3 -t -xsl:/mnt/c/Users/John/Documents/GitHub/Saxon-Forms-fork/src/saxon-xforms.xsl -export:/mnt/c/Users/John/Documents/GitHub/Saxon-Forms-fork/sef/saxon-xforms.sef.json -nogo "-ns:##html5"`
     - `cp /mnt/c/Users/John/Documents/GitHub/Saxon-Forms-fork/sef/saxon-xforms.sef.json /mnt/c/Users/John/Documents/GitHub/Saxon-Forms-fork/test-app/sef/saxon-xforms.sef.json`
5. **Calculate effective Playwright worker count from host cores**
   - Run:
     - `CORES=$(node -e "console.log(require('os').cpus()?.length || 1)")`
     - `WORKERS=$(node -e "const c=require('os').cpus()?.length || 1; console.log(Math.max(1, Math.floor(c * 0.75)));")`
   - Use `WORKERS` for every Playwright command in this workflow.
6. **Run targeted tests for touched behavior (optional, primary suite only)**
   - If the invoker provides `$ARGUMENTS`, treat it as a Playwright `-g` regex and run:
     - `npx --prefix /mnt/c/Users/John/Documents/GitHub/Saxon-Forms-fork playwright test --workers "$WORKERS" --config "$PRIMARY_CONFIG_PATH" "$PRIMARY_TEST_PATH" -g "$ARGUMENTS"`
   - If no `$ARGUMENTS` is supplied, skip targeted step and continue.
7. **Run full gate for every suite in queue and compare to baseline**
   - Run:
     - `HARD_FAIL=0`
     - `SOFT_FAIL=0`
     - `for ACTIVE_SUITE_ID in $SUITE_QUEUE; do ACTIVE_CONFIG_PATH=$(node -e "const s=require(process.argv[1]);const id=process.argv[2];console.log(s.suites[id].config_path)" "$SUITES_JSON" "$ACTIVE_SUITE_ID"); ACTIVE_TEST_PATH=$(node -e "const s=require(process.argv[1]);const id=process.argv[2];console.log(s.suites[id].test_path)" "$SUITES_JSON" "$ACTIVE_SUITE_ID"); ACTIVE_BASELINE_PATH=$(node -e "const s=require(process.argv[1]);const id=process.argv[2];console.log(s.suites[id].baseline_path)" "$SUITES_JSON" "$ACTIVE_SUITE_ID"); ACTIVE_POLICY=$(node -e "const s=require(process.argv[1]);const id=process.argv[2];console.log(s.suites[id].regression_policy)" "$SUITES_JSON" "$ACTIVE_SUITE_ID"); RUN_DIR=/mnt/c/Users/John/Documents/GitHub/Saxon-Forms-fork/.agents/skills/regression-gate/runs/$ACTIVE_SUITE_ID/$(date -u +%Y%m%dT%H%M%SZ); mkdir -p "$RUN_DIR"; npx --prefix /mnt/c/Users/John/Documents/GitHub/Saxon-Forms-fork playwright test --workers "$WORKERS" --config "$ACTIVE_CONFIG_PATH" "$ACTIVE_TEST_PATH" --reporter=json > "$RUN_DIR/playwright-report.json"; COMPARE_EXIT=0; node /mnt/c/Users/John/Documents/GitHub/Saxon-Forms-fork/.agents/skills/regression-gate/scripts/evaluate_playwright_baseline.mjs --report "$RUN_DIR/playwright-report.json" --baseline "$ACTIVE_BASELINE_PATH" --out "$RUN_DIR/comparison.json" --promote-if-better || COMPARE_EXIT=$?; if [[ "$COMPARE_EXIT" -ne 0 ]]; then if [[ "$ACTIVE_POLICY" == "mandatory-no-regressions" ]]; then HARD_FAIL=1; else SOFT_FAIL=1; printf '%s\n' 'Required justification: why acceptable, blast radius, mitigation, rollback plan.' > "$RUN_DIR/justification-required.txt"; fi; fi; done`
8. **Enforce policy outcomes**
   - If `HARD_FAIL=1`:
     - stop immediately,
     - report mandatory-suite regressions,
     - do not claim completion and do not waive.
   - If `SOFT_FAIL=1` and no hard failure:
     - only proceed when each affected non-W3C suite has explicit written justification in its run directory,
     - include those justifications in user-visible reporting.
9. **Baseline promotion rule**
   - Baseline may be promoted automatically by the comparison script only when:
     - there are **zero new regressions**, and
     - current run is better than stored baseline (more passes and/or fewer failures/flaky).
   - Runs that rely on non-W3C waivers must not be treated as successful baseline-promotion candidates.
10. **Uninitialized suites**
   - If a suite baseline file does not exist, initialize it only after user approval using:
     - `npm run test:baseline -- --suite <suite-id>`
   - For broad refreshes, use:
     - `npm run test:baseline -- --mandatory`
     - `npm run test:baseline -- --all`

## Reporting format
Always report:
- primary suite ID used,
- full suite queue executed,
- per-suite policy (`mandatory-no-regressions` or `waivable-with-justification`),
- baseline file path used per suite,
- compile status,
- targeted test status (or skipped),
- full suite pass/fail counts per suite,
- failing test names per suite,
- whether failures are only baseline or include new regressions,
- whether baseline was promoted,
- whether any non-W3C regression waiver was used (and justification path).

## Baseline maintenance rule
Do not manually edit baseline snapshots during normal runs. Use `npm run test:baseline` for baseline initialization/refresh, and let the evaluator script promote baseline only under the defined improvement rule. Do not treat waived-regression runs as baseline-promotion candidates.
