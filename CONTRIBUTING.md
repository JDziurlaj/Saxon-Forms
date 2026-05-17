# Contributing to Saxon-Forms
Thanks for contributing to Saxon-Forms. This document defines the expected local workflow, quality checks, and pull request standards.

## Scope
This repository contains:
- Saxon-Forms XSLT implementation in `src/`
- Browser-facing bridges and helpers
- W3C conformance tests in `tests/w3c/`
- Interactive examples in `examples/`
- Implementation and conformance docs in `docs/docbook/` and `tests/w3c/STATUS.md`

## Prerequisites
- Node.js + npm
- Saxon-JS assets available for local runs
- Apache Ant (only required for DocBook build workflows)

## Local setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the SEF:
   ```bash
   npm run build:sef
   ```
3. Ensure the W3C test suite is available when running conformance tests:
   ```bash
   npm run fetch:w3c
   ```

## Development workflow
- Create a focused branch for each change.
- Keep behavior changes and refactors separate unless tightly coupled.
- Add or update tests for any behavior change.
- If conformance status changes, update `tests/w3c/STATUS.md`.
- Keep documentation aligned with implementation changes.

## Required local checks before opening a PR
Run the following before submitting:

```bash
npm run build:sef
npm run test:e2e:full
npm run test:xsd-helpers
npm run docs:docbook:validate
```

If your change affects documentation, also run:

```bash
npm run docs:docbook:build
```

## Working with W3C tests
- Specs are grouped by chapter in `tests/w3c/chXX.spec.ts`.
- Shared helpers and fixtures live in `tests/w3c/helpers.ts`, `tests/helpers.ts`, and `tests/fixtures/`.
- Known gaps and resolved regressions are tracked in `tests/w3c/STATUS.md`.

## Architecture map (where to start)
Use this map to find implementation ownership quickly:

- Main transformation/runtime orchestration: `src/saxon-xforms.xsl`
- XPath/XForms function implementations: `src/xforms-function-library.xsl`, `src/xforms-xpath-functions.xsl`
- JavaScript bridge behavior and browser-side support: `src/xforms-javascript-library.xsl`
- Schema/type helper logic: `src/xsd-helpers.xsl`
- End-to-end conformance tests by chapter: `tests/w3c/chXX.spec.ts`
- Shared Playwright fixtures/helpers: `tests/w3c/helpers.ts`, `tests/fixtures/`
- Conformance gap tracking and rationale: `tests/w3c/STATUS.md`

When fixing a conformance gap:
1. Reproduce with a specific chapter/test ID.
2. Add or adjust tests as needed.
3. Implement the fix.
4. Verify pass/fail delta locally.
5. Update `tests/w3c/STATUS.md` when gap status changes.

## Coding guidelines
- Prefer minimal, localized changes.
- Preserve existing project style in XSL/TS/JS files.
- Use descriptive names and keep control-flow explicit.
- Add comments where logic is subtle (especially XPath/XForms semantics).
- Avoid broad formatting-only churn in functional PRs.

## Documentation expectations
Update docs whenever behavior changes:
- User-facing workflows: `README.md`
- Implementation details: `docs/docbook/`
- Conformance gap status: `tests/w3c/STATUS.md`

## Pull request expectations
A pull request should clearly describe:
- What changed
- Why it changed
- How it was validated (commands and key outcomes)
- Conformance impact (if applicable)
- Known limitations (if any remain)

To keep PRs reviewable:
- Keep scope cohesive and limited.
- Avoid unrelated file churn.
- Include enough context for a reviewer to reproduce results.

## Reporting issues
When reporting a bug, include:
- Reproduction steps
- Expected behavior
- Actual behavior
- Minimal sample input (XForm/XPath) when possible
- Relevant W3C chapter/test ID when applicable
- Any logs or screenshots needed for diagnosis
