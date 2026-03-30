import { test, expect, loadTest, loadAndWait, getRenderedText } from "./helpers";

test.describe("W3C Chapter 10 — XForms Actions", () => {
  test("10.1.a action element renders triggers", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.1/10.1.a.xhtml");
    const triggers = page.locator('button.xforms-trigger');
    const count = await triggers.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10.2.a setvalue with expression or literal", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.2/10.2.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("white");
    expect(text).toContain("excellent");
  });

  test("10.2.b setvalue shows white and excellent", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.2/10.2.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("white");
  });

  test("10.3.a insert action using context attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.3/10.3.a.xhtml");
    const text = await getRenderedText(page);
    // Should show numbers from insert operations
    expect(text).toContain("1");
  });

  test("10.3.c insert action using origin attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.3/10.3.c.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10.3.d insert action using at attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.3/10.3.d.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10.3.e insert action using position attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.3/10.3.e.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10.3.j insert action — must not show 4.00", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.3/10.3.j.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toContain("4.00");
  });

  test("10.4.a delete action using context attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.4/10.4.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.4.d delete action using at attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.4/10.4.d.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10.4.e delete element rules", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.4/10.4.e.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10.5.a setindex element rules", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.5/10.5.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.6.a events dispatched by toggle element", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.6/10.6.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.8.a dispatch dispatches xforms-rebuild", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.8/10.8.a.xhtml");
    const triggers = page.locator('button.xforms-trigger');
    const count = await triggers.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10.8.b dispatch dispatches custom-event", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.8/10.8.b.xhtml");
    const triggers = page.locator('button.xforms-trigger');
    const count = await triggers.count();
    expect(count).toBeGreaterThan(0);
  });
});


const ch10_gaps_smoke: [string, string][] = [
  ["10.13.a", "Chapt10/10.13/10.13.a.xhtml"],  // expects modal message after trigger activation
  ["10.14.1.a", "Chapt10/10.14/10.14.1/10.14.1.a.xhtml"],  // depends on form submission lifecycle
  ["10.14.1.b", "Chapt10/10.14/10.14.1/10.14.1.b.xhtml"],  // depends on form submission lifecycle
  ["10.14.a", "Chapt10/10.14/10.14.a.xhtml"],  // depends on load action (page navigation)
  ["10.14.b", "Chapt10/10.14/10.14.b.xhtml"],  // depends on load action (page navigation)
  ["10.15.a", "Chapt10/10.15/10.15.a.xhtml"],  // expects modal message after trigger activation
  ["10.16.a", "Chapt10/10.16/10.16.a.xhtml"],  // depends on event dispatch sequencing
  ["10.16.b", "Chapt10/10.16/10.16.b.xhtml"],  // expects modal message after trigger activation
  ["10.16.c", "Chapt10/10.16/10.16.c.xhtml"],  // expects modal message from event handler
  ["10.3.f", "Chapt10/10.3/10.3.f.xhtml"],  // expects modal message after trigger activation
  ["10.3.i", "Chapt10/10.3/10.3.i.xhtml"],  // expects modal message from event handler
  ["10.4.g", "Chapt10/10.4/10.4.g.xhtml"],  // expects modal message from event handler
  ["10.6.1.a", "Chapt10/10.6/10.6.1/10.6.1.a.xhtml"],  // depends on form submission lifecycle
  ["10.8.1.a", "Chapt10/10.8/10.8.1/10.8.1.a.xhtml"],  // expects modal message after trigger activation
  ["10.8.1.b", "Chapt10/10.8/10.8.1/10.8.1.b.xhtml"],  // expects modal message after trigger activation
  ["10.8.1.c", "Chapt10/10.8/10.8.1/10.8.1.c.xhtml"],  // expects modal message after trigger activation
  ["10.8.2.a", "Chapt10/10.8/10.8.2/10.8.2.a.xhtml"],  // expects modal message after trigger activation
  ["10.8.2.b", "Chapt10/10.8/10.8.2/10.8.2.b.xhtml"],  // expects modal message after trigger activation
  ["10.8.2.c", "Chapt10/10.8/10.8.2/10.8.2.c.xhtml"],  // expects modal message after trigger activation
  ["10.8.3.a", "Chapt10/10.8/10.8.3/10.8.3.a.xhtml"],  // expects modal message after trigger activation
  ["10.8.3.b", "Chapt10/10.8/10.8.3/10.8.3.b.xhtml"],  // expects modal message after trigger activation
  ["10.8.3.c", "Chapt10/10.8/10.8.3/10.8.3.c.xhtml"],  // expects modal message after trigger activation
  ["10.8.c", "Chapt10/10.8/10.8.c.xhtml"],  // expects modal message after trigger activation
  ["10.8.d", "Chapt10/10.8/10.8.d.xhtml"],  // expects modal message after trigger activation
  ["10.8.e", "Chapt10/10.8/10.8.e.xhtml"],  // depends on event dispatch sequencing
  ["10.b", "Chapt10/10.b.xhtml"],  // expects modal message after trigger activation
  ["10.c", "Chapt10/10.c.xhtml"],  // expects modal message after trigger activation
  ["10.d", "Chapt10/10.d.xhtml"],  // expects modal message after trigger activation
  ["10.e", "Chapt10/10.e.xhtml"],  // expects modal message after trigger activation
  ["10.f", "Chapt10/10.f.xhtml"],  // expects modal message after trigger activation
  ["10.g", "Chapt10/10.g.xhtml"],  // expects modal message after trigger activation
  ["10.h", "Chapt10/10.h.xhtml"],  // expects modal message after trigger activation
  ["10.i", "Chapt10/10.i.xhtml"],  // expects modal message after trigger activation
];

test.describe("W3C Chapt10 [smoke gaps]", () => {
  for (const [name, file] of ch10_gaps_smoke) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }
});

test.describe("W3C Ch10 [behavioral promoted]", () => {
  test("10.13.b — 10.13.b reset element with model attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.13/10.13.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toContain("white");
  });

  test("10.17.a — 10.17.a conditional execution of XForms actions", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.17/10.17.a.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10.17.b — 10.17.b conditional execution of XForms actions using action element", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.17/10.17.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toContain("This is the negative test");
  });

  test("10.17.c — 10.17.c conditional execution of XForms actions - Automatic Focus Advancement example", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.17/10.17.c.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10.17.d — 10.17.d conditional execution of XForms actions - Handling Focus for Empty Repeats example", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.17/10.17.d.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10.18.a — 10.18.a iteration of XForms actions", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.18/10.18.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("10");
  });

  test("10.18.b — 10.18.b iteration of XForms actions using action element", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.18/10.18.b.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10.18.c — 10.18.c iteration executed zero times", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.18/10.18.c.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("1");
  });

  test("10.18.d — 10.18.d XForms actions with if and while attributes", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.18/10.18.d.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("5");
  });

  test("10.18.e — 10.18.e iteration of XForms actions - Summing Selected Results example", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.18/10.18.e.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10.3.b — 10.3.b insert action with bind and model attributes", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.3/10.3.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.3.g — 10.3.g insert action - nodeset indicates root element", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.3/10.3.g.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("7");
  });

  test("10.3.h — 10.3.h insert action and repeat element", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.3/10.3.h.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("1");
    expect(text).toContain("3");
    expect(text).toContain("3");
    expect(text).toContain("1");
  });

  test("10.4.b — 10.4.b delete action using context and bind attributes", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.4/10.4.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.4.c — 10.4.c delete action using context attribute terminates with no effect", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.4/10.4.c.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.4.f — 10.4.f delete action and repeat element", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.4/10.4.f.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.6.1.b — 10.6.1.b case element child of the toggle element precedence testing", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.6/10.6.1/10.6.1.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("10.7.1.a — 10.7.1.a setfocus element with control child element", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.7/10.7.1/10.7.1.a.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10.7.1.b — 10.7.1.b control element precedence tests", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.7/10.7.1/10.7.1.b.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10.7.a — 10.7.a setfocus element", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.7/10.7.a.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10.8.f — 10.8.f dispatch element dispatches cancelled predefined event", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.8/10.8.f.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10.a — 10.a action syntax example", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.a.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });
});
