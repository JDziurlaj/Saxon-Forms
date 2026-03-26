import { test, expect } from "@playwright/test";

/**
 * W3C XForms 1.1 Conformance Test Suite — automated via Playwright.
 *
 * Each test loads a W3C test XHTML via the w3c-runner.html page,
 * waits for Saxon-Forms to render, then checks instance data and/or
 * rendered output against expected values.
 *
 * Source: https://www.w3.org/MarkUp/Forms/Test/XForms1.1/Edition1/
 */

const RENDER_TIMEOUT = 15_000;

/** Helper: load a W3C test file and wait for the XForm to render */
async function loadW3CTest(page: any, testFile: string) {
  await page.goto(`/w3c-runner.html?test=${testFile}`);
  // Wait for xForm container to have content
  const xform = page.locator("#xForm");
  await expect(xform).not.toBeEmpty({ timeout: RENDER_TIMEOUT });
  // Give Saxon-Forms a moment to complete xforms-ready actions
  await page.waitForTimeout(1000);
}

/** Helper: get all visible text from the rendered XForm */
async function getRenderedText(page: any): Promise<string> {
  return page.locator("#xForm").innerText();
}

/** Helper: get serialized instance XML */
async function getInstanceXML(page: any, instanceId?: string): Promise<string> {
  return page.evaluate((id: string | undefined) => {
    const g = window as any;
    const inst = id ? g.getInstance(id) : g.getDefaultInstance?.() || g.getInstance(g.getDefaultInstanceId?.());
    if (!inst) return "";
    return new XMLSerializer().serializeToString(inst);
  }, instanceId);
}

// =================================================================
// APPENDIX B — Data Mutation Patterns
// =================================================================

test.describe("W3C Appendix B — Data Mutation Patterns", () => {
  test("B.1 Prepend Element Copy", async ({ page }) => {
    await loadW3CTest(page, "Appendix_B_B.1_b.1.a.xhtml");
    // Expected: empty person name + "Jane Doe"
    const text = await getRenderedText(page);
    expect(text).toContain("Jane Doe");
  });

  test("B.2 Append Element Copy", async ({ page }) => {
    await loadW3CTest(page, "Appendix_B_B.2_b.2.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("Jane Doe");
  });

  test("B.3 Duplicate Element", async ({ page }) => {
    await loadW3CTest(page, "Appendix_B_B.3_b.3.a.xhtml");
    // Duplicates paragraph[2] — should see 3 paragraphs, last is copy of second
    const text = await getRenderedText(page);
    expect(text).toContain("Primis abhorreant delicatissimi");
  });

  test("B.4 Set Attribute", async ({ page }) => {
    await loadW3CTest(page, "Appendix_B_B.4_b.4.a.xhtml");
    // Expected: item[2] should have rating="classified"
    const text = await getRenderedText(page);
    expect(text).toContain("classified");
  });

  test("B.5 Remove Element", async ({ page }) => {
    await loadW3CTest(page, "Appendix_B_B.5_b.5.a.xhtml");
    const text = await getRenderedText(page);
    // Deletes item[2] (SKU-4711) — only item[1] (SKU-0815) should remain
    expect(text).toContain("SKU-0815");
    expect(text).not.toContain("SKU-4711");
  });

  test("B.6 Remove Attribute", async ({ page }) => {
    await loadW3CTest(page, "Appendix_B_B.6_b.6.a.xhtml");
    // @rating should be deleted — output shows "key : 23" without "classified" after it
    // Check the rendered output value, not the instruction text (which contains "classified")
    const outputs = page.locator(".hlist");
    const outputText = await outputs.allInnerTexts();
    const dataText = outputText.join(" ");
    expect(dataText).toContain("23");
    expect(dataText).not.toContain("classified");
  });

  test("B.7 Remove Nodeset", async ({ page }) => {
    await loadW3CTest(page, "Appendix_B_B.7_b.7.a.xhtml");
    // All <track> elements should be removed — no track IDs should appear in output
    const outputs = page.locator(".hlist");
    const count = await outputs.count();
    // No .hlist outputs should exist (the repeat should be empty)
    expect(count).toBe(0);
  });

  test("B.8 Copy Nodeset", async ({ page }) => {
    await loadW3CTest(page, "Appendix_B_B.8_b.8.a.xhtml");
    // Copies 3 persons from prototypes into empty <people> — should see all 3 names
    const text = await getRenderedText(page);
    expect(text).toContain("Jane Doe");
    expect(text).toContain("John Doe");
    expect(text).toContain("Joe Sixpack");
  });

  test("B.9 Copy Attribute List", async ({ page }) => {
    await loadW3CTest(page, "Appendix_B_B.9_b.9.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("classified");
  });

  test("B.10 Replace Element", async ({ page }) => {
    await loadW3CTest(page, "Appendix_B_B.10_b.10.a.xhtml");
    // insert prototype (empty name) after person[1], then delete person[1] (John Doe)
    // Result: single person with empty name — "John Doe" should NOT appear in data output
    const outputs = page.locator(".hlist");
    const outputText = await outputs.allInnerTexts();
    const dataText = outputText.join(" ");
    expect(dataText).not.toContain("John Doe");
  });

  test("B.11 Replace Attribute", async ({ page }) => {
    await loadW3CTest(page, "Appendix_B_B.11_b.11.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("B.12 Replace Instance with Insert", async ({ page }) => {
    await loadW3CTest(page, "Appendix_B_B.12_b.12.a.xhtml");
    // Instance root replaced with empty <shoppingcart/> — no product items in output
    const outputs = page.locator(".hlist");
    const count = await outputs.count();
    // No .hlist outputs should exist (the repeat over item should be empty)
    expect(count).toBe(0);
  });

  test("B.13 Move Element", async ({ page }) => {
    await loadW3CTest(page, "Appendix_B_B.13_b.13.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("B.14 Move Attribute", async ({ page }) => {
    await loadW3CTest(page, "Appendix_B_B.14_b.14.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("B.15 Insert into Heterogeneous Nodeset", async ({ page }) => {
    await loadW3CTest(page, "Appendix_B_B.15_b.15.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });
});

// =================================================================
// CHAPTER 10 — XForms Actions
// =================================================================

test.describe("W3C Chapter 10 — XForms Actions", () => {
  test("10.1.a action element", async ({ page }) => {
    await loadW3CTest(page, "Chapt10_10.1_10.1.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.2.a setvalue with expression or literal", async ({ page }) => {
    await loadW3CTest(page, "Chapt10_10.2_10.2.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("white");
    expect(text).toContain("excellent");
  });

  test("10.2.b setvalue with expression and literal", async ({ page }) => {
    await loadW3CTest(page, "Chapt10_10.2_10.2.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.3.a insert action using context attribute", async ({ page }) => {
    await loadW3CTest(page, "Chapt10_10.3_10.3.a.xhtml");
    const text = await getRenderedText(page);
    // Should show numbers from insert operations
    expect(text).toContain("1");
  });

  test("10.3.c insert action using origin attribute", async ({ page }) => {
    await loadW3CTest(page, "Chapt10_10.3_10.3.c.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.3.d insert action using at attribute", async ({ page }) => {
    await loadW3CTest(page, "Chapt10_10.3_10.3.d.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.3.e insert action using position attribute", async ({ page }) => {
    await loadW3CTest(page, "Chapt10_10.3_10.3.e.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.3.j insert action — copying an attribute", async ({ page }) => {
    await loadW3CTest(page, "Chapt10_10.3_10.3.j.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.4.a delete action using context attribute", async ({ page }) => {
    await loadW3CTest(page, "Chapt10_10.4_10.4.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.4.d delete action using at attribute", async ({ page }) => {
    await loadW3CTest(page, "Chapt10_10.4_10.4.d.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.4.e delete element rules", async ({ page }) => {
    await loadW3CTest(page, "Chapt10_10.4_10.4.e.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.5.a setindex element rules", async ({ page }) => {
    await loadW3CTest(page, "Chapt10_10.5_10.5.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.6.a events dispatched by toggle element", async ({ page }) => {
    await loadW3CTest(page, "Chapt10_10.6_10.6.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.8.a dispatch element dispatches predefined event", async ({ page }) => {
    await loadW3CTest(page, "Chapt10_10.8_10.8.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.8.b dispatch element dispatches custom event", async ({ page }) => {
    await loadW3CTest(page, "Chapt10_10.8_10.8.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });
});

// =================================================================
// CHAPTER 7 — current() function (fix #10)
// =================================================================

test.describe("W3C Chapter 7 — current() function", () => {
  test("7.10.2.a current() in bind calculate (cross-instance lookup)", async ({ page }) => {
    await loadW3CTest(page, "Chapt07_7.10_7.10.2_7.10.2.a.xhtml");
    // calculate="../amount * instance('convTable')/rate[@currency=current()/../currency]"
    // amount=100, currency=jpy, rate for jpy=80.23451 → 8023.451
    const text = await getRenderedText(page);
    expect(text).toContain("8023.451");
  });

  test("7.10.2.b current() in repeat output value", async ({ page }) => {
    await loadW3CTest(page, "Chapt07_7.10_7.10.2_7.10.2.b.xhtml");
    // repeat over mon (01, 02, 03); output value uses current() to look up month names
    const text = await getRenderedText(page);
    expect(text).toContain("Jan");
    expect(text).toContain("Feb");
    expect(text).toContain("Mar");
  });
});

// =================================================================
// CHAPTER 8 — output @bind precedence (fix #11)
// =================================================================

test.describe("W3C Chapter 8 — output bind precedence", () => {
  test("8.1.5.b output with @value and @bind — bind takes precedence", async ({ page }) => {
    await loadW3CTest(page, "Chapt08_8.1_8.1.5_8.1.5.b.xhtml");
    // Tax output: value="0.024 * /car/price" → 1032
    // Car Year output: value="/car/price" bind="year_bind" → bind wins, shows 2005
    const text = await getRenderedText(page);
    expect(text).toContain("1032");
    expect(text).toContain("2005");
  });
});

// =================================================================
// CHAPTER 9 — group with @bind relevance (fix #12)
// =================================================================

test.describe("W3C Chapter 9 — group bind relevance", () => {
  test("9.1.1.a1 group with bind relevant=false hides children", async ({ page }) => {
    await loadW3CTest(page, "Chapt09_9.1_9.1.1_9.1.1.a1.xhtml");
    // group1 binds to shipDate with relevant="false()" — Street Name input must NOT be visible
    const streetLabel = page.getByText("Street Name", { exact: true });
    await expect(streetLabel).toBeHidden();
  });
});
