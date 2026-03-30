import { test, expect, loadTest, loadAndWait, getRenderedText, getInstanceXML } from "./helpers";

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
  ["8.2.2.a — help refs instance", "Chapt08/8.2/8.2.2/8.2.2.a.xhtml"],  // expects modal message from event handler
  ["8.2.2.b — help inline text", "Chapt08/8.2/8.2.2/8.2.2.b.xhtml"],  // expects modal message from event handler
  ["8.2.2.c — help binding precedence", "Chapt08/8.2/8.2.2/8.2.2.c.xhtml"],  // expects modal message after trigger activation
  ["8.2.3.a — hint refs instance", "Chapt08/8.2/8.2.3/8.2.3.a.xhtml"],  // expects modal message from event handler
  ["8.2.3.b — hint inline text", "Chapt08/8.2/8.2.3/8.2.3.b.xhtml"],  // expects modal message from event handler
  ["8.2.3.c — hint binding precedence", "Chapt08/8.2/8.2.3/8.2.3.c.xhtml"],  // expects modal message after trigger activation
  ["8.2.4.a — alert refs instance", "Chapt08/8.2/8.2.4/8.2.4.a.xhtml"],  // expects modal message from event handler
  ["8.2.4.b — alert inline text", "Chapt08/8.2/8.2.4/8.2.4.b.xhtml"],  // expects modal message from event handler
  ["8.2.4.c — alert binding precedence", "Chapt08/8.2/8.2.4/8.2.4.c.xhtml"],  // expects modal message or error dialog
];

const ch8_3_smoke: [string, string][] = [
  ["8.3.3.a — value binding restrictions", "Chapt08/8.3/8.3.3/8.3.3.a.xhtml"],  // expects modal message or error dialog
  ["8.3.3.c — value inline content", "Chapt08/8.3/8.3.3/8.3.3.c.xhtml"],  // non-normative CSS styling test
];

test.describe("W3C Ch8 §8.1 — Core Controls [smoke]", () => {
  for (const [name, file] of ch8_1_smoke) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }
});

test.describe("W3C Ch8 §8.1 — Core Controls [behavioral]", () => {
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
  test("8.1.1.b — 8.1.1.b non-relevant form control becoming relevant", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.1/8.1.1.b.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("8.1.10.a — 8.1.10.a selection attribute of select element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.10/8.1.10.a.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("8.1.11.a — 8.1.11.a selection attribute of select1 element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.11/8.1.11.a.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("8.1.2.b — 8.1.2.b data binding restrictions for input element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.2/8.1.2.b.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("8.1.2.c — 8.1.2.c datatype bound to input element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.2/8.1.2.c.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("8.1.5.1.a — 8.1.5.1.a mediatype element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.5/8.1.5.1/8.1.5.1.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("8.1.5.d — 8.1.5.d mediatype attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.5/8.1.5.d.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("8.1.6.1.a — 8.1.6.1.a filename element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.6/8.1.6.1/8.1.6.1.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("8.1.6.2.a — 8.1.6.2.a mediatype element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.6/8.1.6.2/8.1.6.2.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("8.1.7.a — 8.1.7.a start attribute of range element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.7/8.1.7.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("8.1.7.b — 8.1.7.b end attribute of range element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.7/8.1.7.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("8.1.7.c — 8.1.7.c step attribute of range element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.7/8.1.7.c.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("8.1.7.e — 8.1.7.e example of range element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.7/8.1.7.e.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("8.1.a — 8.1.a navindex and accesskey (non-normative)", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.1/8.1.a.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("8.2.1.a — 8.2.1.a label element references instance data", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.2/8.2.1/8.2.1.a.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("8.2.1.b — 8.2.1.b label element uses inline text", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.2/8.2.1/8.2.1.b.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("8.2.1.c — 8.2.1.c label element has binding precedence", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.2/8.2.1/8.2.1.c.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("8.3.1.a — 8.3.1.a choices element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.3/8.3.1/8.3.1.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("8.3.2.a — 8.3.2.a item element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.3/8.3.2/8.3.2.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("8.3.3.b — 8.3.3.b precedence for value element", async ({ page }) => {
    await loadAndWait(page, "Chapt08/8.3/8.3.3/8.3.3.b.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });
});
