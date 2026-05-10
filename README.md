Saxon-Forms
=========

Saxon-Forms is an XForms implementation written using Interactive XSLT 3.0. 
Interactive XSLT 3.0 is a feature of Saxon-JS, which is an XSLT 3.0 run-time written in pure JavaScript for use in the browser or a platform that supports JavaScript.

See conference papers below:

[Implementing XForms using interactive XSLT 3.0](http://www.saxonica.com/papers/xmlprague-2018ond.pdf). XML Prague 2018.

[Distributing XSLT Processing between Client and Server](http://xmllondon.com/2017/xmllondon-2017-proceedings.pdf). XML London 2017.

## Build

The latest builds of Saxon-Forms are placed in the builds directory (i.e. saxon-xforms.sef.json). However to build the tool yourself you will use the following command:

```bash
npm run build:sef
```

## Setup
Saxon-Forms currently supports Saxon-JS 3. To run Saxon-Forms you will need Saxon-JS which can be downloaded at
[Saxon-JS](http://www.saxonica.com/saxon-js/index.xml) (older versions available at the [archive](https://www.saxonica.com/saxon-js/archive.xml)). Example pages are consolidated under `examples/`.

- Run all examples:
  - `npm run examples`
- Compile stylesheet-driven integration examples on demand:
  - `npm run examples:compile`
- Direct XForms-source loading example:
  - `examples/sample1.html`
- Stylesheet-driven loading example:
  - `examples/sample2.html`

## End-to-end tests (Playwright)

1. `npm install` to install dependencies
1. `npm run predev` to start the Vite dev server (required for the Playwright tests)
1. `npm run build:sef` to build the SEF files for testing
1. `npm run test:e2e` to run the full suite of Playwright tests

To run the tests interactively, use `npm run test:e2e:ui`

## Cryptographic Functions (Optional)

The XForms `digest()` and `hmac()` functions require the
[@noble/hashes](https://github.com/paulmillr/noble-hashes) library (MIT license). 
These functions are **optional** — forms that do not
use `digest()` or `hmac()` work without it. When the library is not loaded,
these functions return an empty string instead of crashing.

### Quick setup

1. Install the dependency:

   ```bash
   npm install @noble/hashes
   ```

2. Build the crypto bundle:

   ```bash
   node scripts/build-crypto.mjs
   ```

   This produces `builds/saxon-forms-crypto.js` (~14 KB, 6 KB gzipped).

3. Load the bundle **before** Saxon-Forms in your HTML:

   ```html
   <script src="saxon-forms-crypto.js"></script>
   <!-- then load SaxonJS and your XForm as usual -->
   ```

### CDN alternative

If you prefer not to install locally, you can load the pre-built bundle from
your own CDN or copy `builds/saxon-forms-crypto.js` alongside your other assets.

### What happens without it

If the crypto bundle is not loaded, `digest()` and `hmac()` return empty strings.
Forms that use these functions will render normally but any conditional logic
that depends on hash values (e.g. `ref="self::node()[digest(...) = '...']"`)
will not match.

## Technical Details


