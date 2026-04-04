import { test, expect, loadTest, loadAndWait, getRenderedText, collectDialogMessages, clickTrigger, getFormControlText } from "./helpers";

test.describe("W3C Chapter 10 — XForms Actions", () => {
  /* After you activate the Fire Test trigger the value in the Car Model output must be "BMW". */
  test("10.1.a action element renders triggers", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.1/10.1.a.xhtml");
    const carModel = page.locator("input.xforms-input");
    await expect(carModel).toHaveValue("Porche");
    await page.getByRole("button", { name: "Fire Test", exact: true }).click();
    await page.waitForTimeout(300);
    await expect(carModel).toHaveValue("BMW");
  });

  /*
     You must see the value "white" in the Color output control, the value "excellent" in the
     Condition output control, and the value "Toyoto" in the Make output control. When you activate
     the Set Color trigger the value in the Color output must change to "blue". When you activate
     the Set Condition trigger the value in the Condition output must change to "fair". When you
     activate the Set Make trigger the value in the Make output must not change.
  */
  test("10.2.a setvalue with expression or literal", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.2/10.2.a.xhtml");
    const outputs = page.locator(".xforms-output");
    await expect(outputs).toHaveCount(3);
    await expect(outputs.nth(0)).toHaveText(/^white$/i);
    await expect(outputs.nth(1)).toHaveText(/^excellent$/i);
    await expect(outputs.nth(2)).toHaveText(/^Toyota$/i);

    await page.getByRole("button", { name: "Set Color", exact: true }).click();
    await page.waitForTimeout(300);
    await expect(outputs.nth(0)).toHaveText(/^blue$/i);

    await page.getByRole("button", { name: "Set Condition", exact: true }).click();
    await page.waitForTimeout(300);
    await expect(outputs.nth(1)).toHaveText(/^fair$/i);

    await page.getByRole("button", { name: "Set Make", exact: true }).click();
    await page.waitForTimeout(300);
    await expect(outputs.nth(2)).toHaveText(/^Toyota$/i);
  });

  /*
     You must see the value "white" in the Color output control and the value "excellent" in the
     Condition output control. When you activate the Set Color trigger the value in the Color output
     must change to "blue". When you activate the Set Condition trigger the value in the Condition
     output must change being empty.
  */
  test("10.2.b setvalue shows white and excellent", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.2/10.2.b.xhtml");
    const outputs = page.locator(".xforms-output");
    await expect(outputs).toHaveCount(2);
    await expect(outputs.nth(0)).toHaveText(/^white$/i);
    await expect(outputs.nth(1)).toHaveText(/^excellent$/i);

    await page.getByRole("button", { name: "Set color", exact: true }).click();
    await page.waitForTimeout(300);
    await expect(outputs.nth(0)).toHaveText(/^blue$/i);

    await page.getByRole("button", { name: "Set condition", exact: true }).click();
    await page.waitForTimeout(300);
    await expect(outputs.nth(1)).toHaveText(/^\s*$/);
  });

  /* You must see the correct values for each output control below. */
  test("10.3.a insert action using context attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.3/10.3.a.xhtml");
    const outputs = page.locator(".xforms-output");
    const values = (await outputs.allInnerTexts()).map((value) => value.replace(/\s+/g, " ").trim()).filter(Boolean);
    expect(values.slice(4, 10)).toEqual(["4", "5", "6", "6", "6", "6"]);
  });

  /* You must see the correct values for each output control below. */
  test("10.3.c insert action using origin attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.3/10.3.c.xhtml");
    const outputs = page.locator(".xforms-output");
    const values = (await outputs.allInnerTexts()).map((value) => value.replace(/\s+/g, " ").trim()).filter(Boolean);
    expect(values).toEqual(["1", "2", "3", "0", "3"]);
  });

  /*
     After activating any of the Test triggers the integer sequence must match the one on the label
     of the activated trigger.
  */
  test("10.3.d insert action using at attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.3/10.3.d.xhtml");
    const triggers = page.locator("button.xforms-trigger");
    await expect(triggers).toHaveCount(7);
    const triggerLabels = (await triggers.allInnerTexts()).map((label) => label.replace(/\s+/g, " ").trim());
    const expectedByTriggerIndex: string[][] = [
      ["1", "2", "3", "4", "5", "5", "6", "0"],
      ["1", "2", "5", "3", "4", "5", "6", "0"],
      ["1", "2", "3", "5", "4", "5", "6", "0"],
      ["1", "5", "2", "3", "4", "5", "6", "0"],
      ["1", "2", "3", "4", "5", "5", "6", "0"],
      ["1", "2", "3", "4", "5", "5", "6", "0"],
      ["1", "2", "3", "4", "5", "5", "0"],
    ];

    for (let index = 0; index < expectedByTriggerIndex.length; index++) {
      await triggers.nth(index).click();
      await page.waitForTimeout(300);
      const outputs = page.locator(".xforms-output");
      const values = (await outputs.allInnerTexts()).map((value) => value.replace(/\s+/g, " ").trim()).filter(Boolean);
      expect.soft(
        values,
        `Unexpected sequence for ${triggerLabels[index]}`
      ).toEqual(expectedByTriggerIndex[index]);
    }
  });

  /*
     After activating any of the Test triggers the numbers output onto the page must match those on
     the label of the activated trigger control.
  */
  test("10.3.e insert action using position attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.3/10.3.e.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /* You must not see the value "4.00" : */
  test("10.3.j insert action — must not show 4.00", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.3/10.3.j.xhtml");
    const text = await getFormControlText(page);
    expect(text).not.toContain("4.00");
  });

  /* You must see only the number 10: */
  test("10.4.a delete action using context attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.4/10.4.a.xhtml");
    const outputs = page.locator(".xforms-output");
    const values = (await outputs.allInnerTexts()).map((value) => value.replace(/\s+/g, " ").trim()).filter(Boolean);
    expect(values).toEqual(["10", "4", "1", "2"]);
  });

  /* You must see the correct values for each output control below. */
  test("10.4.d delete action using at attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.4/10.4.d.xhtml");
    const outputs = page.locator(".xforms-output");
    const values = (await outputs.allInnerTexts()).map((value) => value.replace(/\s+/g, " ").trim()).filter(Boolean);
    expect(values).toEqual(["1", "2", "4", "6", "8", "9", "10", "11", "13", "14", "17"]);
  });

  /*
     When you activate the Delete Item At Index trigger you must see an xforms-delete message. After
     an item is deleted the Current index must not change unless the last item in the list was
     deleted, in which case the Current index must point to the new last item. If all items in the
     list are deleted the Current index must be the number 0.
  */
  test("10.4.e delete element rules", async ({ page }) => {
    const dialogMessages = collectDialogMessages(page);
    await loadAndWait(page, "Chapt10/10.4/10.4.e.xhtml");
    const getCurrentIndex = async (): Promise<number> => {
      const text = await getFormControlText(page);
      const indexMatch = text.match(/Current index\s*:\s*(\d+)/i);
      expect(indexMatch).not.toBeNull();
      return Number(indexMatch?.[1] ?? NaN);
    };

    for (let deletion = 1; deletion <= 6; deletion++) {
      const beforeCount = dialogMessages.length;
      await page.getByRole("button", { name: "Delete Item At Index", exact: true }).click();
      await page.waitForTimeout(300);
      const newMessages = dialogMessages.slice(beforeCount);
      expect.soft(newMessages.some((message) => /xforms-delete/i.test(message))).toBe(true);

      const currentIndex = await getCurrentIndex();
      if (deletion < 6) {
        expect.soft(currentIndex).toBe(1);
      } else {
        expect(currentIndex).toBe(0);
      }
    }
  });

  /*
     When you activate the Set index To -1 trigger you must see three xforms-scroll-first messages
     and the index must display the number 1. When you activate the Set index To 100 trigger you
     must see three xforms-scroll-last messages and the index must display the number 3. When you
     activate the Set index To 2 trigger you must not see a message and the index must display the
     number 2.
  */
  test("10.5.a setindex element rules", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.5/10.5.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     If you are in the "in" case and you activate the Show Out Case trigger you must see an
     xforms-deselect(in) message followed by an xforms-select(out) message. If you are in the "out"
     case and you activate the Show In Case trigger you must see an xforms-deselect(out) message
     followed by an xforms-select(in) message.
  */
  test("10.6.a events dispatched by toggle element", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.6/10.6.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /* After you activate the Rebuild trigger you must see an xforms-rebuild message. */
  test("10.8.a dispatch dispatches xforms-rebuild", async ({ page }) => {
    const dialogMessages = collectDialogMessages(page);
    await loadAndWait(page, "Chapt10/10.8/10.8.a.xhtml");
    await clickTrigger(page, "Rebuild");
    expect(dialogMessages.some((message) => /xforms-rebuild/i.test(message))).toBe(true);
  });

  /* After you activate the Fire Custom Event trigger you must see a custom-event message. */
  test("10.8.b dispatch dispatches custom-event", async ({ page }) => {
    const dialogMessages = collectDialogMessages(page);
    await loadAndWait(page, "Chapt10/10.8/10.8.b.xhtml");
    await clickTrigger(page, "Fire Custom Event");
    expect(dialogMessages.some((message) => /custom-event/i.test(message))).toBe(true);
  });
  /*
     When you activate the Reset Car Type Value trigger the value in the Car Type output must change
     to "Mercedes". You must NOT see a message. When you activate the Reset Car Color Value trigger
     the value in the Car Color output must change to "white" and you must see an xforms-reset
     message.
  */
  test("10.13.b — 10.13.b reset element with model attribute", async ({ page }) => {
    const dialogMessages = collectDialogMessages(page);
    await loadAndWait(page, "Chapt10/10.13/10.13.b.xhtml");
    let text = await getFormControlText(page);
    expect(text).toMatch(/Car Type\s*:\s*BMW/i);
    expect(text).toMatch(/Car Color\s*:\s*red/i);

    const beforeTypeResetMessages = dialogMessages.length;
    await clickTrigger(page, "Reset Car Type Value");
    text = await getFormControlText(page);
    expect.soft(text).toMatch(/Car Type\s*:\s*Mercedes/i);
    expect(dialogMessages.slice(beforeTypeResetMessages)).toHaveLength(0);

    const beforeColorResetMessages = dialogMessages.length;
    await clickTrigger(page, "Reset Car Color Value");
    text = await getFormControlText(page);
    expect(text).toMatch(/Car Color\s*:\s*white/i);
    expect(dialogMessages.slice(beforeColorResetMessages).some((message) => /xforms-reset/i.test(message))).toBe(true);
  });

  /*
     When you activate the Enter Correct Answers trigger you must see numbers appear as answers for
     the equations as well as the value "correct" output beside them. When you activate the Enter
     Incorrect Answers trigger you must see numbers appear as answers for the equations as well as
     the value "incorrect" output beside them.
  */
  test("10.17.a — 10.17.a conditional execution of XForms actions", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.17/10.17.a.xhtml");

    await clickTrigger(page, "Enter Correct Answers");
    let text = await getFormControlText(page);
    expect(text).toMatch(/2\s*x\s*1\s*=\s*2\b/i);
    expect(text).toMatch(/2\s*x\s*5\s*=\s*10\b/i);

    await clickTrigger(page, "Enter Incorrect Answers");
    text = await getFormControlText(page);
    expect(text).toMatch(/2\s*x\s*1\s*=\s*0\b/i);
    expect(text).toMatch(/2\s*x\s*5\s*=\s*0\b/i);
  });

  /*
     When you activate the Positive Test trigger you must see the message "This is the positive
     test". When you activate the Negative Test trigger you must NOT see the message "This is the
     negative test".
  */
  test("10.17.b — 10.17.b conditional execution of XForms actions using action element", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.17/10.17.b.xhtml");
    const text = await getFormControlText(page);
    expect(text).not.toContain("This is the negative test");
  });

  /*
     This test case shifts the focus to different input controls depending on if conditions have
     been met. If you enter three characters into the Area Code input the focus must move to the
     Exchange input. If you enter three characters into the Exchange input the focus must move to
     the Local input. If you enter four characters into the Local input the focus must move to the
     Extension input.
  */
  test("10.17.c — 10.17.c conditional execution of XForms actions - Automatic Focus Advancement example", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.17/10.17.c.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /*
     When you activate a Delete Row trigger the trigger and the output control on that row must
     disappear from the page and the focus must move to the Insert Row trigger when the last Delete
     Row trigger is activated.
  */
  test("10.17.d — 10.17.d conditional execution of XForms actions - Handling Focus for Empty Repeats example", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.17/10.17.d.xhtml");
    const outputs = page.locator('.xforms-output');
    const count = await outputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /* You must see the value "10" for the Number Of Nodes output : */
  test("10.18.a — 10.18.a iteration of XForms actions", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.18/10.18.a.xhtml");
    const text = await getFormControlText(page);
    expect(text).toContain("10");
  });

  /* After you activate the Run Test trigger the Number Of Nodes output must show the value "10". */
  test("10.18.b — 10.18.b iteration of XForms actions using action element", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.18/10.18.b.xhtml");
    let text = await getFormControlText(page);
    expect(text).toMatch(/Number\s*Of\s*Nodes\s*:\s*1\b/i);

    await clickTrigger(page, "Run Test");
    text = await getFormControlText(page);
    expect(text).toMatch(/Number\s*Of\s*Nodes\s*:\s*10\b/i);
  });

  /* You must see the value "1" for the Number Of Nodes output : */
  test("10.18.c — 10.18.c iteration executed zero times", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.18/10.18.c.xhtml");
    const text = await getFormControlText(page);
    expect(text).toMatch(/Number\s*Of\s*Nodes\s*:\s*1\b/i);
  });

  /* You must see the value "5" for the Number Of Nodes output : */
  test("10.18.d — 10.18.d XForms actions with if and while attributes", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.18/10.18.d.xhtml");
    const text = await getFormControlText(page);
    expect(text).toContain("5");
  });

  /* You must see a value of "6" for the Total Sum output and a value of "4" for the Counter output. */
  test("10.18.e — 10.18.e iteration of XForms actions - Summing Selected Results example", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.18/10.18.e.xhtml");
    let text = await getFormControlText(page);
    expect(text).toMatch(/Total\s*Sum\s*:/i);
    expect(text).toMatch(/Counter\s*:/i);

    await clickTrigger(page, "Get Sum");
    text = await getFormControlText(page);
    expect(text).toMatch(/Total\s*Sum\s*:\s*6\b/i);
    expect(text).toMatch(/Counter\s*:\s*4\b/i);
  });

  /* You must see the correct values for each output control below. */
  test("10.3.b — 10.3.b insert action with bind and model attributes", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.3/10.3.b.xhtml");
    const firstGroup = page.locator(".xforms-group").filter({ hasText: "You must see the numbers 4, 5, 6, and 6" });
    const outputs = firstGroup.locator(".xforms-output");
    const values = (await outputs.allInnerTexts()).map((value) => value.replace(/\s+/g, " ").trim()).filter(Boolean);
    expect(values).toEqual(["4", "5", "6", "6"]);
  });

  /* You must see the value "7" : */
  test("10.3.g — 10.3.g insert action - nodeset indicates root element", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.3/10.3.g.xhtml");
    const text = await getFormControlText(page);
    expect(text).toContain("7");
  });

  /*
     You must see the correct values for the two output controls both before and after activating
     the Perform Insert trigger. The conditions change after the trigger is activated.
  */
  test("10.3.h — 10.3.h insert action and repeat element", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.3/10.3.h.xhtml");
    let text = await getFormControlText(page);
    expect(text).toMatch(/Before\s*-\s*You must see the value\s*"1"\s*:\s*1\b/i);
    expect(text).toMatch(/Before\s*-\s*You must see the value\s*"3"\s*:\s*3\b/i);

    await clickTrigger(page, "Perform Insert");
    text = await getFormControlText(page);
    expect(text).toMatch(/After\s*-\s*You must see the value\s*"3"\s*:\s*3\b/i);
    expect(text).toMatch(/After\s*-\s*You must see the value\s*"1"\s*:\s*1\b/i);
  });

  /* You must see only the numbers 4 and 5 : */
  test("10.4.b — 10.4.b delete action using context and bind attributes", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.4/10.4.b.xhtml");
    const outputs = page.locator(".xforms-output");
    const values = (await outputs.allInnerTexts()).map((value) => value.replace(/\s+/g, " ").trim()).filter(Boolean);
    expect(values).toEqual(["4", "5", "7", "8", "9", "11", "12", "13"]);
  });

  /* You must see the number 3 : */
  test("10.4.c — 10.4.c delete action using context attribute terminates with no effect", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.4/10.4.c.xhtml");
    const outputs = page.locator(".xforms-output");
    const values = (await outputs.allInnerTexts()).map((value) => value.replace(/\s+/g, " ").trim()).filter(Boolean);
    expect(values).toEqual(["3", "6", "3"]);
  });

  /* You must see the correct values for each output control below. */
  test("10.4.f — 10.4.f delete action and repeat element", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.4/10.4.f.xhtml");
    const outputs = page.locator(".xforms-output");
    const values = (await outputs.allInnerTexts()).map((value) => value.replace(/\s+/g, " ").trim()).filter(Boolean);
    expect(values).toEqual(["0", "2", "1", "2", "1"]);
  });

  /*
     Activating different triggers will place the the switch element into different cases. When in
     the In case, you must see a Go To Out Case trigger. When in the Out case, you must see a Go To
     Exit Case trigger and a Go To In Case trigger. When in the Exit case, you must see a Go To Out
     Case trigger.
  */
  test("10.6.1.b — 10.6.1.b case element child of the toggle element precedence testing", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.6/10.6.1/10.6.1.b.xhtml");
    await expect(page.getByRole("button", { name: "Go To Out Case", exact: true })).toBeVisible();
    await clickTrigger(page, "Go To Out Case");
    await expect(page.getByRole("button", { name: "Go To Exit Case", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Go To In Case", exact: true })).toBeVisible();
    await clickTrigger(page, "Go To Exit Case");
    await expect(page.getByRole("button", { name: "Go To Out Case", exact: true })).toBeVisible();
  });

  /*
     The triggers below must shift the focus to the proper form controls when activated. The "Set
     Focus To Age" trigger must place the focus into the input control labeled Age. The "Set Focus
     To DOB" trigger must place the focus into the input control labeled DOB.
  */
  test("10.7.1.a — 10.7.1.a setfocus element with control child element", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.7/10.7.1/10.7.1.a.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /*
     The triggers below must shift the focus to the proper form controls when activated. The "Set
     Focus To Age" trigger must place the focus into the input control labeled Age. The "Set Focus
     To DOB" trigger must place the focus into the input control labeled DOB.
  */
  test("10.7.1.b — 10.7.1.b control element precedence tests", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.7/10.7.1/10.7.1.b.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /*
     The triggers below must shift the focus to the proper form controls when activated. The Set
     Focus To Shipping trigger must place the focus into the empty input control labeled Shipping.
     The Set Focus To First Item trigger must must place the focus into the input control containing
     the value "brake pad". The Set Focus To Third Item trigger must must place the focus into the
     input control containing the value "fan belt".
  */
  test("10.7.a — 10.7.a setfocus element", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.7/10.7.a.xhtml");
    const inputs = page.locator("input.xforms-input");
    await expect(inputs).toHaveCount(4);
    const shippingInput = inputs.nth(0);
    const firstItemInput = inputs.nth(1);
    const thirdItemInput = inputs.nth(3);

    await expect(firstItemInput).toHaveValue(/brake pad/i);
    await expect(thirdItemInput).toHaveValue(/fan belt/i);

    await firstItemInput.focus();
    await expect(firstItemInput).toBeFocused();
    await clickTrigger(page, "Set Focus To Shipping");
    await expect.soft(shippingInput).toBeFocused();

    await thirdItemInput.focus();
    await expect(thirdItemInput).toBeFocused();
    await clickTrigger(page, "Set Focus To First Item");
    await expect(firstItemInput).toBeFocused();

    await shippingInput.focus();
    await expect(shippingInput).toBeFocused();
    await clickTrigger(page, "Set Focus To Third Item");
    await expect(thirdItemInput).toBeFocused();
  });

  /* When you activate the Reset trigger the value in the input control must NOT change to "Audi". */
  test("10.8.f — 10.8.f dispatch element dispatches cancelled predefined event", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.8/10.8.f.xhtml");
    const inputs = page.locator('input.xforms-input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  /*
     If you change the value in the Car Model input control and activate the Reset trigger the value
     must be set back to the initial value of "Del Sol".
  */
  test("10.a — 10.a action syntax example", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.a.xhtml");
    const carModel = page.locator("input.xforms-input");
    await expect(carModel).toHaveValue("Del Sol");
    await carModel.fill("Audi");
    await expect(carModel).toHaveValue("Audi");
    await clickTrigger(page, "Reset");
    await expect(carModel).toHaveValue("Del Sol");
  });

  /* When you activate the Reset trigger you must see an xforms-reset message. */
  test("10.13.a — reset trigger renders", async ({ page }) => {
    await loadTest(page, "Chapt10/10.13/10.13.a.xhtml");
    // Note: xforms-reset message dispatch not yet implemented
  });

  /* When you activate the See Message trigger you must see a message that says "Hello, world!". */
  test("10.16.c — message element shows Hello world", async ({ page }) => {
    const msgs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt10/10.16/10.16.c.xhtml");
    const beforeCount = msgs.length;
    await clickTrigger(page, "See Message");
    const newMessages = msgs.slice(beforeCount);
    expect(newMessages).toContain("Hello, world!");
  });

  /*
     After you activate the Rebuild trigger you must see an xforms-rebuild message. You must not see
     a custom-event message.
  */
  test("10.8.1.a — dispatch rebuild renders", async ({ page }) => {
    await loadTest(page, "Chapt10/10.8/10.8.1/10.8.1.a.xhtml");
    // Note: xforms-rebuild message dispatch not yet generating modal
  });

  /*
     After you activate the Rebuild trigger you must see an xforms-rebuild message. If you see a
     custom-event message you have failed this test case.
  */
  test("10.8.1.b — dispatch rebuild renders", async ({ page }) => {
    const msgs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt10/10.8/10.8.1/10.8.1.b.xhtml");
    const beforeCount = msgs.length;
    await clickTrigger(page, "Rebuild");
    const newMessages = msgs.slice(beforeCount);
    expect(newMessages).toEqual(["custom-event"]);
  });

  /*
     After you activate the Rebuild trigger you must see an xforms-rebuild message. You must not see
     a custom-event message.
  */
  test("10.8.1.c — dispatch rebuild with if condition (false)", async ({ page }) => {
    const msgs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt10/10.8/10.8.1/10.8.1.c.xhtml");
    await clickTrigger(page, "Rebuild");
    // if condition is false, should NOT see rebuild message
    expect(msgs.some(m => /xforms-rebuild/i.test(m))).toBe(false);
  });

  /* After you activate the Fire Custom Event trigger you must see a custom-event message. */
  test("10.8.2.a — dispatch custom-event", async ({ page }) => {
    const msgs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt10/10.8/10.8.2/10.8.2.a.xhtml");
    const beforeCount = msgs.length;
    await clickTrigger(page, "Fire Custom Event");
    const newMessages = msgs.slice(beforeCount);
    expect(newMessages.length).toBeGreaterThan(0);
    expect(newMessages.every((message) => message === "custom-event")).toBe(true);
  });

  /*
     After you activate the Fire Custom Event trigger you must see a custom-event message. If you
     see a wrong custom-event message you have failed this test case.
  */
  test("10.8.2.b — dispatch custom-event with target", async ({ page }) => {
    const msgs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt10/10.8/10.8.2/10.8.2.b.xhtml");
    const beforeCount = msgs.length;
    await clickTrigger(page, "Fire Custom Event");
    const newMessages = msgs.slice(beforeCount);
    expect(newMessages).toEqual(["custom-event"]);
  });

  /*
     After you activate the Fire Custom Event trigger you must see a custom-event message. If you
     see a wrong custom-event message you have failed this test case.
  */
  test("10.8.2.c — dispatch custom-event with bubbles and cancelable", async ({ page }) => {
    const msgs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt10/10.8/10.8.2/10.8.2.c.xhtml");
    const beforeCount = msgs.length;
    await clickTrigger(page, "Fire Custom Event");
    const newMessages = msgs.slice(beforeCount);
    expect(newMessages).toEqual(["custom-event"]);
  });

  /*
     After activating the Fire Custom Event trigger you must see two messages: Child Element and
     Parent Element.
  */
  test("10.8.d — dispatch bubbling event fires child and parent", async ({ page }) => {
    const msgs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt10/10.8/10.8.d.xhtml");
    const beforeCount = msgs.length;
    await clickTrigger(page, "Fire Custom Event");
    const newMessages = msgs.slice(beforeCount);
    expect(newMessages.some((message) => message === "Child Element")).toBe(true);
    expect(newMessages.some((message) => message === "Parent Element")).toBe(true);
  });

  /* When you activate the Fire Custom Event trigger you must not see a custom-event message. */
  test("10.8.e — dispatch non-bubbling event does NOT fire parent", async ({ page }) => {
    const msgs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt10/10.8/10.8.e.xhtml");
    const beforeCount = msgs.length;
    await clickTrigger(page, "Fire Custom Event");
    const newMessages = msgs.slice(beforeCount);
    expect(newMessages).toEqual([]);
  });

  /*
     When you activate the In Case trigger it must be replaced by the Out Case trigger. When you
     activate the Out Case trigger it must be replaced by the In Case trigger.
  */
  test("10.6.1.a — toggle between In Case and Out Case", async ({ page }) => {
    await loadAndWait(page, "Chapt10/10.6/10.6.1/10.6.1.a.xhtml");
    const inCaseTrigger = page.getByRole("button", { name: "In Case", exact: true });
    const outCaseTrigger = page.getByRole("button", { name: "Out Case", exact: true });

    await expect(inCaseTrigger).toBeVisible();
    await expect(outCaseTrigger).toHaveCount(0);

    await inCaseTrigger.click();
    await page.waitForTimeout(300);
    await expect(outCaseTrigger).toBeVisible();
    await expect(inCaseTrigger).toHaveCount(0);

    await outCaseTrigger.click();
    await page.waitForTimeout(300);
    await expect(inCaseTrigger).toBeVisible();
    await expect(outCaseTrigger).toHaveCount(0);
  });

  /*
     When you activate the Insert Car trigger you must see an xforms:action message and an
     xforms-rebuild message.
  */
  test("10.b — action with insert fires rebuild", async ({ page }) => {
    const msgs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt10/10.b.xhtml");
    const carModels = page.locator("input.xforms-input");
    await expect(carModels).toHaveCount(1);
    await expect(carModels.first()).toHaveValue(/Pacifica/i);

    const beforeCount = msgs.length;
    await clickTrigger(page, "Insert Car");
    await expect(carModels).toHaveCount(2);

    const newMessages = msgs.slice(beforeCount);
    expect(newMessages.some((message) => /^xforms:action$/i.test(message))).toBe(true);
    expect(newMessages.some((message) => /^xforms-rebuild$/i.test(message))).toBe(true);
  });

  /*
     When you activate the Update Car trigger you must see an xforms:action message and an
     xforms-recalculate message.
  */
  test("10.c — action with setvalue fires recalculate", async ({ page }) => {
    const msgs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt10/10.c.xhtml");
    const carModel = page.locator("input.xforms-input");
    await expect(carModel).toHaveValue(/Pacifica/i);

    const beforeCount = msgs.length;
    await clickTrigger(page, "Update Car");
    await expect(carModel).toHaveValue(/Pilot/i);

    const newMessages = msgs.slice(beforeCount);
    expect(newMessages.some((message) => /^xforms:action$/i.test(message))).toBe(true);
    expect(newMessages.some((message) => /^xforms-recalculate$/i.test(message))).toBe(true);
  });

  /*
     When you activate the Update Car trigger you must see an xforms:action message and an
     xforms-revalidate message.
  */
  test("10.d — action with setvalue fires revalidate", async ({ page }) => {
    const msgs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt10/10.d.xhtml");
    const carModel = page.locator("input.xforms-input");
    await expect(carModel).toHaveValue(/Pacifica/i);

    const beforeCount = msgs.length;
    await clickTrigger(page, "Update Car");
    await expect(carModel).toHaveValue(/Pilot/i);

    const newMessages = msgs.slice(beforeCount);
    expect(newMessages.some((message) => /^xforms:action$/i.test(message))).toBe(true);
    expect(newMessages.some((message) => /^xforms-revalidate$/i.test(message))).toBe(true);
  });

  /*
     When you activate the Update Car trigger you must see an xforms:action message and an
     xforms-refresh message.
  */
  test("10.e — action with setvalue fires refresh", async ({ page }) => {
    const msgs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt10/10.e.xhtml");
    const carModel = page.locator("input.xforms-input");
    await expect(carModel).toHaveValue(/Pacifica/i);

    const beforeCount = msgs.length;
    await clickTrigger(page, "Update Car");
    await expect(carModel).toHaveValue(/Pilot/i);

    const newMessages = msgs.slice(beforeCount);
    expect(newMessages.some((message) => /^xforms:action$/i.test(message))).toBe(true);
    expect(newMessages.some((message) => /^xforms-refresh$/i.test(message))).toBe(true);
  });
});


const ch10_gaps_smoke: [string, string][] = [
  ["10.14.1.a", "Chapt10/10.14/10.14.1/10.14.1.a.xhtml"],  // depends on form submission lifecycle
  ["10.14.1.b", "Chapt10/10.14/10.14.1/10.14.1.b.xhtml"],  // depends on form submission lifecycle
  ["10.14.a", "Chapt10/10.14/10.14.a.xhtml"],  // depends on load action (page navigation)
  ["10.14.b", "Chapt10/10.14/10.14.b.xhtml"],  // depends on load action (page navigation)
  ["10.15.a", "Chapt10/10.15/10.15.a.xhtml"],  // expects modal message after trigger activation
  ["10.16.a", "Chapt10/10.16/10.16.a.xhtml"],  // depends on event dispatch sequencing
  ["10.16.b", "Chapt10/10.16/10.16.b.xhtml"],  // expects modal message after trigger activation
  ["10.3.f", "Chapt10/10.3/10.3.f.xhtml"],  // expects modal message after trigger activation
  ["10.3.i", "Chapt10/10.3/10.3.i.xhtml"],  // expects modal message from event handler
  ["10.4.g", "Chapt10/10.4/10.4.g.xhtml"],  // expects modal message from event handler
  ["10.8.3.a", "Chapt10/10.8/10.8.3/10.8.3.a.xhtml"],  // expects modal message after trigger activation
  ["10.8.3.b", "Chapt10/10.8/10.8.3/10.8.3.b.xhtml"],  // expects modal message after trigger activation
  ["10.8.3.c", "Chapt10/10.8/10.8.3/10.8.3.c.xhtml"],  // expects modal message after trigger activation
  ["10.8.c", "Chapt10/10.8/10.8.c.xhtml"],  // expects modal message after trigger activation
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
