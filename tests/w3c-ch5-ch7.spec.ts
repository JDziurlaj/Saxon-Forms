import { test, expect } from "@playwright/test";

/**
 * W3C XForms 1.1 Test Suite — Chapters 5, 6, 7.
 *
 * Tests are split into two categories:
 *
 *   SMOKE TESTS — verify only that the XForm renders without crashing
 *     (i.e. #xForm is non-empty).  These cover tests whose W3C-expected
 *     behaviour depends on unimplemented features (schema type validation,
 *     multi-model support, unimplemented XPath functions, etc.).
 *
 *   BEHAVIORAL TESTS — verify rendered content, computed values, or
 *     visibility against the W3C-specified expected outcome.
 */

const RENDER_TIMEOUT = 15_000;

async function loadTest(page: any, file: string) {
  await page.goto(`/w3c-runner.html?test=${file}`);
  await expect(page.locator("#xForm")).not.toBeEmpty({ timeout: RENDER_TIMEOUT });
}

async function loadAndWait(page: any, file: string) {
  await page.goto(`/w3c-runner.html?test=${file}`);
  await expect(page.locator("#xForm")).not.toBeEmpty({ timeout: RENDER_TIMEOUT });
  await page.waitForTimeout(1000);
}

function getRenderedText(page: any): Promise<string> {
  return page.locator("#xForm").innerText();
}

// =====================================================================
// Chapter 5 — Datatypes (smoke only: requires schema type validation
// and multi-model event dispatching, both unimplemented)
// =====================================================================

const ch5: [string, string][] = [
  ["5.1.a", "Chapt05_5.1_5.1.a.xhtml"],
  ["5.1.b", "Chapt05_5.1_5.1.b.xhtml"],
  ["5.1.c", "Chapt05_5.1_5.1.c.xhtml"],
  ["5.1.d", "Chapt05_5.1_5.1.d.xhtml"],
  ["5.1.e", "Chapt05_5.1_5.1.e.xhtml"],
  ["5.2.1.a", "Chapt05_5.2_5.2.1_5.2.1.a.xhtml"],
  ["5.2.1.b", "Chapt05_5.2_5.2.1_5.2.1.b.xhtml"],
  ["5.2.1.c", "Chapt05_5.2_5.2.1_5.2.1.c.xhtml"],
  ["5.2.2.a", "Chapt05_5.2_5.2.2_5.2.2.a.xhtml"],
  ["5.2.3.a", "Chapt05_5.2_5.2.3_5.2.3.a.xhtml"],
  ["5.2.4.a", "Chapt05_5.2_5.2.4_5.2.4.a.xhtml"],
  ["5.2.5.a", "Chapt05_5.2_5.2.5_5.2.5.a.xhtml"],
  ["5.2.6.a", "Chapt05_5.2_5.2.6_5.2.6.a.xhtml"],
  ["5.2.7.a", "Chapt05_5.2_5.2.7_5.2.7.a.xhtml"],
  ["5.2.7.b", "Chapt05_5.2_5.2.7_5.2.7.b.xhtml"],
];

test.describe("W3C Ch5 — Datatypes [smoke]", () => {
  for (const [name, file] of ch5) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }
});

// =====================================================================
// Chapter 6 — Model Item Properties
// =====================================================================

// Smoke-only: depend on schema type validation or multi-model support
const ch6_smoke: [string, string][] = [
  ["6.1.1.a — type", "Chapt06_6.1_6.1.1_6.1.1.a.xhtml"],
  ["6.1.7.a — p3ptype", "Chapt06_6.1_6.1.7_6.1.7.a.xhtml"],
  ["6.2.1.a — MIP inheritance", "Chapt06_6.2_6.2.1_6.2.1.a.xhtml"],
];

test.describe("W3C Ch6 — Model Item Properties [smoke]", () => {
  for (const [name, file] of ch6_smoke) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }
});

test.describe("W3C Ch6 — Model Item Properties [behavioral]", () => {
  test("6.1.2.a — readonly shows Roland and Orlando", async ({ page }) => {
    await loadAndWait(page, "Chapt06_6.1_6.1.2_6.1.2.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("Roland");
    expect(text).toContain("Orlando");
  });

  test("6.1.2.b — readonly inheritance shows Roland and Orlando", async ({ page }) => {
    await loadAndWait(page, "Chapt06_6.1_6.1.2_6.1.2.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("Roland");
    expect(text).toContain("Orlando");
  });

  test("6.1.3.a — required renders input control", async ({ page }) => {
    await loadAndWait(page, "Chapt06_6.1_6.1.3_6.1.3.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("First Name");
  });

  test("6.1.4.a — relevant=false() hides Title and First Name", async ({ page }) => {
    await loadAndWait(page, "Chapt06_6.1_6.1.4_6.1.4.a.xhtml");
    // first-name bind has relevant="false()" — its children must be hidden
    const title = page.getByText("Title:", { exact: true });
    await expect(title).toBeHidden();
    const firstName = page.getByText("First Name:", { exact: true });
    await expect(firstName).toBeHidden();
    // Last Name must remain visible
    const text = await getRenderedText(page);
    expect(text).toContain("Last Name");
  });

  test("6.1.4.b — relevant renders controls and triggers", async ({ page }) => {
    await loadAndWait(page, "Chapt06_6.1_6.1.4_6.1.4.b.xhtml");
    // Verify the form rendered with expected controls
    const text = await getRenderedText(page);
    expect(text).toContain("Order Amount");
    expect(text).toContain("Enter 250");
    expect(text).toContain("Enter 1500");
  });

  test("6.1.4.c — relevant propagation hides Color B, Person C, Color C", async ({ page }) => {
    await loadAndWait(page, "Chapt06_6.1_6.1.4_6.1.4.c.xhtml");
    const colorB = page.getByText("Favorite Color B:", { exact: true });
    await expect(colorB).toBeHidden();
    const personC = page.getByText("Person C:", { exact: true });
    await expect(personC).toBeHidden();
    const text = await getRenderedText(page);
    expect(text).toContain("Person A");
  });

  test("6.1.5.a — calculate renders trigger labels", async ({ page }) => {
    await loadAndWait(page, "Chapt06_6.1_6.1.5_6.1.5.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("Enter 1500");
    expect(text).toContain("Enter 2000");
  });

  test("6.1.6.a — constraint renders From/To and triggers", async ({ page }) => {
    await loadAndWait(page, "Chapt06_6.1_6.1.6_6.1.6.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("From");
    expect(text).toContain("Valid Value");
  });
});

// =====================================================================
// Chapter 7 — XPath Expressions
// =====================================================================

// Smoke-only: depend on unimplemented functions or multi-model support
const ch7_smoke: [string, string][] = [
  ["7.4.6.a — binding examples", "Chapt07_7.4_7.4.6_7.4.6.a.xhtml"],
  ["7.5.a — compute exception", "Chapt07_7.5_7.5.a.xhtml"],
  ["7.5.b — binding exception", "Chapt07_7.5_7.5.b.xhtml"],
  ["7.6.1.a — boolean-from-string", "Chapt07_7.6_7.6.1_7.6.1.a.xhtml"],
  ["7.6.2.a — is-card-number", "Chapt07_7.6_7.6.2_7.6.2.a.xhtml"],
  ["7.7.1.a — avg()", "Chapt07_7.7_7.7.1_7.7.1.a.xhtml"],
  ["7.7.1.b — avg() negative", "Chapt07_7.7_7.7.1_7.7.1.b.xhtml"],
  ["7.7.2.a — min()", "Chapt07_7.7_7.7.2_7.7.2.a.xhtml"],
  ["7.7.2.b — min() negative", "Chapt07_7.7_7.7.2_7.7.2.b.xhtml"],
  ["7.7.3.a — max()", "Chapt07_7.7_7.7.3_7.7.3.a.xhtml"],
  ["7.7.3.b — max() negative", "Chapt07_7.7_7.7.3_7.7.3.b.xhtml"],
  ["7.7.4.a — count-non-empty()", "Chapt07_7.7_7.7.4_7.7.4.a.xhtml"],
  ["7.7.5.b — index() negative", "Chapt07_7.7_7.7.5_7.7.5.b.xhtml"],
  ["7.7.6.a — power()", "Chapt07_7.7_7.7.6_7.7.6.a.xhtml"],
  ["7.7.7.a — random()", "Chapt07_7.7_7.7.7_7.7.7.a.xhtml"],
  ["7.8.2.a — property() version", "Chapt07_7.8_7.8.2_7.8.2.a.xhtml"],
  ["7.8.2.b — property() conformance", "Chapt07_7.8_7.8.2_7.8.2.b.xhtml"],
  ["7.8.2.c — property() invalid NCNAME", "Chapt07_7.8_7.8.2_7.8.2.c.xhtml"],
  ["7.8.2.d — property() invalid QName", "Chapt07_7.8_7.8.2_7.8.2.d.xhtml"],
  ["7.8.3.a — digest() sha1/md5/sha256", "Chapt07_7.8_7.8.3_7.8.3.a.xhtml"],
  ["7.8.3.b — digest() sha384/sha512", "Chapt07_7.8_7.8.3_7.8.3.b.xhtml"],
  ["7.8.3.c — digest() invalid NCNAME", "Chapt07_7.8_7.8.3_7.8.3.c.xhtml"],
  ["7.8.3.d — digest() invalid QName", "Chapt07_7.8_7.8.3_7.8.3.d.xhtml"],
  ["7.8.3.e — digest() invalid encoding", "Chapt07_7.8_7.8.3_7.8.3.e.xhtml"],
  ["7.8.3.f — digest() default base64", "Chapt07_7.8_7.8.3_7.8.3.f.xhtml"],
  ["7.8.4.a — hmac() sha1/md5/sha256", "Chapt07_7.8_7.8.4_7.8.4.a.xhtml"],
  ["7.8.4.b — hmac() sha384/sha512", "Chapt07_7.8_7.8.4_7.8.4.b.xhtml"],
  ["7.8.4.c — hmac() invalid NCNAME", "Chapt07_7.8_7.8.4_7.8.4.c.xhtml"],
  ["7.8.4.d — hmac() invalid QName", "Chapt07_7.8_7.8.4_7.8.4.d.xhtml"],
  ["7.8.4.e — hmac() invalid encoding", "Chapt07_7.8_7.8.4_7.8.4.e.xhtml"],
  ["7.8.4.f — hmac() default base64", "Chapt07_7.8_7.8.4_7.8.4.f.xhtml"],
  ["7.9.1.a — local-date()", "Chapt07_7.9_7.9.1_7.9.1.a.xhtml"],
  ["7.9.2.a — local-dateTime()", "Chapt07_7.9_7.9.2_7.9.2.a.xhtml"],
  ["7.9.3.a — now()", "Chapt07_7.9_7.9.3_7.9.3.a.xhtml"],
  ["7.9.4.a — days-from-date()", "Chapt07_7.9_7.9.4_7.9.4.a.xhtml"],
  ["7.9.4.b — days-from-date() ignores time", "Chapt07_7.9_7.9.4_7.9.4.b.xhtml"],
  ["7.9.4.c — days-from-date() negative", "Chapt07_7.9_7.9.4_7.9.4.c.xhtml"],
  ["7.9.5.a — days-to-date()", "Chapt07_7.9_7.9.5_7.9.5.a.xhtml"],
  ["7.9.6.a — seconds-from-dateTime()", "Chapt07_7.9_7.9.6_7.9.6.a.xhtml"],
  ["7.9.7.a — seconds-to-dateTime()", "Chapt07_7.9_7.9.7_7.9.7.a.xhtml"],
  ["7.9.8.a — adjust-dateTime-to-timezone()", "Chapt07_7.9_7.9.8_7.9.8.a.xhtml"],
  ["7.9.9.a — seconds()", "Chapt07_7.9_7.9.9_7.9.9.a.xhtml"],
  ["7.9.10.a — months()", "Chapt07_7.9_7.9.10_7.9.10.a.xhtml"],
  ["7.10.1.a — instance()", "Chapt07_7.10_7.10.1_7.10.1.a.xhtml"],
  ["7.10.2.a — current() ex1", "Chapt07_7.10_7.10.2_7.10.2.a.xhtml"],
  ["7.10.2.b — current() ex2", "Chapt07_7.10_7.10.2_7.10.2.b.xhtml"],
  ["7.10.3.a — id()", "Chapt07_7.10_7.10.3_7.10.3.a.xhtml"],
  ["7.10.3.b — id() with xml:id", "Chapt07_7.10_7.10.3_7.10.3.b.xhtml"],
  ["7.10.3.c — id() with xsi:type", "Chapt07_7.10_7.10.3_7.10.3.c.xhtml"],
  ["7.11.1.a — choose()", "Chapt07_7.11_7.11.1_7.11.1.a.xhtml"],
  ["7.11.2.a — event() inserted-nodes", "Chapt07_7.11_7.11.2_7.11.2.a.xhtml"],
  ["7.12.a — invalid functions attr", "Chapt07_7.12_7.12.a.xhtml"],
];

test.describe("W3C Ch7 — XPath Expressions [smoke]", () => {
  for (const [name, file] of ch7_smoke) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }
});

test.describe("W3C Ch7 — XPath Expressions [behavioral]", () => {
  test("7.2.a — outermost binding: Seth, Peters, speters@example.com", async ({ page }) => {
    await loadAndWait(page, "Chapt07_7.2_7.2.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("Seth");
    expect(text).toContain("Peters");
    expect(text).toContain("speters@example.com");
  });

  test("7.2.b — non-outermost binding: Curtiss, Hewie, chewie@example.com", async ({ page }) => {
    await loadAndWait(page, "Chapt07_7.2_7.2.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("Curtiss");
    expect(text).toContain("Hewie");
    expect(text).toContain("chewie@example.com");
  });

  test("7.2.d — computed expression: subtotals 6, 20, 42", async ({ page }) => {
    await loadAndWait(page, "Chapt07_7.2_7.2.d.xhtml");
    const outputs = page.locator(".xforms-output");
    const texts = await outputs.allInnerTexts();
    expect(texts).toContain("6");
    expect(texts).toContain("20");
    expect(texts).toContain("42");
  });

  test("7.2.e — context size and position: totals 4, 5, 6", async ({ page }) => {
    await loadAndWait(page, "Chapt07_7.2_7.2.e.xhtml");
    const outputs = page.locator(".xforms-output");
    const texts = await outputs.allInnerTexts();
    expect(texts).toContain("4");
    expect(texts).toContain("5");
    expect(texts).toContain("6");
  });

  test("7.2.f — namespace declarations: Mazda in readonly input", async ({ page }) => {
    await loadAndWait(page, "Chapt07_7.2_7.2.f.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("Mazda");
  });

  test("7.7.5.a — index() function renders repeat", async ({ page }) => {
    await loadAndWait(page, "Chapt07_7.7_7.7.5_7.7.5.a.xhtml");
    const text = await getRenderedText(page);
    // Test shows index-based repeat; verify the form rendered with expected labels
    expect(text).toContain("index");
  });

  test("7.7.8.a — compare() returns expected values", async ({ page }) => {
    await loadAndWait(page, "Chapt07_7.7_7.7.8_7.7.8.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("-1");
    expect(text).toContain("0");
  });

  test("7.8.1.a — if() shows Yes and Unsafe", async ({ page }) => {
    await loadAndWait(page, "Chapt07_7.8_7.8.1_7.8.1.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("Yes");
    expect(text).toContain("Unsafe");
  });

  test("7.10.4.a — context() shows Unknown initially with fruit triggers", async ({ page }) => {
    await loadAndWait(page, "Chapt07_7.10_7.10.4_7.10.4.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("Unknown");
    expect(text).toContain("apple");
    expect(text).toContain("orange");
  });
});
