---
name: test-suite-development
description: Development discipline for passing the test suite with the smallest defensible change set. Use this skill whenever implementing fixes intended to satisfy failing tests.
---

# Test-Suite-Development (Minimal, Justifiable Changes)

## Purpose
Implement only the minimum code required to satisfy failing tests, with changes that can be clearly justified to external reviewers.

## Core principle
This repository’s changes must remain conservative and easy to defend. Avoid major codebase changes unless they are strictly required to pass the target tests.

## Non-negotiable rules
1. Make the smallest localized change that resolves the failing test behavior.
2. Do not perform broad refactors, architectural rewrites, style-only sweeps, large renames, or unrelated cleanups while pursuing test fixes.
3. Do not modify files that are not directly involved in the failing behavior.
4. If a larger change appears necessary, stop and document why a smaller option is insufficient before proceeding.
5. For every functional code change, add an adjacent short comment that explains:
   - what changed and why,
   - which specific test(s) this change helps pass.

## Required test-trace comment convention
Use a short `TEST-TRACE` comment immediately next to each changed block, using the file’s native comment syntax.

Examples:
- `// TEST-TRACE: restrict repeat toggle scope; helps tests/issues.spec.ts "Issue #30"`
- `/* TEST-TRACE: preserve insert context fallback; helps tests/w3c/ch09.spec.ts "9.3.a" */`
- `<!-- TEST-TRACE: adjust relevance refresh ordering; helps tests/w3c/ch02.spec.ts "2.3.a" -->`

Keep comments concise and factual (one short line whenever possible).

## Workflow
1. Identify failing tests and the smallest likely fix surface.
2. Implement narrowly scoped code changes.
3. Add `TEST-TRACE` comments adjacent to each change.
4. Run targeted tests, then run the regression gate.
5. If mandatory suites regress, continue fixing (no waiver).
6. If non-mandatory regressions remain, document explicit justification before considering progress complete.

## Done criteria
1. Target failures are resolved.
2. No mandatory-suite regressions are introduced.
3. Every functional change has a nearby `TEST-TRACE` comment that names the relevant test(s).
