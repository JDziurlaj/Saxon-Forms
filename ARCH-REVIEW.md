## Overall assessment
This is ambitious, broadly functional work, and the **new helper libraries are genuinely good** modern XSLT 3.0 / XPath 3.1. However, two systemic issues dominate the risk profile:

1. The **core processing model diverges architecturally from XForms 1.1** (no recalculation dependency graph; validation driven by the rendered DOM rather than instance data; exception events largely unsignalled).
2. **XPath is manipulated as text** throughout (the `impose()` rewriter plus ad‑hoc `replace()`/`matches()` surgery). This is the root cause of several latent defects, including a concrete, verifiable bug.

Many of these are independently confirmed by the team's own gap docs, which raises a meta‑point: the engine is heavily **coupled to specific W3C test IDs** (pervasive `TEST-TRACE … helps tests/w3c/chNN` comments), which tends to optimize for passing named cases rather than implementing the model generally.

---

## Correctness

### C1 — Double‑escaped regexes are inert (concrete bug)
In several `select` attributes the regex uses `\\s` / `\\(` / `\\)`. Inside an XPath **string literal**, `\\` is two literal backslashes, so the regex engine sees “a literal backslash, then `s`” — which can never match real XPath. These calls silently do nothing. Compare the **correct** single‑escaped versions elsewhere in the same file:

```xslt path="/Users/.../src/saxon-xforms.xsl" start=7461 end=7461
if (not($has-bind) and $context-explicit and exists($context) and matches(normalize-space($context), '^instance\s*\('))   <!-- correct -->
```
```xslt path="/Users/.../src/saxon-xforms.xsl" start=7469 end=7470
replace(normalize-space($context),
  '^instance\\s*\\(\\s*''[^'']+''\\s*\\)\\s*/?', '')   <!-- inert: \\s never matches -->
```
Affected: `action-insert` context‑strip (`src/saxon-xforms.xsl:7469`), `action-delete` (`:7710`), `refreshOutputs` fallback (`:4540`), and SOAP charset/action mediatype parsing (`:6439`, `:6449`, `:6470`, `:6474`). The working equivalent is at `src/saxon-xforms.xsl:5798`. Impact: the `instance('id')/…` prefix‑strip never fires (a plausible contributor to the `@context` insert/delete failures listed in `STATUS.md` 10.3.a/10.3.c/10.4.b), and SOAP `charset=` detection is broken. **Fix:** use single backslashes.

### C2 — Recalculation has no dependency graph (XForms 1.1 §4.3.6 / §7.4)
`xforms-recalculate` (`src/saxon-xforms.xsl:5585`) selects `@calculate` binds and processes them **in document order, single pass**, via a counter (`xforms-recalculate-binding`, `:5627`). There is no topological sort, no fixpoint iteration, and no circular‑dependency detection (so `xforms-compute-exception` is never raised). A bind whose `calculate` depends on another bind appearing **later** in document order will read a stale value. The "graph"/"dirty" machinery present is only the PERF‑6 dirty‑instance optimization, not a MIP dependency graph. This is the single largest conformance divergence and should be called out as such.

### C3 — Calculation errors are swallowed
The calculate evaluation wraps errors to an empty string:

```xslt path="/Users/.../src/saxon-xforms.xsl" start=5674 end=5677
<xsl:try>
  <xsl:evaluate xpath="xforms:impose('string(' || $__calc-with-pos || ')')" .../>
  <xsl:catch><xsl:sequence select="''"/></xsl:catch>
</xsl:try>
```
Per the spec a compute failure is an `xforms-compute-exception`; substituting `''` masks it (confirmed by `MAY-GAPS.md` 7.5.a).

### C4 — `position()`/`last()` resolved by textual substitution
`src/saxon-xforms.xsl:5667-5672` does `replace($expr,'last\s*\(\s*\)', …)` / `'position\s*\(\s*\)'` across the **entire** calculate string. This corrupts expressions where those functions appear inside nested predicates (a different focus) or inside string literals, and ignores other positional constructs.

---

## XForms 1.1 conformance

### F1 — Revalidation is DOM‑driven, not instance‑driven
`xforms-revalidate` iterates **rendered controls**:

```xslt path="/Users/.../src/saxon-xforms.xsl" start=5739 end=5739
<xsl:variable name="validation-controls" as="element()*" select="ixsl:page()//*[@data-ref and @instance-context]"/>
```
Validity in XForms 1.1 is a property of **instance nodes**, computed during revalidate regardless of UI; refresh then projects it. Driving it from the DOM means instance nodes with no rendered control — model‑only `type`/`constraint` binds, controls inside a non‑selected `switch/case`, anything not yet rendered — are never validated. This under‑checks submission validity (`validate="true"`).

### F2 — Wrong namespace context for dynamic XPath
Every `xsl:evaluate` uses the **instance element** as `namespace-context` (e.g. `:5640`, `:5675`, `:5808`, `:5841`, `:6548`). XForms requires the in‑scope namespaces of an XPath expression to come from the element bearing the attribute **in the XForms document**. Prefixed names used in `calculate`/`constraint` that are declared on the model/bind but not on the instance root will fail to resolve or bind the wrong URI.

### F3 — `impose()` rewrites XPath with regex (`src/xforms-function-library.xsl:24-93`)
The rewriter (function‑name prefixing, absolute‑path → `root(.)`, `current()` → `let`) is on the hot path for nodeset/calculate/constraint. Documented hazards: it rewrites tokens **inside string literals**; the absolute‑path rule only handles multi‑step paths with a trailing slash (single‑step `/root` unhandled, `//x` deliberately excluded, `/*` unhandled); and `current()` is replaced everywhere including literals. It passes curated tests but is not robust XPath handling.

### F4 — Exception events generally unsignalled
`property('invalid')` returns `''` (`src/xforms-xpath-functions.xsl:26-35`) rather than raising `xforms-binding-exception`; `digest()`/`hmac()` with an invalid algorithm or encoding return `''` (`src/xforms-javascript-library.xsl:744-768`) rather than signalling. Corroborated by `MAY-GAPS.md` (7.8.2.c, 7.8.3.c‑e, 7.8.4.c‑e).

### F5 — Type validator gaps (`src/xsd-helpers.xsl`)
Unknown types default to valid (`:163 else true()`), so a `bind/@type` naming a schema type absent from the built‑in list and without a schema document passes unconditionally. The validator also bakes **non‑standard pseudo‑types** into the runtime (`email`, `card-number`, `ccnumber-strict`, `nonemptystring`, `listitem`/`listitems`, plus the `my:ccnumber` special‑case at `:26`). Also minor: `boolean-from-string` is case‑insensitive (`src/xforms-xpath-functions.xsl:45`) vs the lowercase schema lexical space.

---

## Maintainability

- **M1 — Text‑based XPath manipulation as an architecture.** `impose()` + ad‑hoc `replace()`/`matches()` is the common root of C1, C4, F2, F3. Prefer feeding `xsl:evaluate` a proper static context (namespaces via `namespace-context` taken from the XForms element, variables via `with-param`) over string rewriting.
- **M2 — Test‑ID coupling in runtime source.** Dozens of `TEST-TRACE … helps tests/w3c/chNN` comments, plus data‑specific diagnostic branches such as `is-ch833-target` keyed to `'/icecream/flavor'` (`src/saxon-xforms.xsl:4507-4509`). Engine logic should not name test cases or fixtures.
- **M3 — Stray artifacts committed to `src/`.** `src/input.xml` and `src/output.xml` (added in `fec4c8d`) are not part of the stylesheet set; remove them.
- **M4 — Dead code over undeclared globals.** In `src/xforms-javascript-library.xsl`, `setModelInstance`/`getModelInstances`/`setModelInstanceKey`/`setModelDefaultInstance` (lines ~120‑153) reference `modelInstanceMap`/`modelDefaultInstanceMap`/`modelInstanceKeyMap`, which are never declared and never called from the XSLT (verified by grep). They would throw `ReferenceError` if ever wired. Remove or repair.
- **M5 — Recalculate cost.** Each matched node re‑runs `js:setInstance` plus a full `mode="recalculate"` tree rebuild per binding (`:5698-5717`) — roughly O(bindings × matches × instance size). Acceptable for small forms; watch for large instances.
- **M6 — Unconditional logging in hot/error paths**, e.g. `++++ ERROR ++++` (`:2020`, `:2033`) and the diag messages at `:4508` lack `use-when="$debugMode"`.

---

## What's done well
- `src/xsd-helpers.xsl` is the strongest new code: idiomatic XPath 3.1 (`!` mapping, `let`, `some`/`every`, cycle‑guarded recursion, correct XSD Appendix‑E duration anchoring), well documented with the oXygen `xd:` tagset.
- The crypto bridge is cleanly optional, and all five XForms‑mandated `digest()` algorithms are actually bundled (`scripts/crypto-entry.mjs`: `md5`/`sha1` via `legacy.js`, `sha256/384/512` via `sha2.js`).
- Deferred‑update **ordering** is correct: rebuild → recalculate → revalidate → refresh (`src/saxon-xforms.xsl:6859-6887`).
- Sensible function overloads (0/1‑arg `instance()`, `random()`, 2/3‑arg `digest`, 3/4‑arg `hmac`) and the `index()` NaN semantics per §7.7.5.

## Suggested priorities
1. Fix the double‑escaped regexes (C1) — small, concrete, likely unblocks insert/delete `@context` cases.
2. Decide on the recalculation model (C2/C3): a real dependency graph with `xforms-compute-exception`, or document the limitation explicitly as a non‑conformance.
3. Move validity to an instance‑node pass (F1) and correct the `xsl:evaluate` namespace context (F2).
4. Reduce text‑based XPath surgery (M1) and decouple the engine from test IDs/fixtures (M2), then remove M3/M4.

If useful, I can turn C1 and M3/M4 into a focused patch, since those are low‑risk and well‑isolated.