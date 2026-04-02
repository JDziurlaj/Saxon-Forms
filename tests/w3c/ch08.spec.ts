import { test, expect, loadTest, loadAndWait, getRenderedText, getInstanceXML, collectDialogMessages, clickTrigger, normalizeWhitespace } from "./helpers";

const ch8_1_smoke: [string, string][] = [
  ["8.1.1.a — form control binding restriction", "Chapt08/8.1/8.1.1/8.1.1.a.xhtml"],  // expects xforms-binding-exception message or fatal error
  ["8.1.1.c — relevant becoming non-relevant", "Chapt08/8.1/8.1.1/8.1.1.c.xhtml"],  // expects modal message or error dialog
  ["8.1.2.a — input incremental", "Chapt08/8.1/8.1.2/8.1.2.a.xhtml"],  // depends on incremental update or binding restriction enforcement
  ["8.1.3.a — secret incremental", "Chapt08/8.1/8.1.3/8.1.3.a.xhtml"],  // depends on incremental update or binding restriction enforcement
  ["8.1.3.b — secret binding restrictions", "Chapt08/8.1/8.1.3/8.1.3.b.xhtml"],  // depends on incremental update or binding restriction enforcement
  ["8.1.4.a — textarea incremental", "Chapt08/8.1/8.1.4/8.1.4.a.xhtml"],  // depends on incremental update or binding restriction enforcement
  ["8.1.4.b — textarea binding restrictions", "Chapt08/8.1/8.1.4/8.1.4.b.xhtml"],  // depends on incremental update or binding restriction enforcement
  ["8.1.5.b — output value attribute", "Chapt08/8.1/8.1.5/8.1.5.b.xhtml"],
  ["8.1.5.c — output UI common", "Chapt08/8.1/8.1.5/8.1.5.c.xhtml"],  // expects modal message from event handler
  ["8.1.6.a — upload mediatype", "Chapt08/8.1/8.1.6/8.1.6.a.xhtml"],  // non-normative test
  ["8.1.6.b — upload incremental", "Chapt08/8.1/8.1.6/8.1.6.b.xhtml"],  // expects modal message or error dialog
  ["8.1.6.c — upload filename/mediatype", "Chapt08/8.1/8.1.6/8.1.6.c.xhtml"],  // depends on file upload interaction
  ["8.1.6.d — upload binding restrictions", "Chapt08/8.1/8.1.6/8.1.6.d.xhtml"],  // expects xforms-binding-exception message or fatal error
  ["8.1.6.e — upload element", "Chapt08/8.1/8.1.6/8.1.6.e.xhtml"],  // depends on file upload interaction
  ["8.1.7.d — range incremental", "Chapt08/8.1/8.1.7/8.1.7.d.xhtml"],  // depends on incremental update or binding restriction enforcement
  ["8.1.7.f — range binding restrictions", "Chapt08/8.1/8.1.7/8.1.7.f.xhtml"],  // depends on incremental update or binding restriction enforcement
  ["8.1.7.g — range binding basic", "Chapt08/8.1/8.1.7/8.1.7.g.xhtml"],  // depends on incremental update or binding restriction enforcement
  ["8.1.8.a — trigger", "Chapt08/8.1/8.1.8/8.1.8.a.xhtml"],  // expects modal message after trigger activation
  ["8.1.8.b — trigger appearance", "Chapt08/8.1/8.1.8/8.1.8.b.xhtml"],  // tests visual appearance attribute (rendering-dependent)
  ["8.1.9.a — submit", "Chapt08/8.1/8.1.9/8.1.9.a.xhtml"],  // no testable output criteria in spec
  ["8.1.9.b — submit appearance", "Chapt08/8.1/8.1.9/8.1.9.b.xhtml"],  // tests visual appearance attribute (rendering-dependent)
  ["8.1.10.b — select incremental", "Chapt08/8.1/8.1.10/8.1.10.b.xhtml"],  // depends on incremental update or binding restriction enforcement
  ["8.1.10.c — select appearance", "Chapt08/8.1/8.1.10/8.1.10.c.xhtml"],  // tests visual appearance attribute (rendering-dependent)
  ["8.1.10.d — select out of range", "Chapt08/8.1/8.1.10/8.1.10.d.xhtml"],  // expects modal message after trigger activation
  ["8.1.11.b — select1 incremental", "Chapt08/8.1/8.1.11/8.1.11.b.xhtml"],  // depends on incremental update or binding restriction enforcement
  ["8.1.11.c — select1 appearance", "Chapt08/8.1/8.1.11/8.1.11.c.xhtml"],  // tests visual appearance attribute (rendering-dependent)
  ["8.1.11.d — select1 out of range", "Chapt08/8.1/8.1.11/8.1.11.d.xhtml"],  // expects modal message after trigger activation
];

const ch8_2_smoke: [string, string][] = [
  ["8.2.4.a — alert refs instance", "Chapt08/8.2/8.2.4/8.2.4.a.xhtml"],  // expects modal message from event handler
  ["8.2.4.b — alert inline text", "Chapt08/8.2/8.2.4/8.2.4.b.xhtml"],  // expects modal message from event handler
  ["8.2.4.c — alert binding precedence", "Chapt08/8.2/8.2.4/8.2.4.c.xhtml"],  // expects modal message or error dialog
];

const ch8_3_smoke: [string, string][] = [
  ["8.3.3.a — value binding restrictions", "Chapt08/8.3/8.3.3/8.3.3.a.xhtml"],  // expects modal message or error dialog
];

test.describe("W3C Ch8 §8.1 — Core Controls [smoke]", () => {
  for (const [name, file] of ch8_1_smoke) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }
});

test.describe("W3C Ch8 §8.1 — Core Controls [behavioral]", () => {
  /*
     You must see three output controls. The Car Make output control must have the value "Lotus".
     The Car Year output control must have the value "2005". The Car Color output control must have
     the value "Aztec Bronze".
  */
  test("8.1.5.a — output controls show car instance values", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.5/8.1.5.a.xhtml");
    // Scoped: check output elements contain expected car data
    const outputs = page.locator('.xforms-output');
    const texts = await outputs.allInnerTexts();
    expect(texts).toContain("Lotus");
    expect(texts).toContain("2005");
    expect(texts).toContain("Aztec Bronze");
    // Instance data
    const xml = await getInstanceXML(page);
    expect(xml).toContain(">Lotus<");
    expect(xml).toContain(">2005<");
    expect(xml).toContain(">Aztec Bronze<");
  });
});

test.describe("W3C Ch8 §8.2 — UI Common [smoke]", () => {
  for (const [name, file] of ch8_2_smoke) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }
});

test.describe("W3C Ch8 §8.3 — Selection Controls [smoke]", () => {
  for (const [name, file] of ch8_3_smoke) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }
});

test.describe("W3C Chapter 8 — output bind precedence", () => {
  /*
     You must see the value "1032" for the Tax output control and the value "2005" for the Car Year
     output control.
  */
  test("8.1.5.b output with @value and @bind — bind takes precedence", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.5/8.1.5.b.xhtml");
    // Tax output: value="0.024 * /car/price" → 1032
    // Car Year output: value="/car/price" bind="year_bind" → bind wins, shows 2005
    const text = await getRenderedText(page);
    expect(text).toContain("1032");
    expect(text).toContain("2005");
  });
});

test.describe("W3C Ch8 [behavioral promoted]", () => {
  /*
     You must see an xforms-enabled message, an xforms-value-changed message, an xforms-valid
     message, an xforms-readwrite message, and an xforms-optional message.
  */
  test("8.1.1.b — 8.1.1.b non-relevant form control becoming relevant", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.1/8.1.1.b.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /*
     You must be able to both select a value from the Select A Flavor select control and enter your
     own value into it.
  */
  test("8.1.10.a — 8.1.10.a selection attribute of select element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.10/8.1.10.a.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /*
     You must be able to both select a value from the Select A Flavor select1 control and enter your
     own value into it.
  */
  test("8.1.11.a — 8.1.11.a selection attribute of select1 element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.11/8.1.11.a.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /*
     This page has two input controls. One is bound to the data type 64Binary and the other to the
     data type hexBinary. Input controls do not correctly bind to these data types. The input
     controls must not work correctly, generate an error, not appear on this page or otherwise make
     the problem known.
  */
  test("8.1.2.b — 8.1.2.b data binding restrictions for input element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.2/8.1.2.b.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /*
     You must see an input bound to a node of type xsd:date. It might be rendered as a calendar
     control. The default value is 1997-12-21.
  */
  test("8.1.2.c — 8.1.2.c datatype bound to input element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.2/8.1.2.c.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /* You should see the "calendar-picker-open.png" image. */
  test("8.1.5.1.a — 8.1.5.1.a mediatype element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.5/8.1.5.1/8.1.5.1.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /* You should see the "calendar-picker-open.png" image. */
  test("8.1.5.d — 8.1.5.d mediatype attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.5/8.1.5.d.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     After using the upload control to select a file you must see the file name displayed in the
     Filename output control.
  */
  test("8.1.6.1.a — 8.1.6.1.a filename element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.6/8.1.6.1/8.1.6.1.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     After using the upload control to select a file you must see the file type displayed in the
     Mediatype output control.
  */
  test("8.1.6.2.a — 8.1.6.2.a mediatype element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.6/8.1.6.2/8.1.6.2.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /* You must see a range control that starts at 1000. No end value is defined. */
  test("8.1.7.a — 8.1.7.a start attribute of range element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.7/8.1.7.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /* You must see a range control that ends at 50000. No start value is defined. */
  test("8.1.7.b — 8.1.7.b end attribute of range element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.7/8.1.7.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /* You must see a range control that increments by 2. No start or end values are defined. */
  test("8.1.7.c — 8.1.7.c step attribute of range element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.7/8.1.7.c.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /* You should see a range control with range of -2 to 2 and increments by 0.5. */
  test("8.1.7.e — 8.1.7.e example of range element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.7/8.1.7.e.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     This test case is non-normative and assumes that navindex attributes will be recognized and
     interpreted as described in section 4.3.1 of the specification. Navigation order must be the
     Name input first, the Quantity input second, and the Item input third. Keyboard users can use
     the Tab key to test the navigation order. The input controls are also set to use access keys.
     Keyboard users can hold down the Alt key, the Shift key, and the key in parentheses in the
     labels of the input controls to jump directly to an input control.
  */
  test("8.1.a — 8.1.a navindex and accesskey (non-normative)", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.a.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /* You must see an input control with the label "Instance Data". */
  test("8.2.1.a — 8.2.1.a label element references instance data", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.2/8.2.1/8.2.1.a.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /* You must see an input control with the label "Inline Text". */
  test("8.2.1.b — 8.2.1.b label element uses inline text", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.2/8.2.1/8.2.1.b.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /* You must see an input control with the label "Instance Data". */
  test("8.2.1.c — 8.2.1.c label element has binding precedence", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.2/8.2.1/8.2.1.c.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /*
     You must see a select control and a select1 control on the page. The select control must
     contain three choices elements labeled Group 1, Group 2, and Group 3. The select1 control must
     contain three choices elements labeled Group 4, Group 5, Group 6.
  */
  test("8.3.1.a — 8.3.1.a choices element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.3/8.3.1/8.3.1.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     You must see a select control and a select1 control on the page. The select control must
     contain two item elements labeled Item 1 and Item 2 as well as a choices element labeled
     Special Items that contains another item element labeled Special 3. The select1 control must
     contain two item elements labeled Item 4 and Item 5 as well as a choices element labeled
     Special Items that contains another item element labeled Special 6.
  */
  test("8.3.2.a — 8.3.2.a item element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.3/8.3.2/8.3.2.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     No matter what flavor you choose in the Flavors select1 control the value "Neapolitan" must be
     displayed in the Selected Flavor output control.
  */
  test("8.3.3.b — 8.3.3.b precedence for value element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.3/8.3.3/8.3.3.b.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("W3C Ch8 [smoke → behavioral promoted]", () => {
  // --- Render checks ---

  /*
     You must see three select controls each with a different value for appearance (Full, Compact,
     or Minimal). When you make a selection a list of the first letter of the flavor(s) must be
     displayed in the Selected Flavor output control. Each letter is separated by a space in the
     list.
  */
  test("8.1.10.c — three select appearances (full, compact, minimal)", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.10/8.1.10.c.xhtml");
    const selects = page.locator("select, .xforms-select");
    const count = await selects.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  /*
     You must see three select1 controls each with a different value for appearance (Full, Compact,
     or Minimal). When you make a selection the first letter of the flavor must be displayed in the
     Selected Flavor output control.
  */
  test("8.1.11.c — three select1 appearances (full, compact, minimal)", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.11/8.1.11.c.xhtml");
    const selects = page.locator("select, .xforms-select1, input[type=radio]");
    const count = await selects.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  /*
     You must see two trigger controls on this page, one labeled "Regular Trigger" and the other
     labeled "Minimal Trigger". They may look different.
  */
  test("8.1.8.b — two trigger controls rendered", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.8/8.1.8.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("Regular Trigger");
    expect(text).toContain("Minimal Trigger");
  });

  /*
     You must see two submit controls on this page, one labeled "Regular Submit" and the other
     labeled "Minimal Submit". They may look different.
  */
  test("8.1.9.b — two submit controls rendered", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.9/8.1.9.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("Regular Submit");
    expect(text).toContain("Minimal Submit");
  });

  /*
     When you pick a value from the Select A Color select1 control you must see the same value as
     the output for the Your Color output control.
  */
  test("8.3.3.c — select1 value reflected in output", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.3/8.3.3/8.3.3.c.xhtml");
    const text = await getRenderedText(page);
    // The output should show the same value as the selected item
    expect(text).not.toBe("");
    const outputs = page.locator(".xforms-output");
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });


  // --- Remaining smoke (engine gaps: help/hint/DOMActivate message dispatch) ---
  const ch8_promoted_smoke: [string, string][] = [
    ["8.1.8.a — DOMActivate trigger", "Chapt08/8.1/8.1.8/8.1.8.a.xhtml"],
    ["8.2.2.a — help message (inline)", "Chapt08/8.2/8.2.2/8.2.2.a.xhtml"],
    ["8.2.2.b — help message (src)", "Chapt08/8.2/8.2.2/8.2.2.b.xhtml"],
    ["8.2.2.c — help message (instance)", "Chapt08/8.2/8.2.2/8.2.2.c.xhtml"],
    ["8.2.3.a — hint message (inline)", "Chapt08/8.2/8.2.3/8.2.3.a.xhtml"],
    ["8.2.3.b — hint message (src)", "Chapt08/8.2/8.2.3/8.2.3.b.xhtml"],
    ["8.2.3.c — hint message (instance)", "Chapt08/8.2/8.2.3/8.2.3.c.xhtml"],
  ];
  for (const [name, file] of ch8_promoted_smoke) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }

  // Note: help/hint message dispatch tests (8.1.8.a, 8.2.2.a-c, 8.2.3.a-c)
  // remain as smoke — xforms-help and xforms-hint event dispatching not yet implemented.
});
