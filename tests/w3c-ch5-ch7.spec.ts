import { test, expect } from "@playwright/test";

const RENDER_TIMEOUT = 15_000;
async function loadTest(page: any, file: string) {
  await page.goto(`/w3c-runner.html?test=${file}`);
  await expect(page.locator("#xForm")).not.toBeEmpty({ timeout: RENDER_TIMEOUT });
}

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

const ch6: [string, string][] = [
  ["6.1.1.a — type", "Chapt06_6.1_6.1.1_6.1.1.a.xhtml"],
  ["6.1.2.a — readonly", "Chapt06_6.1_6.1.2_6.1.2.a.xhtml"],
  ["6.1.2.b — readonly inheritance", "Chapt06_6.1_6.1.2_6.1.2.b.xhtml"],
  ["6.1.3.a — required", "Chapt06_6.1_6.1.3_6.1.3.a.xhtml"],
  ["6.1.4.a — relevant", "Chapt06_6.1_6.1.4_6.1.4.a.xhtml"],
  ["6.1.4.b — relevant inheritance", "Chapt06_6.1_6.1.4_6.1.4.b.xhtml"],
  ["6.1.4.c — relevant propagation", "Chapt06_6.1_6.1.4_6.1.4.c.xhtml"],
  ["6.1.5.a — calculate", "Chapt06_6.1_6.1.5_6.1.5.a.xhtml"],
  ["6.1.6.a — constraint", "Chapt06_6.1_6.1.6_6.1.6.a.xhtml"],
  ["6.1.7.a — p3ptype", "Chapt06_6.1_6.1.7_6.1.7.a.xhtml"],
  ["6.2.1.a — MIP inheritance", "Chapt06_6.2_6.2.1_6.2.1.a.xhtml"],
];

const ch7: [string, string][] = [
  ["7.2.a — eval context outermost", "Chapt07_7.2_7.2.a.xhtml"],
  ["7.2.b — eval context non-outermost", "Chapt07_7.2_7.2.b.xhtml"],
  ["7.2.c — context within model", "Chapt07_7.2_7.2.c.xhtml"],
  ["7.2.d — context for computed expr", "Chapt07_7.2_7.2.d.xhtml"],
  ["7.2.e — context size and position", "Chapt07_7.2_7.2.e.xhtml"],
  ["7.2.f — namespace declarations", "Chapt07_7.2_7.2.f.xhtml"],
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
  ["7.7.5.a — index()", "Chapt07_7.7_7.7.5_7.7.5.a.xhtml"],
  ["7.7.5.b — index() negative", "Chapt07_7.7_7.7.5_7.7.5.b.xhtml"],
  ["7.7.6.a — power()", "Chapt07_7.7_7.7.6_7.7.6.a.xhtml"],
  ["7.7.7.a — random()", "Chapt07_7.7_7.7.7_7.7.7.a.xhtml"],
  ["7.7.8.a — compare()", "Chapt07_7.7_7.7.8_7.7.8.a.xhtml"],
  ["7.8.1.a — if()", "Chapt07_7.8_7.8.1_7.8.1.a.xhtml"],
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
  ["7.10.4.a — context()", "Chapt07_7.10_7.10.4_7.10.4.a.xhtml"],
  ["7.11.1.a — choose()", "Chapt07_7.11_7.11.1_7.11.1.a.xhtml"],
  ["7.11.2.a — event() inserted-nodes", "Chapt07_7.11_7.11.2_7.11.2.a.xhtml"],
  ["7.12.a — invalid functions attr", "Chapt07_7.12_7.12.a.xhtml"],
];

test.describe("W3C Ch5 — Datatypes", () => {
  for (const [name, file] of ch5) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }
});

test.describe("W3C Ch6 — Model Item Properties", () => {
  for (const [name, file] of ch6) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }
});

test.describe("W3C Ch7 — XPath Expressions", () => {
  for (const [name, file] of ch7) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }
});
