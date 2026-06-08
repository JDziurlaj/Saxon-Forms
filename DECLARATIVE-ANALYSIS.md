# Declarativeness Analysis: XForms-in-XSLT (Saxon-Forms-fork)

## TL;DR
The disappointment is justified, and there is a concrete structural reason for it.

Saxon-Forms is **declarative where it transforms** (mapping XForms vocabulary to HTML) and
**imperative where it computes** (the XForms processing model: rebuild → recalculate →
revalidate → refresh, action execution, event handling, and all runtime state).

The transformation layer is a genuine win and is smaller/cleaner than the JS equivalent.
But that layer is a minority of the engine. The majority — the stateful runtime — is
implemented in an imperative style that is **not meaningfully shorter than a JavaScript
implementation would be**, because XSLT/XPath is a pure, side‑effect‑free language and the
XForms runtime is inherently stateful and event‑driven. The implementation bridges that gap
by pushing essentially all mutable state into a **100‑function JavaScript sidecar** and by
writing the control logic with imperative idioms (a large `switch`‑style `xsl:choose`,
counter‑driven recursion, and procedural `xsl:call-template` subroutines).

In short: you don't save code by writing imperative logic in XML. You only save code in the
parts that are naturally a tree‑to‑tree transformation.

## Scope and a necessary distinction
"Declarative" is used loosely in the original framing, and two very different things are
worth separating:

1. **The XForms author's experience (the DSL).** A form author writes declarative markup
   (`<xf:bind>`, `<xf:repeat>`, `<xf:setvalue>`). This is declarative *by design of XForms
   itself* and is true regardless of implementation language. Saxon-Forms preserves this.
2. **The engine implementation.** Whether the *interpreter* of that DSL is written
   declaratively. This is what the user is actually asking about, and what this report
   analyzes.

The confusion matters: choosing XSLT as the *host* language does not make the *interpreter*
declarative. It only makes the parts that are themselves transformations declarative.

## How this was measured
Static analysis of the seven XSLT sources under `src/` (≈11,550 non‑blank lines total):

- `src/saxon-xforms.xsl` — 8,833 lines (the engine)
- `src/xforms-javascript-library.xsl` — 778 lines (mutable state + DOM/JS bridge)
- `src/xsd-helpers.xsl` — 675 lines (type validation)
- `src/xforms-xpath-functions.xsl` — 397 lines
- `src/xforms-function-library.xsl` — 308 lines
- `src/web-components.xsl` — 291 lines
- `src/packages/logger.xsl` — 265 lines

Construct frequencies were counted with regex scans (see Appendix for the raw table and the
exact patterns). Counts are indicative, not exact AST counts, but the ratios are large enough
that the conclusions are robust to counting noise.

## Where the implementation IS declarative (the strengths)
These are real, and they are the best of the codebase.

### 1. Rendering: XForms → HTML via template matching
Control rendering is idiomatic, pattern‑matched XSLT. The generic control template at
`src/saxon-xforms.xsl:2405` matches `xforms:*[local-name() = $xforms-controls] | xforms:group
| xforms:case`, computes binding properties via `mode="get-properties"`, then delegates to
per‑control templates in `mode="get-html"` (e.g. `xforms:output` at
`src/saxon-xforms.xsl:2487`). Adding a new control is "add a template," not "extend a
dispatcher." This is the declarative ideal.

### 2. Event handling: interactive XSLT (`ixsl:`) event modes
SaxonJS lets you bind DOM events as template modes, and Saxon-Forms uses this well. Handlers
are declared by *matching the element and the event*, e.g.
`src/saxon-xforms.xsl:455` matches
`*:input[xforms:hasClass(.,'incremental')]...` in `mode="ixsl:onkeyup"`. There are 7 distinct
`ixsl:` event modes (`onblur`, `onchange`, `onclick`, `onfocus`, `onfocusout`, `oninput`,
`onkeyup`). This is more declarative than the typical `addEventListener` + dispatch table in
hand‑written JS.

### 3. Binding context expansion: recursive template descent
`xforms:bind` context resolution (`src/saxon-xforms.xsl:5885`, `mode="add-context"`) walks
nested binds with `xsl:apply-templates`, copying and annotating nodes. This is a clean,
declarative tree rewrite.

### 4. Pure function libraries
`src/xsd-helpers.xsl` (XSD type/facet checking) and `src/xforms-function-library.xsl` are
written as pure `xsl:function`s using modern XPath 3.1 (`!`, `let`, `some`/`every`,
cycle‑guarded recursion). There are 102 `xsl:function` definitions across the codebase. This
is the functional sweet spot and is genuinely more compact than equivalent JS.

There are 15 custom processing modes plus the 7 event modes — i.e. the codebase does invest
in mode‑based dispatch as a declarative dispatch mechanism.

## Where it is NOT declarative (the imperative core)
This is the part that answers "why isn't it less code?"

### 1. All runtime state lives in a mutable JavaScript sidecar
`src/xforms-javascript-library.xsl` opens with ~40 mutable global objects
(`src/xforms-javascript-library.xsl:6-54`): `instances`, `models`, `bindings`, `actions`,
`eventActions`, `repeats`, `repeatIndexMap`, `switches`, `submissions`, `outputs`,
`dirtyInstances`, `validationMIPs`, `visitedControls`, an event‑context **stack**, and more —
followed by paired getters/setters (`setInstance`/`getInstance`, etc.).

The engine calls into this sidecar **227 times** across **100 distinct `js:` functions**
(roughly half of them get/set pairs). This is the single most important finding:

> The XForms runtime *is* a mutable state machine. XSLT/XPath has no mutable variables, so the
> entire state machine was implemented in JavaScript and is merely *driven* from XSLT.

The "declarative host language" therefore does not own the hard part of the problem. The hard
part is written imperatively in JS and marshalled in and out of XSLT — which adds code on both
sides of the boundary rather than removing it.

### 2. Action execution is a hand‑written `switch`
The clearest example. Actions are first converted from elements into `map(*)` records
(`mode="set-action"` / `set-actions`), stored in JS, and then *replayed* by `applyActions`
(`src/saxon-xforms.xsl:5219`), whose body is a ~20‑arm `xsl:choose` on a string action name
(`src/saxon-xforms.xsl:5321` onward):

```xslt
<xsl:variable name="action-name" select="map:get($action-map,'name')"/>
<xsl:choose>
  <xsl:when test="$action-name = 'setvalue'"><xsl:call-template name="action-setvalue"/></xsl:when>
  <xsl:when test="$action-name = 'insert'"><xsl:call-template name="action-insert"/></xsl:when>
  <xsl:when test="$action-name = 'delete'"><xsl:call-template name="action-delete"/></xsl:when>
  <!-- ...setindex, toggle, setfocus, dispatch, rebuild, recalculate,
       revalidate, refresh, reset, load, send, message... -->
</xsl:choose>
```

This is character‑for‑character what a JavaScript `switch (action.name)` would look like. The
declarative alternative XSLT actually offers — *keep the action elements and
`xsl:apply-templates ... mode="apply-action"` with one template per action element type* — is
not used. Instead the design does the dispatch work **twice**: once to marshal elements into
maps, and once to branch on the map's name field.

### 3. The processing model is counter‑driven recursion, not a dependency graph
`xforms-recalculate` (`src/saxon-xforms.xsl:5956`) reads binds via `js:getBindings()`,
iterates instances, and recurses through `calculate` binds one at a time using an integer
`$counter` (`xforms-recalculate-binding`, `src/saxon-xforms.xsl:6015`), writing results back
with `js:setInstance(...)`. This is a manual `for` loop expressed via tail recursion (XSLT's
only looping construct), plus mutable state held in JS.

Notably this is also a **conformance** gap, not just a style one: there is no recalculation
dependency graph and no fixpoint iteration (corroborated by `ARCH-REVIEW.md` §C2), so it is
both imperative *and* an incomplete model of XForms 1.1 §4.3/§7.4.

### 4. Imperative idioms dominate the control logic
Branching and procedure calls vastly outnumber declarative dispatch:

- Conditionals: 155 `xsl:choose`, 285 `xsl:when`, 271 `xsl:if`.
- Procedural subroutines: 57 named templates invoked by **177** `xsl:call-template`.
- Declarative dispatch: **72** `xsl:apply-templates` over 71 match templates.

So `call-template` (procedure calls) outnumbers `apply-templates` (polymorphic dispatch) by
about **2.5 : 1**. A heavily declarative XSLT program inverts that ratio. Here, named
templates are used as ordinary subroutines and large `choose` blocks carry the logic — i.e.
structured imperative programming that happens to be spelled in XML.

### 5. XPath is manipulated as text, then dynamically evaluated
The engine rewrites XPath strings (the `impose()` rewriter and ad‑hoc `replace()`/`matches()`
surgery) and evaluates them via 22 `xsl:evaluate` sites. String‑munging a language and
`eval`‑ing the result is the opposite of declarative, and is a known source of latent bugs
(see `ARCH-REVIEW.md` §C1/§C4/§F3).

## Why it isn't less code than JavaScript
Synthesizing the above:

1. **Impedance mismatch.** XSLT/XPath is pure and functional; the XForms runtime is mutable
   and event‑driven. You only get the "less code" dividend when the problem is a
   transformation. The runtime is not a transformation, so it pays no dividend.
2. **State is external.** Because XSLT can't hold mutable state, the state machine is a
   100‑function JS module. That code would exist in a pure‑JS engine too — so for the hard
   part, XSLT adds a marshalling layer *on top of* JS rather than replacing it.
3. **Double dispatch.** Elements are marshalled into maps and then branched on by name,
   instead of being dispatched directly by template matching. Work is duplicated.
4. **XML verbosity.** Imperative logic in XML is more verbose than the same logic in JS:
   `<xsl:variable name="x" select="..."/>` vs `const x = ...`. The 1,013 `xsl:variable`
   bindings are not "wrong" (let‑bindings are normal in functional code), but each costs more
   characters than its JS counterpart, so wherever the logic is imperative, XSLT is *longer*,
   not shorter.
5. **Test‑ID coupling inflates the source.** Pervasive `TEST-TRACE … helps tests/w3c/chNN`
   branches and fixture‑specific special cases add engine code that encodes named test cases
   rather than the general model (see `ARCH-REVIEW.md` §M2).

This pattern is not unique to Saxon-Forms. The common industry split (e.g. XSLTForms) is
"XSLT for the static XForms→HTML compile, JavaScript for the runtime." Saxon-Forms is
ambitious in pulling the *runtime* into interactive XSLT too — but the state still ends up in
JS, which is exactly why the line count converges with a JS implementation.

## Could it actually be more declarative (and shorter)?
Partly yes, partly no.

- **Realistically reducible:**
  - Replace the `applyActions` `choose` (and the `set-action` marshalling) with
    `xsl:apply-templates mode="apply-action"` and one template per action element. This
    deletes a dispatcher and a marshalling pass.
  - Reduce text‑based XPath rewriting by feeding `xsl:evaluate` a proper static context
    (namespaces via `namespace-context` from the XForms element; variables via `with-param`)
    instead of string surgery (`ARCH-REVIEW.md` §M1).
  - Collapse near‑duplicate event templates (the `ixsl:onblur`/`onfocusout`/`onchange`
    variants share large bodies).
- **Not realistically reducible:** the mutable runtime (recalc/revalidate/refresh, indexes,
  switch/case selection, submission lifecycle). This is inherently stateful. A *correct*
  implementation would arguably be **larger** (a real dependency graph for recalculation is
  more code than the current single pass), not smaller. Declarativeness and conformance here
  pull in opposite directions from brevity.

Net: tightening the declarative parts could remove a meaningful chunk of the dispatch/marshal
code, but it will not make the engine dramatically smaller, because the irreducible core is a
state machine.

## Would functional refactoring (HOF, currying) reduce code size?
Short answer: **marginally, and only in the pure parts** — not in the imperative core that
drives the line count. Currying specifically has near‑zero payoff here, and in several places a
naive higher‑order rewrite would make the XML *longer*, not shorter.

### Starting point: the code uses no HOF today
XPath 3.1 / XSLT 3.0 (and SaxonJS3) fully support higher‑order functions — inline
`function($x){…}` items, named references (`f#1`), `fold-left`/`fold-right`/`fn:for-each`/
`filter`, partial application with `?` placeholders, and the `=>` arrow. A scan of `src/`
finds **zero** of these in actual code (the only `=>` match is inside a comment in
`xsd-helpers.xsl`). The codebase does use lighter functional constructs — the `!` map
operator, `some`/`every`, `let`, and self‑recursive `xsl:function`s — but no function item is
ever passed, returned, or partially applied. So the opportunity is real and untapped; the
question is whether taking it shrinks the code.

### Why the payoff is small: HOF abstracts *pure computation*, and the bulk here isn't pure
The dominant size drivers identified above are externalized mutable state (227 `js:` calls
across 100 functions), XML verbosity, double marshalling (element → map → name‑switch),
text‑based XPath with 22 `xsl:evaluate` sites, and test‑ID coupling. None of these is a
pure‑computation problem, and HOF/currying only help with pure computation and the
control‑flow plumbing around it:

- **State (the big one) is untouchable by HOF.** XPath function items cannot hold mutable
  state; the runtime would still call `js:setInstance(...)` etc. The "functional" way to
  remove that state is to *thread* it (accumulator / state‑monad style through `fold-left`),
  but XSLT has no monadic sugar, and the handlers also write to the live DOM
  (`xsl:result-document`, `ixsl:set-*`). Threading state through folds here would *add* code
  and fight the side effects, not remove them.
- **The action `switch` resists HOF for a concrete reason.** Turning `applyActions` into a
  `map` of `name → function` requires the handlers to be function items, i.e. `xsl:function`s.
  But many action handlers perform side effects that are **not permitted inside
  `xsl:function`** (notably `xsl:result-document`). The clean fix is *template dispatch*
  (`xsl:apply-templates … mode="apply-action"`), which is XSLT's own polymorphic‑dispatch
  mechanism — not HOF. For an XSLT engine, template rules already *are* the idiomatic
  "functional dispatch"; reaching for function items is the wrong tool and buys nothing here.
- **Inline functions are syntactically heavier in XML.** `fold-left($seq, $init,
  function($a,$b){ … })` embeds a function declaration inside a `select` attribute. For the
  short bodies typical here, that is usually *more* characters than the equivalent
  `xsl:for-each` or `some`/`every`, and it reads worse. HOF saves lines only when the
  abstracted body is large and repeated many times.

### Where it genuinely would help (the real, bounded win)
The payoff is concentrated in the ~1,400 lines of pure helpers (`xsd-helpers.xsl`,
`xforms-function-library.xsl`, `xforms-xpath-functions.xsl`).

The best single candidate is `xsdh:facet-valid` (`src/xsd-helpers.xsl:219`). Its body is ~48
lines of near‑identical "if this facet category is present, then every/some member satisfies a
predicate, else true()" blocks. A small higher‑order combinator collapses each block to one
line:

```xslt
<!-- today: ~6 lines per facet category, repeated for ~10 categories -->
and (
  if (exists($max-length-facets))
  then (if ($canonical = 'qname') then true()
        else exists($length) and (every $l in $max-length-facets satisfies $length le $l))
  else true()
)
<!-- with a combinator: ~1 line per category -->
and xsdh:every-facet($max-length-facets, function($l){ exists($length) and $length le $l })
```

That one function could drop from ~85 to ~40 lines. Across the pure helpers, disciplined HOF
use might remove on the order of **150–400 lines total (~1–3% of the codebase)** — worthwhile
locally, invisible at the headline level.

### Currying / partial application specifically: negligible
Currying targets function‑argument plumbing, but this engine passes data through
`xsl:with-param`/tunnel parameters and template modes, not function arguments — so currying
can't reach the verbose parts. The few legitimate spots (e.g. `xsdh:facet-compare($value, ?,
$base-type, ?)` reused for the four bound comparisons at `src/xsd-helpers.xsl:291`) save a
handful of characters and arguably reduce readability. Estimated impact: well under 0.5%.

### A related lever that is *not* HOF: generic accessors
The 100‑function JS bridge is mostly get/set pairs (`setInstance`/`getInstance`,
`setModel`/`getModel`, …). Collapsing those into a few generic accessors
(`js:get(bucket,key)` / `js:set(bucket,key,value)`) could roughly halve
`xforms-javascript-library.xsl`. This is real deduplication, but it is ordinary refactoring,
not functional programming — and it barely changes the 227 XSLT‑side call sites, so total
codebase impact is still small.

### Verdict
A functional pass is good hygiene and would modestly tighten the pure helper code, but it does
**not** address why the engine is JS‑sized. The size lives in stateful runtime logic that must
perform side effects, and HOF/currying cannot abstract side effects away — in XSLT they often
make side‑effecting code longer and riskier (function items with side effects interact badly
with lazy/streamed evaluation and complicate SEF export and debugging). The higher‑leverage
moves remain the ones in the previous section: replace the action `switch` with template
dispatch, cut text‑based XPath rewriting, and merge duplicate event templates. Expect a few
percent from a functional refactor, not the order‑of‑magnitude the original hope implied.

## Caveats
- This is a **static, structural** analysis. Construct counts are regex‑based and approximate;
  they measure style/shape, not correctness or performance.
- "Imperative" is not a pejorative here — much of the XForms model *must* be imperative. The
  point is descriptive: the declarative host language does not, and cannot, make the stateful
  core declarative or shorter.
- Conformance observations are cross‑referenced to the repo's own `ARCH-REVIEW.md`,
  `MAY-GAPS.md`, and `tests/xforms/w3c/STATUS.md` rather than re‑derived here.

## Appendix: raw metrics
Construct frequencies across `src/**/*.xsl`:

| Construct | Count | Leaning |
|---|---:|---|
| `xsl:variable` | 1013 | neutral (functional let‑bindings) |
| `xsl:when` | 285 | imperative branching |
| `xsl:if` | 271 | imperative branching |
| `js:` interop calls | 227 | imperative (external mutable state) |
| `xsl:call-template` | 177 | imperative (procedure call) |
| `xsl:choose` | 155 | imperative branching |
| `ixsl:` (any) | 125 | interactive runtime |
| `xsl:function` | 102 | declarative/functional |
| `mode=` (any) | 102 | declarative dispatch |
| `xsl:apply-templates` | 72 | declarative dispatch |
| `xsl:template match=` | 71 | declarative dispatch |
| `xsl:for-each` | 59 | iteration |
| `xsl:template name=` | 57 | imperative (subroutine) |
| `xsl:evaluate` | 22 | dynamic XPath (text→eval) |
| `ixsl:call` | 10 | JS interop |
| `ixsl:set-property` | 8 | DOM mutation |
| `ixsl:schedule-action` | 8 | async/imperative |
| `xsl:result-document` | 8 | DOM write |
| `ixsl:set-attribute` | 5 | DOM mutation |
| `xsl:for-each-group` | 0 | — |

Dispatch / state surface:

- Distinct custom modes (15): `add-context, delete-node, get-context-instance-id, get-field,
  get-html, get-properties, insert-node, namespace-fix, recalculate, replace-node,
  set-action, set-actions, set-field, set-js, trim-cdata-sections`
- Distinct `ixsl:` event modes (7): `onblur, onchange, onclick, onfocus, onfocusout, oninput,
  onkeyup`
- Distinct `js:` state/bridge functions (100): includes `getInstance/setInstance`,
  `getBindings/setBinding`, `getRepeatIndex/setRepeatIndex`, `addAction/getAction`,
  `selectCase/deselectCase`, `setValidationMIP/getValidationMIPValid`,
  `push/popCurrentEventContext`, `addDirtyInstance/clearDirtyInstances`, etc.

Key code references:
- Action dispatch `switch`: `src/saxon-xforms.xsl:5219` (template), `:5321` (the `choose`).
- Control rendering dispatch: `src/saxon-xforms.xsl:2405`, per‑control at `:2487`.
- Event handler templates: `src/saxon-xforms.xsl:372`–`:631`.
- Recalculation loop (counter recursion, no dep‑graph): `src/saxon-xforms.xsl:5956`, `:6015`.
- Mutable JS state declarations: `src/xforms-javascript-library.xsl:6`–`:54`.
