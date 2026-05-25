# Saxon-Forms Developer Setup Guide
This guide documents external dependencies and non-repo assets needed to run Saxon-Forms reliably from a clean clone.

## What is managed by the repo
- JavaScript/TypeScript/XSLT source code
- npm dependency manifests (`package.json`, `package-lock.json`)
- Committed Saxon-JS runtime files under `Saxon-JS/`
- Committed SEF artifacts under `sef/` and `test-app/sef/`

## What is intentionally not committed
The following are excluded by `.gitignore` and are expected to be generated, downloaded, or installed locally:
- `node_modules/`
- `public-test/w3c-suite/` and `test-app/w3c-suite`
- `ant4docbook-0.10.0/`
- `apache-ant*/`
- build and test output directories (`builds/`, `runs/`, `playwright-report/`, `test-results/`)

## Required tools
### 1) Node.js + npm
- Install Node.js and npm.
- Recommended: use Node 22.x to match current repository support scripts.

### 2) Playwright browser binaries
- Install project dependencies first:
  - `npm install`
- Then install Playwright browsers:
  - `npx playwright install`

### 3) `xslt3` CLI availability
The repo uses `npx xslt3` in build and validation scripts, but `xslt3` is not currently declared in `package.json`.
- On first use, `npx` may fetch it from npm (network required), or
- Install it globally/local-dev if your environment restricts dynamic package fetches.

## Optional/flow-specific tools
### DocBook build toolchain
DocBook commands require:
- Apache Ant available on `PATH` (or passed via `--ant-bin` to `scripts/run-docbook-build.mjs`)
- Local `ant4docbook-0.10.0` distribution unpacked at repo root:
  - `ant4docbook-0.10.0/`

These requirements are intentional and not committed to git.

### NIST facet harness (`xmllint` engine mode)
- `scripts/run-nist-facet-harness.mjs` supports an `xmllint` validation engine mode.
- Install `xmllint` only if you plan to run that mode.

## Non-repo datasets required for some tests
### W3C XForms 1.1 test suite
W3C tests require a downloaded suite:
- `npm run fetch:w3c`

This downloads and extracts the suite into:
- `public-test/w3c-suite/` (ignored in git)
- and links `test-app/w3c-suite` when needed

### NIST XSD dataset
NIST-related manifests reference:
- `tests/xsdtests/nistMeta/NISTXMLSchemaDatatypes.testSet`

This file is not currently committed and must be provided locally before running NIST facet workflows.

## Clean-clone bootstrap checklist
1. `npm install`
2. `npx playwright install`
3. `npm run build:sef`
4. `npm run fetch:w3c` (if running W3C/conformance tests)
5. Install Ant + `ant4docbook-0.10.0/` (if running DocBook build commands)
6. Provide NIST test-set assets (if running NIST facet workflows)

## Repository hygiene note
`package-lock.json` currently contains an extraneous local path entry (`../rabet-v-oscal-ui/frontend`).  
If you regenerate lockfiles, ensure lockfile changes only reflect this repository's true dependencies.
