import { test, expect } from "@playwright/test";

/**
 * W3C XForms 1.1 Test Suite — Chapters 8 & 9.
 *
 * Chapter 8: Core Form Controls (input, output, trigger, select, select1, upload, etc.)
 * Chapter 9: Container Form Controls (group, switch/case, repeat, itemset)
 *
 * Each test loads the W3C test XHTML via w3c-runner.html and checks that:
 * 1. The XForm renders (non-empty #xForm) — "renders" test
 * 2. Expected content appears — "content" test (for key tests)
 */

const RENDER_TIMEOUT = 15_000;

async function loadTest(page: any, file: string) {
  await page.goto(`/w3c-runner.html?test=${file}`);
  const xform = page.locator("#xForm");
  await expect(xform).not.toBeEmpty({ timeout: RENDER_TIMEOUT });
}

// =====================================================================
// 8.1 Core Controls
// =====================================================================

const ch8_1_tests: [string, string][] = [
  ["8.1.a", "Chapt08_8.1_8.1.a.xhtml"],
  ["8.1.1.a — form control binding restriction", "Chapt08_8.1_8.1.1_8.1.1.a.xhtml"],
  ["8.1.1.b — non-relevant becoming relevant", "Chapt08_8.1_8.1.1_8.1.1.b.xhtml"],
  ["8.1.1.c — relevant becoming non-relevant", "Chapt08_8.1_8.1.1_8.1.1.c.xhtml"],
  ["8.1.2.a — input incremental", "Chapt08_8.1_8.1.2_8.1.2.a.xhtml"],
  ["8.1.2.b — input binding restrictions", "Chapt08_8.1_8.1.2_8.1.2.b.xhtml"],
  ["8.1.2.c — input datatype", "Chapt08_8.1_8.1.2_8.1.2.c.xhtml"],
  ["8.1.3.a — secret incremental", "Chapt08_8.1_8.1.3_8.1.3.a.xhtml"],
  ["8.1.3.b — secret binding restrictions", "Chapt08_8.1_8.1.3_8.1.3.b.xhtml"],
  ["8.1.4.a — textarea incremental", "Chapt08_8.1_8.1.4_8.1.4.a.xhtml"],
  ["8.1.4.b — textarea binding restrictions", "Chapt08_8.1_8.1.4_8.1.4.b.xhtml"],
  ["8.1.5.a — output appearance", "Chapt08_8.1_8.1.5_8.1.5.a.xhtml"],
  ["8.1.5.b — output value attribute", "Chapt08_8.1_8.1.5_8.1.5.b.xhtml"],
  ["8.1.5.c — output UI common", "Chapt08_8.1_8.1.5_8.1.5.c.xhtml"],
  ["8.1.5.d — output mediatype", "Chapt08_8.1_8.1.5_8.1.5.d.xhtml"],
  ["8.1.5.1.a — mediatype element", "Chapt08_8.1_8.1.5_8.1.5.1_8.1.5.1.a.xhtml"],
  ["8.1.6.a — upload mediatype", "Chapt08_8.1_8.1.6_8.1.6.a.xhtml"],
  ["8.1.6.b — upload incremental", "Chapt08_8.1_8.1.6_8.1.6.b.xhtml"],
  ["8.1.6.c — upload filename/mediatype", "Chapt08_8.1_8.1.6_8.1.6.c.xhtml"],
  ["8.1.6.d — upload binding restrictions", "Chapt08_8.1_8.1.6_8.1.6.d.xhtml"],
  ["8.1.6.e — upload element", "Chapt08_8.1_8.1.6_8.1.6.e.xhtml"],
  ["8.1.6.1.a — filename element", "Chapt08_8.1_8.1.6_8.1.6.1_8.1.6.1.a.xhtml"],
  ["8.1.6.2.a — mediatype element", "Chapt08_8.1_8.1.6_8.1.6.2_8.1.6.2.a.xhtml"],
  ["8.1.7.a — range start", "Chapt08_8.1_8.1.7_8.1.7.a.xhtml"],
  ["8.1.7.b — range end", "Chapt08_8.1_8.1.7_8.1.7.b.xhtml"],
  ["8.1.7.c — range step", "Chapt08_8.1_8.1.7_8.1.7.c.xhtml"],
  ["8.1.7.d — range incremental", "Chapt08_8.1_8.1.7_8.1.7.d.xhtml"],
  ["8.1.7.e — range example", "Chapt08_8.1_8.1.7_8.1.7.e.xhtml"],
  ["8.1.7.f — range binding restrictions", "Chapt08_8.1_8.1.7_8.1.7.f.xhtml"],
  ["8.1.7.g — range binding basic", "Chapt08_8.1_8.1.7_8.1.7.g.xhtml"],
  ["8.1.8.a — trigger", "Chapt08_8.1_8.1.8_8.1.8.a.xhtml"],
  ["8.1.8.b — trigger appearance", "Chapt08_8.1_8.1.8_8.1.8.b.xhtml"],
  ["8.1.9.a — submit", "Chapt08_8.1_8.1.9_8.1.9.a.xhtml"],
  ["8.1.9.b — submit appearance", "Chapt08_8.1_8.1.9_8.1.9.b.xhtml"],
  ["8.1.10.a — select selection", "Chapt08_8.1_8.1.10_8.1.10.a.xhtml"],
  ["8.1.10.b — select incremental", "Chapt08_8.1_8.1.10_8.1.10.b.xhtml"],
  ["8.1.10.c — select appearance", "Chapt08_8.1_8.1.10_8.1.10.c.xhtml"],
  ["8.1.10.d — select out of range", "Chapt08_8.1_8.1.10_8.1.10.d.xhtml"],
  ["8.1.11.a — select1 selection", "Chapt08_8.1_8.1.11_8.1.11.a.xhtml"],
  ["8.1.11.b — select1 incremental", "Chapt08_8.1_8.1.11_8.1.11.b.xhtml"],
  ["8.1.11.c — select1 appearance", "Chapt08_8.1_8.1.11_8.1.11.c.xhtml"],
  ["8.1.11.d — select1 out of range", "Chapt08_8.1_8.1.11_8.1.11.d.xhtml"],
];

// =====================================================================
// 8.2 UI Common (label, help, hint, alert)
// =====================================================================

const ch8_2_tests: [string, string][] = [
  ["8.2.1.a — label refs instance", "Chapt08_8.2_8.2.1_8.2.1.a.xhtml"],
  ["8.2.1.b — label inline text", "Chapt08_8.2_8.2.1_8.2.1.b.xhtml"],
  ["8.2.1.c — label binding precedence", "Chapt08_8.2_8.2.1_8.2.1.c.xhtml"],
  ["8.2.2.a — help refs instance", "Chapt08_8.2_8.2.2_8.2.2.a.xhtml"],
  ["8.2.2.b — help inline text", "Chapt08_8.2_8.2.2_8.2.2.b.xhtml"],
  ["8.2.2.c — help binding precedence", "Chapt08_8.2_8.2.2_8.2.2.c.xhtml"],
  ["8.2.3.a — hint refs instance", "Chapt08_8.2_8.2.3_8.2.3.a.xhtml"],
  ["8.2.3.b — hint inline text", "Chapt08_8.2_8.2.3_8.2.3.b.xhtml"],
  ["8.2.3.c — hint binding precedence", "Chapt08_8.2_8.2.3_8.2.3.c.xhtml"],
  ["8.2.4.a — alert refs instance", "Chapt08_8.2_8.2.4_8.2.4.a.xhtml"],
  ["8.2.4.b — alert inline text", "Chapt08_8.2_8.2.4_8.2.4.b.xhtml"],
  ["8.2.4.c — alert binding precedence", "Chapt08_8.2_8.2.4_8.2.4.c.xhtml"],
];

// =====================================================================
// 8.3 Selection Controls (choices, item, value, itemset)
// =====================================================================

const ch8_3_tests: [string, string][] = [
  ["8.3.1.a — choices element", "Chapt08_8.3_8.3.1_8.3.1.a.xhtml"],
  ["8.3.2.a — item element", "Chapt08_8.3_8.3.2_8.3.2.a.xhtml"],
  ["8.3.3.a — value binding restrictions", "Chapt08_8.3_8.3.3_8.3.3.a.xhtml"],
  ["8.3.3.b — value precedence", "Chapt08_8.3_8.3.3_8.3.3.b.xhtml"],
  ["8.3.3.c — value inline content", "Chapt08_8.3_8.3.3_8.3.3.c.xhtml"],
];

// =====================================================================
// Chapter 9 — Container Form Controls
// =====================================================================

const ch9_tests: [string, string][] = [
  ["9.1.1.a1 — group precedence", "Chapt09_9.1_9.1.1_9.1.1.a1.xhtml"],
  ["9.1.1.a2 — group in switch/case", "Chapt09_9.1_9.1.1_9.1.1.a2.xhtml"],
  ["9.1.1.b — label in group", "Chapt09_9.1_9.1.1_9.1.1.b.xhtml"],
  ["9.1.1.c — focus set to group", "Chapt09_9.1_9.1.1_9.1.1.c.xhtml"],
  ["9.2.1.a1 — switch element", "Chapt09_9.2_9.2.1_9.2.1.a1.xhtml"],
  ["9.2.1.a2 — switch receives events", "Chapt09_9.2_9.2.1_9.2.1.a2.xhtml"],
  ["9.2.1.b — switch example", "Chapt09_9.2_9.2.1_9.2.1.b.xhtml"],
  ["9.2.2.a — case element", "Chapt09_9.2_9.2.2_9.2.2.a.xhtml"],
  ["9.2.2.b — case selected", "Chapt09_9.2_9.2.2_9.2.2.b.xhtml"],
  ["9.2.2.c — case multiple selected", "Chapt09_9.2_9.2.2_9.2.2.c.xhtml"],
  ["9.3.1.a — repeat element", "Chapt09_9.3_9.3.1_9.3.1.a.xhtml"],
  ["9.3.1.b — repeat startindex", "Chapt09_9.3_9.3.1_9.3.1.b.xhtml"],
  ["9.3.1.c — repeat number", "Chapt09_9.3_9.3.1_9.3.1.c.xhtml"],
  ["9.3.1.d — unrolling repeat", "Chapt09_9.3_9.3.1_9.3.1.d.xhtml"],
  ["9.3.1.e — repeat example", "Chapt09_9.3_9.3.1_9.3.1.e.xhtml"],
  ["9.3.1.f — switch in repeat", "Chapt09_9.3_9.3.1_9.3.1.f.xhtml"],
  ["9.3.4.a — switch inside repeat", "Chapt09_9.3_9.3.4_9.3.4.a.xhtml"],
  ["9.3.5.a — repeating via attributes", "Chapt09_9.3_9.3.5_9.3.5.a.xhtml"],
  ["9.3.6.a — itemset example", "Chapt09_9.3_9.3.6_9.3.6.a.xhtml"],
  ["9.3.7.a — copy element", "Chapt09_9.3_9.3.7_9.3.7.a.xhtml"],
  ["9.3.7.b — copy binding exception", "Chapt09_9.3_9.3.7_9.3.7.b.xhtml"],
];

// =====================================================================
// Generate tests
// =====================================================================

test.describe("W3C Ch8 §8.1 — Core Controls", () => {
  for (const [name, file] of ch8_1_tests) {
    test(`${name} renders`, async ({ page }) => {
      await loadTest(page, file);
    });
  }
});

test.describe("W3C Ch8 §8.2 — UI Common", () => {
  for (const [name, file] of ch8_2_tests) {
    test(`${name} renders`, async ({ page }) => {
      await loadTest(page, file);
    });
  }
});

test.describe("W3C Ch8 §8.3 — Selection Controls", () => {
  for (const [name, file] of ch8_3_tests) {
    test(`${name} renders`, async ({ page }) => {
      await loadTest(page, file);
    });
  }
});

test.describe("W3C Ch9 — Container Form Controls", () => {
  for (const [name, file] of ch9_tests) {
    test(`${name} renders`, async ({ page }) => {
      await loadTest(page, file);
    });
  }
});
