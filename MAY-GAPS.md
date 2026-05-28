# MAY Gaps
## Ch7 exception signaling for invalid XPath/function paths
Current runtime does not reliably surface required exception signal (`xforms-binding-exception` / `xforms-compute-exception`) for several W3C Chapter 7 negative-path tests.
Affected promoted behavioral tests:
- `7.5.a — compute exception`
- `7.5.b — binding exception`
- `7.8.2.c — property() invalid NCNAME`
- `7.8.3.c — digest() invalid NCNAME`
- `7.8.3.d — digest() invalid QName`
- `7.8.3.e — digest() invalid encoding`
- `7.8.4.c — hmac() invalid NCNAME`
- `7.8.4.d — hmac() invalid QName`
- `7.8.4.e — hmac() invalid encoding`
- `7.12.a — invalid functions attr`
Observed behavior:
- No modal dialog for expected exception event.
- No stable fatal-error text containing expected exception token.
Needed fix later:
- Ensure evaluator/dispatch layer emits correct `xforms-*-exception` event for these failures.
- Ensure fallback fatal text path preserves explicit exception token when event cannot dispatch.
- Keep behavior aligned with W3C criteria (`message OR fatal due to same exception`).
## Ch7 `7.8.2.c` invalid property output stability
`property('invalid')` path currently fails before stable `"Invalid Property : <empty>"` output can be asserted.
Affected promoted behavioral test:
- `7.8.2.c — property() invalid NCNAME renders empty Invalid Property output`
Needed fix later:
- Preserve render of output label/value container even when `xforms-binding-exception` fires.
- Keep value empty while still surfacing expected exception signal.
## Ch8 smoke promotions blocked by missing event/message dispatch
Several Chapter 8 controls render, but required modal/event signals are not emitted consistently enough for deterministic behavioral assertions.
Affected smoke tests:
- `8.1.2.a — input incremental`
- `8.1.4.a — textarea incremental`
- `8.1.10.d — select out of range`
- `8.1.11.d — select1 out of range`
- `8.2.4.a — alert refs instance`
- `8.2.4.b — alert inline text`
- `8.2.4.c — alert binding precedence`
- `8.3.3.a — value binding restrictions`
Observed behavior:
- Prior promotion attempts timed out waiting for expected dialogs/messages.
- `8.1.10.d` and `8.1.11.d` can update output to `Selected Flavor : mango`, but `xforms-out-of-range` messaging is not surfaced.
Needed fix later:
- Ensure the event pipeline dispatches `xforms-value-changed` and `xforms-out-of-range` reliably and executes `xforms:message` actions.
- Wire `xf:alert` to a test-observable message path, including bind/ref precedence handling.
- Emit stable `xforms-binding-exception` signaling for invalid `xf:value` binding cases.
## Ch8 secret control support blocks promotion
Affected smoke tests:
- `8.1.3.a — secret incremental`
- `8.1.3.b — secret binding restrictions`
Observed behavior:
- Secret control rendering/input semantics are not stable enough to assert incremental behavior.
Needed fix later:
- Implement `xf:secret` rendering as an interactable password control with correct binding wiring.
- Support `incremental=\"true\"` dispatch semantics for `xf:secret`.
- Enforce secret-control datatype restrictions with `xforms-binding-exception` (or explicit fatal token fallback).
## Ch8 upload smoke coverage needs deterministic upload semantics
Affected smoke tests:
- `8.1.6.b — upload incremental`
- `8.1.6.c — upload filename/mediatype`
- `8.1.6.d — upload binding restrictions`
- `8.1.6.e — upload element`
Note:
- `8.1.6.a` is non-normative and remains render-only.
Needed fix later:
- Propagate selected file name/content-type into bound instance nodes and related outputs deterministically.
- Dispatch `xforms-value-changed` for incremental upload interactions.
- Enforce upload datatype restrictions with binding-exception signaling.
## Ch8 exception/fatal-token signaling still needs hardening
Affected smoke tests:
- `8.1.1.a — form control binding restriction`
- `8.1.1.c — relevant becoming non-relevant`
- `8.1.4.b — textarea binding restrictions`
- `8.1.5.c — output UI common`
- `8.1.6.d — upload binding restrictions`
- `8.1.7.f — range binding restrictions`
- `8.1.7.g — range binding basic`
Current blocker:
- These rely on stable exception/message signaling (`xforms-binding-exception` or equivalent modal/fatal token), which is not yet deterministic enough for strict behavioral assertions.
Needed fix later:
- Centralize exception propagation so both modal-message and fatal-text fallback paths preserve explicit exception tokens.
- Ensure control action handlers receive expected exception events consistently.
## Ch8 submit smoke test lacks a deterministic assertion surface
Affected smoke test:
- `8.1.9.a — submit`
Current blocker:
- No stable, test-observable outcome is surfaced in this harness for submission completion/error.
Needed fix later:
- Expose submission lifecycle events (`xforms-submit`, `xforms-submit-done`, `xforms-submit-error`) through a deterministic UI/test hook.
## Ch8 help/hint dispatch remains a known engine gap
Affected smoke-gap tests (currently render-only `fixme`):
- `8.2.2.a — help message (inline)`
- `8.2.2.b — help message (src)`
- `8.2.2.c — help message (instance)`
- `8.2.3.a — hint message (inline)`
- `8.2.3.b — hint message (src)`
- `8.2.3.c — hint message (instance)`
Needed fix later:
- Implement `xforms-help` / `xforms-hint` dispatch behavior so messages are emitted via a test-observable path.
## XHTML+XForms direct input handling is inconsistent
Affected coverage:
- `tests/supplemental/xhtml-source-node.spec.ts` (`direct .xhtml sourceNode renders XForms controls`)
- Related harness path currently relies on pre-normalization: `test-app/w3c-runner.html`
Observed behavior:
- Direct XHTML `sourceNode` forms do not render expected XForms controls (e.g. `#xhtml-direct-root` never appears).
- Engine accepts XHTML roots, but in `xformsjs-main` the XHTML global document path is redirected to `ixsl:page()`, so provided XHTML input is not used as canonical source.
- W3C runner currently works around this by rewriting XHTML into a synthetic `xf:xform` before calling the transform.
Current blocker:
- Input handling is split across engine/runtime and harness-specific rewrite logic, so behavior differs between direct XHTML callers and runner-mediated flows.
Needed fix later:
- Add engine-level canonical normalization so both `xf:xform` and XHTML+XForms inputs converge to one internal processing path.
- Remove/replace XHTML `xforms-doc-global` → `ixsl:page()` substitution in source selection precedence so explicit input documents are honored.
- Keep relative URI/base-URI semantics stable for instance/submission resolution while normalizing input.
- After parity is proven, retire runner-only XHTML rewrite as default behavior.
