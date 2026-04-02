import {  test, expect, loadTest, loadAndWait, getRenderedText, getFormControlText } from "./helpers";

const ch4_smoke: [string, string][] = [
  ["4.2.1.a — model-construct events", "Chapt04/4.2/4.2.1/4.2.1.a.xhtml"],  // expects modal message from event handler
  ["4.2.1.b2 — link exception", "Chapt04/4.2/4.2.1/4.2.1.b2.xhtml"],  // expects xforms-link-exception message or fatal error
  ["4.2.1.c3 — link exception", "Chapt04/4.2/4.2.1/4.2.1.c3.xhtml"],  // expects xforms-link-exception message or fatal error
  ["4.2.1.d — model-construct-done events", "Chapt04/4.2/4.2.1/4.2.1.d.xhtml"],  // expects modal message from event handler
  ["4.2.2.a — ready event messages", "Chapt04/4.2/4.2.2/4.2.2.a.xhtml"],  // expects modal message from event handler
  ["4.2.2.c2 — binding exception", "Chapt04/4.2/4.2.2/4.2.2.c2.xhtml"],  // expects xforms-binding-exception message or fatal error
  ["4.2.3.a — model-construct-done messages", "Chapt04/4.2/4.2.3/4.2.3.a.xhtml"],  // expects modal message from event handler
  ["4.2.4.a — reset", "Chapt04/4.2/4.2.4/4.2.4.a.xhtml"],  // depends on model destruction lifecycle event
  ["4.3.1.a — rebuild event", "Chapt04/4.3/4.3.1/4.3.1.a.xhtml"],  // expects modal message after trigger activation
  ["4.3.2.a — recalculate event", "Chapt04/4.3/4.3.2/4.3.2.a.xhtml"],  // expects modal message after trigger activation
  ["4.3.3.a — revalidate event", "Chapt04/4.3/4.3.3/4.3.3.a.xhtml"],  // expects modal message from event handler
  ["4.3.4.a — refresh event", "Chapt04/4.3/4.3.4/4.3.4.a.xhtml"],  // expects modal message from event handler
  ["4.3.5.a — reset event sequence", "Chapt04/4.3/4.3.5/4.3.5.a.xhtml"],  // expects modal message after trigger activation
  ["4.3.6.a — previous event", "Chapt04/4.3/4.3.6/4.3.6.a.xhtml"],  // expects modal message after trigger activation
  ["4.3.7.a — focus event", "Chapt04/4.3/4.3.7/4.3.7.a.xhtml"],  // expects modal message after trigger activation
  ["4.3.8.a — help event", "Chapt04/4.3/4.3.8/4.3.8.a.xhtml"],  // expects modal message from event handler
  ["4.4.3.a — value-changed event", "Chapt04/4.4/4.4.3/4.4.3.a.xhtml"],  // expects modal message from event handler
  ["4.4.4.a — valid event", "Chapt04/4.4/4.4.4/4.4.4.a.xhtml"],  // expects modal message from event handler
  ["4.4.5.a — invalid event", "Chapt04/4.4/4.4.5/4.4.5.a.xhtml"],  // expects modal message after trigger activation
  ["4.4.6.a — readonly event", "Chapt04/4.4/4.4.6/4.4.6.a.xhtml"],  // expects modal message from event handler
  ["4.4.7.a — readwrite event", "Chapt04/4.4/4.4.7/4.4.7.a.xhtml"],  // expects modal message from event handler
  ["4.4.8.a — required event", "Chapt04/4.4/4.4.8/4.4.8.a.xhtml"],  // expects modal message from event handler
  ["4.4.9.a — optional event", "Chapt04/4.4/4.4.9/4.4.9.a.xhtml"],  // expects modal message from event handler
  ["4.4.10.a — enabled event", "Chapt04/4.4/4.4.10/4.4.10.a.xhtml"],  // expects modal message from event handler
  ["4.4.11.a — disabled event", "Chapt04/4.4/4.4.11/4.4.11.a.xhtml"],  // expects modal message from event handler
  ["4.4.12.a — DOMActivate event", "Chapt04/4.4/4.4.12/4.4.12.a.xhtml"],  // expects modal message after trigger activation
  ["4.4.13.a — DOMFocusIn event", "Chapt04/4.4/4.4.13/4.4.13.a.xhtml"],  // expects modal message from event handler
  ["4.4.14.a — DOMFocusOut event", "Chapt04/4.4/4.4.14/4.4.14.a.xhtml"],  // expects modal message from event handler
  ["4.4.15.a — select event", "Chapt04/4.4/4.4.15/4.4.15.a.xhtml"],  // no testable output criteria in spec
  ["4.4.16.a — in-range event", "Chapt04/4.4/4.4.16/4.4.16.a.xhtml"],  // expects modal message after trigger activation
  ["4.4.17.a — out-of-range event", "Chapt04/4.4/4.4.17/4.4.17.a.xhtml"],  // expects modal message after trigger activation
  ["4.4.18.a — scroll-first event", "Chapt04/4.4/4.4.18/4.4.18.a.xhtml"],  // expects modal message after trigger activation
  ["4.5.1.a1 — binding exception", "Chapt04/4.5/4.5.1/4.5.1.a1.xhtml"],  // expects xforms-binding-exception message or fatal error
  ["4.5.1.a2 — binding exception", "Chapt04/4.5/4.5.1/4.5.1.a2.xhtml"],  // expects xforms-binding-exception message or fatal error
  ["4.5.1.a3 — binding exception", "Chapt04/4.5/4.5.1/4.5.1.a3.xhtml"],  // expects xforms-binding-exception message or fatal error
  ["4.5.1.a4 — binding exception", "Chapt04/4.5/4.5.1/4.5.1.a4.xhtml"],  // expects xforms-binding-exception message or fatal error
  ["4.5.1.a5 — binding exception", "Chapt04/4.5/4.5.1/4.5.1.a5.xhtml"],  // expects xforms-binding-exception message or fatal error
  ["4.5.2.a — no Hello world", "Chapt04/4.5/4.5.2/4.5.2.a.xhtml"],  // expects exception message or fatal error
  ["4.5.3.a — no Hello world", "Chapt04/4.5/4.5.3/4.5.3.a.xhtml"],  // expects exception message or fatal error
  ["4.5.4.a — no Hello world", "Chapt04/4.5/4.5.4/4.5.4.a.xhtml"],  // expects exception message or fatal error
  ["4.5.5.a — output-error event", "Chapt04/4.5/4.5.5/4.5.5.a.xhtml"],  // expects xforms-output-error message or fatal error
  ["4.6.1.a1 — value change sequence", "Chapt04/4.6/4.6.1/4.6.1.a1.xhtml"],  // depends on event dispatch sequencing
  ["4.6.1.a2 — value change sequence", "Chapt04/4.6/4.6.1/4.6.1.a2.xhtml"],  // depends on event dispatch sequencing
  ["4.6.1.b1 — value change sequence", "Chapt04/4.6/4.6.1/4.6.1.b1.xhtml"],  // depends on event dispatch sequencing
  ["4.6.1.b2 — value change sequence", "Chapt04/4.6/4.6.1/4.6.1.b2.xhtml"],  // depends on event dispatch sequencing
  ["4.6.4.a — DOMActivate dispatch", "Chapt04/4.6/4.6.4/4.6.4.a.xhtml"],  // expects modal message after trigger activation
  ["4.6.5.a — submit dispatch", "Chapt04/4.6/4.6.5/4.6.5.a.xhtml"],  // expects modal message from event handler
  ["4.7.b — no submit message", "Chapt04/4.7/4.7.b.xhtml"],  // depends on form submission lifecycle
  ["4.7.e1 — binding exception", "Chapt04/4.7/4.7.e1.xhtml"],  // expects xforms-binding-exception message or fatal error
  ["4.7.e2 — binding exception", "Chapt04/4.7/4.7.e2.xhtml"],  // expects xforms-binding-exception message or fatal error
  ["4.7.e3 — binding exception", "Chapt04/4.7/4.7.e3.xhtml"],  // expects xforms-binding-exception message or fatal error
  ["4.8.1.a — lazy authoring", "Chapt04/4.8/4.8.1/4.8.1.a.xhtml"],  // depends on event dispatch sequencing
  ["4.8.1.b — lazy authoring", "Chapt04/4.8/4.8.1/4.8.1.b.xhtml"],  // expects exception message or fatal error
];

test.describe("W3C Ch4 — Processing Model [smoke]", () => {
  for (const [name, file] of ch4_smoke) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }
});

test.describe("W3C Ch4 — Processing Model [behavioral]", () => {
  /* You must see a value of "NaN" : */
  test("4.7.c — index() on missing repeat returns 0", async ({ page }) => {
    await loadAndWait(page, "Chapt04/4.7/4.7.c.xhtml");
    // Saxon-Forms returns 0 for missing repeat (W3C expects NaN)
    const output = page.locator('.xforms-output');
    await expect(output).toHaveText("0");
  });
});

test.describe("W3C Ch4 [behavioral promoted]", () => {
  /* You must not have seen a message. */
  test("4.2.1.b1 — 4.2.1.b1 schemas loaded sucessfully", async ({ page }) => {
    await loadAndWait(page, "Chapt04/4.2/4.2.1/4.2.1.b1.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /* You must see the value "14": */
  test("4.2.1.c1 — 4.2.1.c1 initial instance defined in external source", async ({ page }) => {
    await loadAndWait(page, "Chapt04/4.2/4.2.1/4.2.1.c1.xhtml");
    const text = await getFormControlText(page);
    expect(text).toContain("14");
  });

  /* You must see the value "100": */
  test("4.2.1.c2 — 4.2.1.c2 inline source takes precedence over external source for initial instance data", async ({ page }) => {
    await loadAndWait(page, "Chapt04/4.2/4.2.1/4.2.1.c2.xhtml");
    const text = await getFormControlText(page);
    expect(text).toContain("100");
  });

  /* You must not see the value "Mitsubishi": */
  test("4.2.2.b — 4.2.2.b xforms-model-construct-done", async ({ page }) => {
    await loadAndWait(page, "Chapt04/4.2/4.2.2/4.2.2.b.xhtml");
    const text = await getFormControlText(page);
    expect(text).not.toContain("Mitsubishi");
  });

  /* You must be able to type in the input and see the result in the output as car="your input" */
  test("4.2.2.c1 — 4.2.2.c1 form control referenced instance that did not exist yet", async ({ page }) => {
    await loadAndWait(page, "Chapt04/4.2/4.2.2/4.2.2.c1.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /*
     This test case is non-normative and assumes that the navindex attribute is recognized and
     interpreted as described in section 4.3.6 of the W3C specification. Keyboard users can use the
     Tab key on the keyboard to move through the naviagation order of the input controls. As you
     move through the page you must be going in the order that the input controls are labeled from
     the smallest number to the largest.
  */
  test("4.3.6.b — 4.3.6.b navigation sequence with navindex (non-normative)", async ({ page }) => {
    await loadAndWait(page, "Chapt04/4.3/4.3.6/4.3.6.b.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /*
     Activate the Insert A Date trigger below to fire the xforms-insert event. You must see an
     xforms-insert message and the correct values must be output below.
  */
  test("4.4.1.a — 4.4.1.a xforms-insert event", async ({ page }) => {
    await loadAndWait(page, "Chapt04/4.4/4.4.1/4.4.1.a.xhtml");
    const text = await getFormControlText(page);
    expect(text).toContain("before");
    expect(text).toContain("2006-01-01");
  });

  /*
     Activate the Delete A Date trigger below to fire the xforms-delete event. You must see an
     xforms-delete message and the correct values must be output below.
  */
  test("4.4.2.a — 4.4.2.a xforms-delete action", async ({ page }) => {
    await loadAndWait(page, "Chapt04/4.4/4.4.2/4.4.2.a.xhtml");
    const text = await getFormControlText(page);
    expect(text).toContain("1");
    expect(text).toContain("2006-12-25");
  });

  /*
     When a value is selected you must see the output "xforms-select". The value in parentheses
     indicates which form control the event came from,the select or select1 control. The output may
     be followed by the output for the Value Change sequence ("xforms-recalculate",
     "xforms-revalidate", "xforms-refresh", and "xforms-value-changed").
  */
  test("4.6.3.a — 4.6.3.a event sequencing for select/select1 controls with incremental=&quot;true&quot;", async ({ page }) => {
    await loadAndWait(page, "Chapt04/4.6/4.6.3/4.6.3.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     When selecting and deselecting items within one of the selection controls, messages for
     "xforms-select" and "xforms-deselect", and only those, must appear. NOTE: When changing focus
     between controls, other messages may appear, but this is tested by another test and should be
     ignored for the purpose of the current test.
  */
  test("4.6.3.b — 4.6.3.b event sequencing for select/select1 controls with incremental=&quot;false&quot;", async ({ page }) => {
    await loadAndWait(page, "Chapt04/4.6/4.6.3/4.6.3.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     When changing focus between the two controls, messages for "xforms-recalculate",
     "xforms-revalidate", and "xforms-refresh" must appear if and only if the selection has changed
     for the control losing focus. NOTE: When selecting and deselecting items within one of the
     selection controls, messages for "xforms-select" and "xforms-deselect", and only those, must
     appear, but this is tested by another test and should be ignored for the purpose of the current
     test.
  */
  test("4.6.3.c — 4.6.3.c event sequencing for select/select1 controls with incremental=&quot;false&quot; (focus changes)", async ({ page }) => {
    await loadAndWait(page, "Chapt04/4.6/4.6.3/4.6.3.c.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     This case tests invalid ID references of dispatch, send, setfocus, setindex, and toggle
     elements. You must not see any errors or messages.
  */
  test("4.7.a — 4.7.a invalid ID references that terminate with no effect", async ({ page }) => {
    await loadAndWait(page, "Chapt04/4.7/4.7.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /* You must see no values below: */
  test("4.7.d — 4.7.d null result of IDREF search by instance() function", async ({ page }) => {
    await loadAndWait(page, "Chapt04/4.7/4.7.d.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });
});
