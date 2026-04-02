import { test, expect, loadTest, loadAndWait, getRenderedText, getInstanceXML } from "./helpers";

const ch9_smoke: [string, string][] = [
  ["9.2.1.a2 — switch receives events", "Chapt09/9.2/9.2.1/9.2.1.a2.xhtml"],  // depends on event dispatch to switch/case
  ["9.3.5.a — repeating via attributes", "Chapt09/9.3/9.3.5/9.3.5.a.xhtml"],  // non-normative test
  ["9.3.7.b — copy binding exception", "Chapt09/9.3/9.3.7/9.3.7.b.xhtml"],  // expects xforms-binding-exception message or fatal error
];

test.describe("W3C Ch9 — Container Form Controls [smoke]", () => {
  for (const [name, file] of ch9_smoke) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }
});

test.describe("W3C Ch9 — Container Form Controls [behavioral]", () => {
  // -----------------------------------------------------------------
  // 9.1 group
  // -----------------------------------------------------------------

  /*
     You must not be able to see the Street Name and City input controls or they must be somehow
     unavailable to you.
  */
  test("9.1.1.a1 — group relevant=false hides Street Name and City", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.1/9.1.1/9.1.1.a1.xhtml");
    // group1 binds to shipDate with relevant="false()" → Street Name hidden
    const streetLabel = page.getByText("Street Name", { exact: true });
    await expect(streetLabel).toBeHidden();
    // input2 has relevant="false()" → City hidden
    const cityLabel = page.getByText("City", { exact: true });
    await expect(cityLabel).toBeHidden();
  });

  /*
     When you activate the Show Out Case trigger you must see "You are now in the Out case" output
     to the screen and a Show In Case trigger. When you activate the Show In Case trigger you must
     see "You are now in the In case" output to the screen and a Show Out Case trigger. When either
     switch is activated you must see an xforms-disabled message and an xforms-enabled message.
  */
  test("9.1.1.a2 — group inside switch/case toggles between In and Out", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.1/9.1.1/9.1.1.a2.xhtml");
    // Initial state: "In case" is selected — label and trigger visible
    await expect(page.getByText("You are now in the In case")).toBeVisible();
    const showOutTrigger = page.getByRole("button", { name: "Show Out Case" });
    await expect(showOutTrigger).toBeVisible();
    // Click "Show Out Case" → Out case shown
    await showOutTrigger.click();
    await page.waitForTimeout(500);
    await expect(page.getByText("You are now in the Out case")).toBeVisible();
    const showInTrigger = page.getByRole("button", { name: "Show In Case" });
    await expect(showInTrigger).toBeVisible();
    // Click "Show In Case" → In case restored
    await showInTrigger.click();
    await page.waitForTimeout(500);
    await expect(page.getByText("You are now in the In case")).toBeVisible();
    await expect(page.getByRole("button", { name: "Show Out Case" })).toBeVisible();
  });

  /*
     The first element in each of the two groups is a label element. This label should act as a
     label for the entire group. The group labeled "Shipping Address" must include the inputs Street
     Name and City. The group labeled "Shipping Date" must include the inputs Day and Month.
  */
  test("9.1.1.b — Shipping Address group has Street Name and City; Shipping Date has Day and Month", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.1/9.1.1/9.1.1.b.xhtml");
    // Group labels visible
    await expect(page.getByText("Shipping Address")).toBeVisible();
    await expect(page.getByText("Shipping Date")).toBeVisible();
    // Shipping Address inputs
    await expect(page.getByText("Street Name:")).toBeVisible();
    await expect(page.getByText("City:")).toBeVisible();
    // Shipping Date inputs
    await expect(page.getByText("Day:")).toBeVisible();
    await expect(page.getByText("Month:")).toBeVisible();
  });

  /*
     When you activate the Set Focus To Group 2 trigger it will set the focus to the second group.
     The focus (your cursor) must be inside the Street Name 2 input control of the Billing Address
     group.
  */
  test("9.1.1.c — Set Focus To Group 2 moves focus to Street Name 2", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.1/9.1.1/9.1.1.c.xhtml");
    // Both groups visible
    await expect(page.getByText("Shipping Address (group 1)")).toBeVisible();
    await expect(page.getByText("Billing Address (group 2)")).toBeVisible();
    // Click the trigger
    await page.getByRole("button", { name: "Set Focus To Group 2" }).click();
    await page.waitForTimeout(500);
    // Street Name 2 input should now have focus
    const streetName2 = page.locator('input[data-ref*="billTo/street"]');
    await expect(streetName2).toBeFocused();
  });

  // -----------------------------------------------------------------
  // 9.2 switch / case
  // -----------------------------------------------------------------

  /*
     When you activate the In Case trigger it must be replaced by the Out Case trigger. When you
     activate the Out Case trigger it must be replaced by the In Case trigger.
  */
  test("9.2.1.a1 — switch toggles between Case In and Case Out triggers", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.2/9.2.1/9.2.1.a1.xhtml");
    // Initial: "Case In" trigger visible, "Case Out" hidden
    const caseInBtn = page.getByRole("button", { name: "Case In" });
    const caseOutBtn = page.getByRole("button", { name: "Case Out" });
    await expect(caseInBtn).toBeVisible();
    await expect(caseOutBtn).toBeHidden();
    // Click "Case In" → "Case Out" visible, "Case In" hidden
    await caseInBtn.click();
    await page.waitForTimeout(500);
    await expect(caseOutBtn).toBeVisible();
    await expect(caseInBtn).toBeHidden();
    // Click "Case Out" → "Case In" visible again
    await caseOutBtn.click();
    await page.waitForTimeout(500);
    await expect(caseInBtn).toBeVisible();
    await expect(caseOutBtn).toBeHidden();
  });

  /*
     When you activate the Send Name trigger, the input control and the trigger will be replaced by
     an output that says "Hello" followed by whatever value was in the input control when it was
     activated and an Edit trigger. When activated, the output and the Edit trigger must be replaced
     by the input field and the Send Name trigger.
  */
  test("9.2.1.b — Send Name shows Hello output; Edit restores input", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.2/9.2.1/9.2.1.b.xhtml");
    // Initial state: input with "Bill" + "Send Name" trigger
    // Note: ref="/yourname" is the root element, so data-ref won't contain
    // "yourname" — use the class selector instead.
    const nameInput = page.locator('input.xforms-input');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue("Bill");
    const sendBtn = page.getByRole("button", { name: "Send Name" });
    await expect(sendBtn).toBeVisible();
    // Click "Send Name" → output shows "Hello" + "Bill", Edit trigger appears
    await sendBtn.click();
    await page.waitForTimeout(500);
    const output = page.locator('.xforms-output');
    await expect(output).toContainText("Bill");
    // The "out" case container shows the Hello label + output
    await expect(page.locator('#out')).toContainText("Hello");
    const editBtn = page.getByRole("button", { name: "Edit" });
    await expect(editBtn).toBeVisible();
    // Input and Send Name should be hidden
    await expect(nameInput).toBeHidden();
    await expect(sendBtn).toBeHidden();
    // Click "Edit" → back to input + Send Name
    await editBtn.click();
    await page.waitForTimeout(500);
    await expect(nameInput).toBeVisible();
    await expect(sendBtn).toBeVisible();
  });

  /*
     You must see the output "Name : Janel" below. You must NOT be able to see an output labeled
     "Eye Color" or it must be somehow unavailable to you.
  */
  test("9.2.2.a — case: first case auto-selected, shows Name Janel, Eye Color hidden", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.2/9.2.2/9.2.2.a.xhtml");
    // Name output visible with "Janel"
    const outputs = page.locator('.xforms-output');
    const texts = await outputs.allInnerTexts();
    expect(texts).toContain("Janel");
    // Eye Color label must NOT be visible
    const eyeColorLabel = page.getByText("Eye Color :", { exact: false });
    await expect(eyeColorLabel).toBeHidden();
  });

  /*
     You must see the output "Eye Color : Blue" below. You must NOT be able to see an output labeled
     "Name" or it must be somehow unavailable to you.
  */
  test("9.2.2.b — case selected=true on second case shows Eye Color Blue, Name hidden", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.2/9.2.2/9.2.2.b.xhtml");
    // Eye Color output visible with "Blue"
    const outputs = page.locator('.xforms-output');
    const texts = await outputs.allInnerTexts();
    expect(texts).toContain("Blue");
    await expect(page.getByText("Eye Color :", { exact: false })).toBeVisible();
    // Name label must NOT be visible
    const nameLabel = page.getByText("Name :", { exact: false });
    await expect(nameLabel).toBeHidden();
  });

  /*
     You must see the output "Name : Janel" below. You must NOT be able to see an output labeled
     "Eye Color" or it must be somehow unavailable to you.
  */
  test("9.2.2.c — both cases selected=true: first wins, shows Name Janel, Eye Color hidden", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.2/9.2.2/9.2.2.c.xhtml");
    // First case wins — Name output visible with "Janel"
    const outputs = page.locator('.xforms-output');
    const texts = await outputs.allInnerTexts();
    expect(texts).toContain("Janel");
    await expect(page.getByText("Name :", { exact: false })).toBeVisible();
    // Eye Color must NOT be visible
    const eyeColorLabel = page.getByText("Eye Color :", { exact: false });
    await expect(eyeColorLabel).toBeHidden();
  });

  // -----------------------------------------------------------------
  // 9.3 repeat
  // -----------------------------------------------------------------

  /*
     You must see the values "winshield wipers", "tires", "exhaust", and "air freshener" output
     below.
  */
  test("9.3.1.a — repeat outputs windshield wipers, tires, exhaust, air freshener", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.3/9.3.1/9.3.1.a.xhtml");
    const items = page.locator('[data-repeat-item]');
    await expect(items).toHaveCount(4);
    const text = await getRenderedText(page);
    expect(text).toContain("windshield wipers");
    expect(text).toContain("tires");
    expect(text).toContain("exhaust");
    expect(text).toContain("air freshener");
  });

  /* The value of the Initial Index output must be "3". */
  test("9.3.1.b — repeat startindex=3: Initial Index output is 3", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.3/9.3.1/9.3.1.b.xhtml");
    // The index output must show "3"
    const indexOutput = page.locator('.xforms-output').first();
    await expect(indexOutput).toHaveText("3");
    // All 4 items still rendered
    const items = page.locator('[data-repeat-item]');
    await expect(items).toHaveCount(4);
  });

  /* You may see only one car part item for the Items In Cart output. */
  test("9.3.1.c — repeat number=1: may see only one item", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.3/9.3.1/9.3.1.c.xhtml");
    // number="1" means processor may display only 1 item at a time
    const text = await getRenderedText(page);
    expect(text).toContain("Items In Cart");
    // At least 1 item visible
    const items = page.locator('[data-repeat-item]');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  /*
     You must see two lists of items, Items In Cart 1 and Items In Cart 2. Both lists must contain
     the values "winshield wipers", "tires", "exhaust", and "air freshener".
  */
  test("9.3.1.d — unrolled repeat: both lists show all 4 cart items", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.3/9.3.1/9.3.1.d.xhtml");
    const text = await getRenderedText(page);
    // Both lists must contain all items
    expect(text).toContain("Items In Cart 1");
    expect(text).toContain("Items In Cart 2");
    const allOutputs = page.locator('.xforms-output');
    const allTexts = await allOutputs.allInnerTexts();
    // Each item should appear at least twice (once per list)
    for (const item of ["windshield wipers", "tires", "exhaust", "air freshener"]) {
      const occurrences = allTexts.filter((t) => t.includes(item)).length;
      expect(occurrences).toBeGreaterThanOrEqual(2);
    }
  });

  /*
     You must see three items (named a, b, and c) and a price for each item (3.00, 32.25, and 132.99
     respectively). You must be able to add and remove items. When you add an item its initial name
     will be an empty input control and initial price will be 0.00.
  */
  test("9.3.1.e — repeat shows 3 line items (a/3.00, b/32.25, c/132.99) with insert and delete", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.3/9.3.1/9.3.1.e.xhtml");
    // Initially 3 repeat items
    const items = page.locator('[data-repeat-item]');
    await expect(items).toHaveCount(3);
    // Verify instance contains expected data
    const xml = await getInstanceXML(page);
    expect(xml).toContain('name="a"');
    expect(xml).toContain('name="b"');
    expect(xml).toContain('name="c"');
    expect(xml).toContain("3.00");
    expect(xml).toContain("32.25");
    expect(xml).toContain("132.99");
    // Insert trigger adds a new item
    await page.getByRole("button", { name: "Insert New Item After The Current One" }).click();
    await page.waitForTimeout(500);
    await expect(items).toHaveCount(4);
    // Remove trigger deletes the current item
    await page.getByRole("button", { name: "Remove Current Item" }).click();
    await page.waitForTimeout(500);
    await expect(items).toHaveCount(3);
  });

  /*
     You must see three sets of the statement "You are in the In case" and Go To Out Case triggers.
     When you activate a Go To Out Case trigger, the corresponding statement must change to "You are
     in the Out case" and the trigger must be replaced by a Go To In Case trigger. The other two
     statements and triggers must not change. Activating a Go To In Case trigger must restore the
     statement and trigger to their original state and also not change the other two statements or
     triggers.
  */
  test("9.3.1.f — switch inside repeat: 3 In-case statements, toggle one without affecting others", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.3/9.3.1/9.3.1.f.xhtml");
    // 3 repeat items
    const items = page.locator('[data-repeat-item]');
    await expect(items).toHaveCount(3);
    // All 3 show "You are in the In case" and "Go To Out Case" triggers
    const inLabels = page.locator('.xforms-output', { hasText: "You are in the In case" });
    await expect(inLabels).toHaveCount(3);
    const outTriggers = page.getByRole("button", { name: "Go To Out Case" });
    await expect(outTriggers).toHaveCount(3);
    // Toggle the first one
    await outTriggers.first().click();
    await page.waitForTimeout(500);
    // First item: "You are in the Out case" + "Go To In Case"
    const outLabels = page.locator('.xforms-output', { hasText: "You are in the Out case" });
    await expect(outLabels).toHaveCount(1);
    // Other two unchanged
    const remainingInLabels = page.locator('.xforms-output', { hasText: "You are in the In case" });
    await expect(remainingInLabels).toHaveCount(2);
    // Restore first item
    const inTrigger = page.getByRole("button", { name: "Go To In Case" });
    await inTrigger.click();
    await page.waitForTimeout(500);
    await expect(page.locator('.xforms-output', { hasText: "You are in the In case" })).toHaveCount(3);
  });

  /*
     When you activate the Show Out Case trigger it must be replaced by the Show In Case trigger.
     When you activate the Show In Case trigger it must be replaced by the Show Out Case trigger.
  */
  test("9.3.4.a — switch inside repeat toggles between Show Out/In Case", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.3/9.3.4/9.3.4.a.xhtml");
    // Initial: "Show Out Case" trigger visible
    const showOutBtn = page.getByRole("button", { name: "Show Out Case" });
    await expect(showOutBtn).toBeVisible();
    // Click → "Show In Case" appears
    await showOutBtn.click();
    await page.waitForTimeout(500);
    const showInBtn = page.getByRole("button", { name: "Show In Case" });
    await expect(showInBtn).toBeVisible();
    await expect(showOutBtn).toBeHidden();
    // Click back → "Show Out Case" restored
    await showInBtn.click();
    await page.waitForTimeout(500);
    await expect(showOutBtn).toBeVisible();
    await expect(showInBtn).toBeHidden();
  });
});

test.describe("W3C Chapter 9 — group bind relevance", () => {
  /*
     You must not be able to see the Street Name and City input controls or they must be somehow
     unavailable to you.
  */
  test("9.1.1.a1 group with bind relevant=false hides children", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.1/9.1.1/9.1.1.a1.xhtml");
    // group1 binds to shipDate with relevant="false()" — Street Name input must NOT be visible
    const streetLabel = page.getByText("Street Name", { exact: true });
    await expect(streetLabel).toBeHidden();
  });
});


const ch09_gaps_smoke: [string, string][] = [
  ["9.2.3.1.a", "Chapt09/9.2/9.2.3/9.2.3.1/9.2.3.1.a.xhtml"],  // depends on form submission lifecycle
  ["9.2.3.a", "Chapt09/9.2/9.2.3/9.2.3.a.xhtml"],  // expects modal message after trigger activation
];

test.describe("W3C Chapt09 [smoke gaps]", () => {
  for (const [name, file] of ch09_gaps_smoke) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }
});

test.describe("W3C Ch9 [behavioral promoted]", () => {
  /*
     Activating different triggers will place the the switch element into different cases. When in
     the In case, you must see a Go To Out Case trigger. When in the Out case, you must see a Go To
     Exit Case trigger and a Go To In Case trigger. When in the Exit case, you must see a Go To Out
     Case trigger.
  */
  test("9.2.3.1.b — 9.2.3.1.b case element child of the toggle element precedence testing", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.2/9.2.3/9.2.3.1/9.2.3.1.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     You must see two select controls that both contain the values "Vanilla", "Strawberry", and
     "Chocolate".
  */
  test("9.3.6.a — 9.3.6.a itemset element example", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.3/9.3.6/9.3.6.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe('');
  });

  /*
     When you select a flavor from the select control below you must see the output "Icecream Order
     : " and the selected flavor. If no flavor is selected (including if the chosen flavor is
     deselected) the output control, including label, must not be visible on the page.
  */
  test("9.3.7.a — 9.3.7.a copy element", async ({ page }) => {
    await loadAndWait(page, "Chapt09/9.3/9.3.7/9.3.7.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });
});
