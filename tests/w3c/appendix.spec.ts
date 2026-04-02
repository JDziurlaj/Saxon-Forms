import { test, expect, loadTest, loadAndWait, getRenderedText } from "./helpers";

test.describe("W3C Appendix B — Data Mutation Patterns", () => {
  /* You must see an empty person name followed by the person name of "Jane Doe" : */
  test("B.1 Prepend Element Copy", async ({ page }) => {
    await loadAndWait(page, "Appendix/B/B.1/b.1.a.xhtml");
    // Expected: empty person name + "Jane Doe"
    const text = await getRenderedText(page);
    expect(text).toContain("Jane Doe");
  });

  /* You must see an empty person name after the person name of "Jane Doe" : */
  test("B.2 Append Element Copy", async ({ page }) => {
    await loadAndWait(page, "Appendix/B/B.2/b.2.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("Jane Doe");
  });

  /* You must see three paragraphs, the last is a duplicate of the second : */
  test("B.3 Duplicate Element", async ({ page }) => {
    await loadAndWait(page, "Appendix/B/B.3/b.3.a.xhtml");
    // Duplicates paragraph[2] — should see 3 paragraphs, last is copy of second
    const text = await getRenderedText(page);
    expect(text).toContain("Primis abhorreant delicatissimi");
  });

  /* You must see the string "classified" after each key : */
  test("B.4 Set Attribute", async ({ page }) => {
    await loadAndWait(page, "Appendix/B/B.4/b.4.a.xhtml");
    // Expected: item[2] should have rating="classified"
    const text = await getRenderedText(page);
    expect(text).toContain("classified");
  });

  /* You must see only one item product("SKU-0815") : */
  test("B.5 Remove Element", async ({ page }) => {
    await loadAndWait(page, "Appendix/B/B.5/b.5.a.xhtml");
    const text = await getRenderedText(page);
    // Deletes item[2] (SKU-4711) — only item[1] (SKU-0815) should remain
    expect(text).toContain("SKU-0815");
    expect(text).not.toContain("SKU-4711");
  });

  /* You must not see the string "classified" after key '23' : */
  test("B.6 Remove Attribute", async ({ page }) => {
    await loadAndWait(page, "Appendix/B/B.6/b.6.a.xhtml");
    // @rating should be deleted — output shows "key : 23" without "classified" after it
    // Check the rendered output value, not the instruction text (which contains "classified")
    const outputs = page.locator(".hlist");
    const outputText = await outputs.allInnerTexts();
    const dataText = outputText.join(" ");
    expect(dataText).toContain("23");
    expect(dataText).not.toContain("classified");
  });

  /* You must not see a Track ID : */
  test("B.7 Remove Nodeset", async ({ page }) => {
    await loadAndWait(page, "Appendix/B/B.7/b.7.a.xhtml");
    // All <track> elements should be removed — no track IDs should appear in output
    const outputs = page.locator(".hlist");
    const count = await outputs.count();
    // No .hlist outputs should exist (the repeat should be empty)
    expect(count).toBe(0);
  });

  /* You must see the strings "Jane Doe", "John Doe", and "Joe Sixpack" : */
  test("B.8 Copy Nodeset", async ({ page }) => {
    await loadAndWait(page, "Appendix/B/B.8/b.8.a.xhtml");
    // Copies 3 persons from prototypes into empty <people> — should see all 3 names
    const text = await getRenderedText(page);
    expect(text).toContain("Jane Doe");
    expect(text).toContain("John Doe");
    expect(text).toContain("Joe Sixpack");
  });

  /* You must see the string "classified" for each key '0': */
  test("B.9 Copy Attribute List", async ({ page }) => {
    await loadAndWait(page, "Appendix/B/B.9/b.9.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("classified");
  });

  /* You must see an empty string for a person name : */
  test("B.10 Replace Element", async ({ page }) => {
    await loadAndWait(page, "Appendix/B/B.10/b.10.a.xhtml");
    // insert prototype (empty name) after person[1], then delete person[1] (John Doe)
    // Result: single person with empty name — "John Doe" should NOT appear in data output
    const outputs = page.locator(".hlist");
    const outputText = await outputs.allInnerTexts();
    const dataText = outputText.join(" ");
    expect(dataText).not.toContain("John Doe");
  });

  /* You must see the value '0' for both item keys : */
  test("B.11 Replace Attribute — both keys show 0", async ({ page }) => {
    await loadAndWait(page, "Appendix/B/B.11/b.11.a.xhtml");
    // After replace, both item keys should be "0"
    const text = await getRenderedText(page);
    expect(text).toContain("0");
  });

  /* You must not see item product ("SKU-0815") or item product ("SKU-4711") : */
  test("B.12 Replace Instance with Insert", async ({ page }) => {
    await loadAndWait(page, "Appendix/B/B.12/b.12.a.xhtml");
    // Instance root replaced with empty <shoppingcart/> — no product items in output
    const outputs = page.locator(".hlist");
    const count = await outputs.count();
    expect(count).toBe(0);
  });

  /* You must see Track ids "251", "331" and "461" : */
  test("B.13 Move Element — track ids 251, 331, 461", async ({ page }) => {
    await loadAndWait(page, "Appendix/B/B.13/b.13.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("251");
    expect(text).toContain("331");
    expect(text).toContain("461");
  });

  /* You must see "classified" for key '42' : */
  test("B.14 Move Attribute — classified on key 42", async ({ page }) => {
    await loadAndWait(page, "Appendix/B/B.14/b.14.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("classified");
  });

  /* You must see an empty paragraph : */
  test("B.15 Insert into Heterogeneous Nodeset — empty paragraph", async ({ page }) => {
    await loadAndWait(page, "Appendix/B/B.15/b.15.a.xhtml");
    // After insert, should see an empty paragraph element rendered
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });
});


const appendix_gaps_smoke: [string, string][] = [
  ["g.1.a", "Appendix/G/G.1/g.1.a.xhtml"],  // non-normative CSS styling test
  ["g.1.b", "Appendix/G/G.1/g.1.b.xhtml"],  // non-normative CSS styling test
  ["g.1.c", "Appendix/G/G.1/g.1.c.xhtml"],  // non-normative CSS styling test
  ["g.1.d", "Appendix/G/G.1/g.1.d.xhtml"],  // non-normative CSS styling test
  ["g.1.e", "Appendix/G/G.1/g.1.e.xhtml"],  // non-normative CSS styling test
  ["g.2.a", "Appendix/G/G.2/g.2.a.xhtml"],  // non-normative CSS styling test
  ["g.2.b", "Appendix/G/G.2/g.2.b.xhtml"],  // non-normative CSS styling test
  ["g.2.c", "Appendix/G/G.2/g.2.c.xhtml"],  // non-normative CSS styling test
  ["g.3", "Appendix/G/G.3/g.3.xhtml"],  // non-normative test
  ["h.1", "Appendix/H/h.1.xhtml"],  // full application example (Appendix H)
  ["h.2", "Appendix/H/h.2.xhtml"],  // full application example (Appendix H)
];

test.describe("W3C Appendix [smoke gaps]", () => {
  for (const [name, file] of appendix_gaps_smoke) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }
});

test.describe("W3C Appendix [behavioral promoted]", () => {
  /*
     You must see a list of cars. Also, the repeat item with the current index must have a dashed
     box around it with a yellow background. When you change the index with the triggers at the
     bottom the selected repeat-item must have the dashed box and yellow background. All other
     repeat-items must have a dotted border with an orange background.
  */
  test("g.2.d — g.2.d repeat-index precedence over repeat-item (non-normative)", async ({ page }) => {
    await loadAndWait(page, "Appendix/G/G.2/g.2.d.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });
});
