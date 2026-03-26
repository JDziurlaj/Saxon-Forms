import { test, expect } from "@playwright/test";

/**
 * Tests for upstream Saxon-Forms issues #19-27.
 * These reproduce data mutation bugs from XForms 1.1 Appendix B.
 *
 * Each test clicks a trigger that performs an xf:insert or xf:delete,
 * then checks the instance data via JS to verify the mutation succeeded.
 *
 * Tests are initially expected to FAIL (confirming the bugs exist).
 * After fixes, they should be flipped to expect success.
 */

const RENDER_TIMEOUT = 15_000;

/** Helper: get serialized instance XML via JS */
async function getInstanceXML(
  page: any,
  instanceId: string
): Promise<string> {
  return page.evaluate((id: string) => {
    const inst = (window as any).getInstance(id);
    if (!inst) return "";
    const s = new XMLSerializer();
    return s.serializeToString(inst);
  }, instanceId);
}

/** Helper: wait for the issues page XForm to render */
async function waitForIssuesForm(page: any) {
  await page.goto("/issues.html");
  const root = page.locator("#issues-root");
  await expect(root).toBeVisible({ timeout: RENDER_TIMEOUT });
}

// =========================================================
// #23 — B.6: Remove Attribute
// Expected: after clicking trigger, item/@rating should be gone
// Bug: delete silently fails, @rating remains
// =========================================================
test.describe("Issue #23 — Remove Attribute (B.6)", () => {
  test("@rating exists before trigger click", async ({ page }) => {
    await waitForIssuesForm(page);
    const xml = await getInstanceXML(page, "i23");
    expect(xml).toContain('rating="classified"');
  });

  test("clicking delete removes @rating", async ({ page }) => {
    await waitForIssuesForm(page);
    const btn = page.locator("button[data-action*='trigger-23']");
    await expect(btn).toBeVisible({ timeout: RENDER_TIMEOUT });
    await btn.click();

    // Allow a tick for the action to process
    await page.waitForTimeout(500);

    const xml = await getInstanceXML(page, "i23");
    expect(xml).not.toContain("rating");
  });
});

// =========================================================
// #24 — B.7: Remove Nodeset (multiple elements)
// Expected: all <track> elements removed, only <name> remains
// Bug: cardinality error when deleting multiple elements
// =========================================================
test.describe("Issue #24 — Remove Nodeset (B.7)", () => {
  test("3 tracks exist before trigger click", async ({ page }) => {
    await waitForIssuesForm(page);
    const xml = await getInstanceXML(page, "i24");
    expect((xml.match(/<track/g) || []).length).toBe(3);
  });

  test("clicking delete removes all tracks", async ({ page }) => {
    await waitForIssuesForm(page);
    const btn = page.locator("button[data-action*='trigger-24']");
    await expect(btn).toBeVisible({ timeout: RENDER_TIMEOUT });
    await btn.click();
    await page.waitForTimeout(500);

    const xml = await getInstanceXML(page, "i24");
    expect(xml).not.toContain("<track");
  });
});

// =========================================================
// #21 — B.1: Prepend Element Copy
// Expected: a second <person> appears in <people>
// Bug: 'href' must be specified error
// =========================================================
test.describe("Issue #21 — Prepend Element Copy (B.1)", () => {
  test("1 person exists before trigger click", async ({ page }) => {
    await waitForIssuesForm(page);
    const xml = await getInstanceXML(page, "i21");
    expect((xml.match(/<person/g) || []).length).toBe(1);
  });

  test("clicking insert adds a person from prototype", async ({ page }) => {
    await waitForIssuesForm(page);
    const btn = page.locator("button[data-action*='trigger-21']");
    await expect(btn).toBeVisible({ timeout: RENDER_TIMEOUT });
    await btn.click();
    await page.waitForTimeout(500);

    const xml = await getInstanceXML(page, "i21");
    expect((xml.match(/<person/g) || []).length).toBe(2);
  });
});

// =========================================================
// #22 — B.4: Set Attribute (copy attribute to sibling)
// Expected: item[2] gains @rating="classified"
// Bug: cardinality error (XTTE0570)
// =========================================================
test.describe("Issue #22 — Set Attribute (B.4)", () => {
  test("item[2] has no @rating before trigger click", async ({ page }) => {
    await waitForIssuesForm(page);
    const xml = await getInstanceXML(page, "i22");
    // item key="42" should not have rating
    expect(xml).toContain('key="42"');
    // Extract just the item[2] - it should NOT have rating
    const item2Match = xml.match(/<item key="42"[^/]*/);
    expect(item2Match?.[0]).not.toContain("rating");
  });

  test("clicking insert copies @rating to item[2]", async ({ page }) => {
    await waitForIssuesForm(page);
    const btn = page.locator("button[data-action*='trigger-22']");
    await expect(btn).toBeVisible({ timeout: RENDER_TIMEOUT });
    await btn.click();
    await page.waitForTimeout(500);

    const xml = await getInstanceXML(page, "i22");
    // item key="42" should now have rating="classified"
    const item2Match = xml.match(/<item key="42"[^/]*/);
    expect(item2Match?.[0]).toContain('rating="classified"');
  });
});

// =========================================================
// #25 — B.12: Replace Instance with Insert
// Expected: instance root replaced with empty <shoppingcart/>, no <item> children
// Bug: empty sequence error (XTTE0570)
// =========================================================
test.describe("Issue #25 — Replace Instance (B.12)", () => {
  test("2 items exist before trigger click", async ({ page }) => {
    await waitForIssuesForm(page);
    const xml = await getInstanceXML(page, "i25");
    expect((xml.match(/<item/g) || []).length).toBe(2);
  });

  test("clicking insert replaces with empty cart", async ({ page }) => {
    await waitForIssuesForm(page);
    const btn = page.locator("button[data-action*='trigger-25']");
    await expect(btn).toBeVisible({ timeout: RENDER_TIMEOUT });
    await btn.click();
    await page.waitForTimeout(500);

    const xml = await getInstanceXML(page, "i25");
    expect(xml).not.toContain("<item");
  });
});
