import { test, expect, loadAndWait, getEventModelResults, expectDatatypeEvents, clickTrigger, normalizeWhitespace, collectDialogMessages, expectDialogAfterTrigger } from "./helpers";

test.describe("W3C Ch5 — Datatypes [behavioral]", () => {
  test("5.1.a — primitive types: valid and invalid triggers produce expected event outputs", async ({ page }) => {
    await loadAndWait(page, "Chapt05/5.1/5.1.a.xhtml");

    await clickTrigger(page, "Valid Values");
    let eventResults = await getEventModelResults(page);
    expectDatatypeEvents(eventResults, "xforms-valid", [
      "dateTime",
      "time",
      "date",
      "gYearMonth",
      "gYear",
      "gMonthDay",
      "gDay",
      "gMonth",
      "string",
      "boolean",
      "base64Binary",
      "hexBinary",
      "float",
      "decimal",
      "double",
      "anyURI",
      "QName",
    ]);

    await clickTrigger(page, "Invalid Values");
    eventResults = await getEventModelResults(page);
    expectDatatypeEvents(eventResults, "XFORMS-INVALID", [
      "dateTime",
      "time",
      "date",
      "gYearMonth",
      "gYear",
      "gMonthDay",
      "gDay",
      "gMonth",
      "boolean",
      "base64Binary",
      "hexBinary",
      "float",
      "decimal",
      "double",
      "anyURI",
      "QName",
    ]);
  });

  test("5.1.b — derived types: valid and invalid triggers produce expected event outputs", async ({ page }) => {
    await loadAndWait(page, "Chapt05/5.1/5.1.b.xhtml");

    await clickTrigger(page, "Valid Values");
    let eventResults = await getEventModelResults(page);
    expectDatatypeEvents(eventResults, "xforms-valid", [
      "normalizedString",
      "token",
      "language",
      "Name",
      "NCName",
      "ID",
      "IDREF",
      "IDREFS",
      "NMTOKEN",
      "NMTOKENS",
      "integer",
      "nonPositiveInteger",
      "negativeInteger",
      "long",
      "int",
      "short",
      "byte",
      "nonNegativeInteger",
      "unsignedLong",
      "unsignedInt",
      "unsignedShort",
      "unsignedByte",
      "positiveInteger",
    ]);

    await clickTrigger(page, "Invalid Values");
    eventResults = await getEventModelResults(page);
    expectDatatypeEvents(eventResults, "XFORMS-INVALID", [
      "language",
      "Name",
      "NCName",
      "ID",
      "IDREF",
      "IDREFS",
      "NMTOKEN",
      "NMTOKENS",
      "integer",
      "nonPositiveInteger",
      "negativeInteger",
      "long",
      "int",
      "short",
      "byte",
      "nonNegativeInteger",
      "unsignedLong",
      "unsignedInt",
      "unsignedShort",
      "unsignedByte",
      "positiveInteger",
    ]);
  });

  test("5.1.c — basic primitive support: valid and invalid triggers produce expected event outputs", async ({ page }) => {
    await loadAndWait(page, "Chapt05/5.1/5.1.c.xhtml");

    await clickTrigger(page, "Valid Values");
    let eventResults = await getEventModelResults(page);
    expectDatatypeEvents(eventResults, "xforms-valid", [
      "dateTime",
      "time",
      "date",
      "gYearMonth",
      "gYear",
      "gMonthDay",
      "gDay",
      "gMonth",
      "string",
      "boolean",
      "base64Binary",
      "decimal",
      "anyURI",
    ]);

    await clickTrigger(page, "Invalid Values");
    eventResults = await getEventModelResults(page);
    expectDatatypeEvents(eventResults, "XFORMS-INVALID", [
      "dateTime",
      "time",
      "date",
      "gYearMonth",
      "gYear",
      "gMonthDay",
      "gDay",
      "gMonth",
      "boolean",
      "base64Binary",
      "decimal",
      "anyURI",
    ]);
  });

  test("5.1.d — basic derived support: valid and invalid triggers produce expected event outputs", async ({ page }) => {
    await loadAndWait(page, "Chapt05/5.1/5.1.d.xhtml");

    await clickTrigger(page, "Valid Values");
    let eventResults = await getEventModelResults(page);
    const integerFamily = [
      "integer",
      "nonPositiveInteger",
      "negativeInteger",
      "long",
      "int",
      "short",
      "byte",
      "nonNegativeInteger",
      "unsignedLong",
      "unsignedInt",
      "unsignedShort",
      "unsignedByte",
      "positiveInteger",
    ];
    expectDatatypeEvents(eventResults, "xforms-valid", integerFamily);

    await clickTrigger(page, "Invalid Values");
    eventResults = await getEventModelResults(page);
    expectDatatypeEvents(eventResults, "XFORMS-INVALID", integerFamily);
  });

  test("5.1.e — xsi:type date: valid and invalid triggers produce expected event outputs", async ({ page }) => {
    await loadAndWait(page, "Chapt05/5.1/5.1.e.xhtml");

    await clickTrigger(page, "Valid Value");
    let eventResults = await getEventModelResults(page);
    expectDatatypeEvents(eventResults, "xforms-valid", ["date"]);

    await clickTrigger(page, "Invalid Value");
    eventResults = await getEventModelResults(page);
    expectDatatypeEvents(eventResults, "XFORMS-INVALID", ["date"]);
  });

  test("5.2.1.a — empty primitive values remain valid (no invalid events)", async ({ page }) => {
    await loadAndWait(page, "Chapt05/5.2/5.2.1/5.2.1.a.xhtml");

    await clickTrigger(page, "Run Test");
    const eventResults = await getEventModelResults(page);
    expect(eventResults.some((value) => /XFORMS-INVALID/i.test(value))).toBe(false);
    expectDatatypeEvents(eventResults, "xforms-valid", [
      "dateTime",
      "time",
      "date",
      "gYearMonth",
      "gYear",
      "gMonthDay",
      "gDay",
      "gMonth",
      "string",
      "boolean",
      "base64Binary",
      "hexBinary",
      "float",
      "decimal",
      "double",
      "anyURI",
      "QName",
    ]);
  });

  test("5.2.1.b — empty derived values remain valid (no invalid events)", async ({ page }) => {
    await loadAndWait(page, "Chapt05/5.2/5.2.1/5.2.1.b.xhtml");

    await clickTrigger(page, "Run Test");
    const eventResults = await getEventModelResults(page);
    expect(eventResults.some((value) => /XFORMS-INVALID/i.test(value))).toBe(false);
    expectDatatypeEvents(eventResults, "xforms-valid", [
      "normalizedString",
      "token",
      "language",
      "Name",
      "NCName",
      "ID",
      "IDREF",
      "IDREFS",
      "NMTOKEN",
      "NMTOKENS",
      "integer",
      "nonPositiveInteger",
      "negativeInteger",
      "long",
      "int",
      "short",
      "byte",
      "nonNegativeInteger",
      "unsignedLong",
      "unsignedInt",
      "unsignedShort",
      "unsignedByte",
      "positiveInteger",
    ]);
  });

  test("5.2.1.c — empty basic-processor datatypes remain valid (no invalid events)", async ({ page }) => {
    await loadAndWait(page, "Chapt05/5.2/5.2.1/5.2.1.c.xhtml");

    await clickTrigger(page, "Run Test");
    const eventResults = await getEventModelResults(page);
    expect(eventResults.some((value) => /XFORMS-INVALID/i.test(value))).toBe(false);
    expectDatatypeEvents(eventResults, "xforms-valid", [
      "dateTime",
      "time",
      "date",
      "gYearMonth",
      "gYear",
      "gMonthDay",
      "gDay",
      "gMonth",
      "string",
      "boolean",
      "base64Binary",
      "decimal",
      "anyURI",
      "integer",
      "nonPositiveInteger",
      "negativeInteger",
      "long",
      "int",
      "short",
      "byte",
      "nonNegativeInteger",
      "unsignedLong",
      "unsignedInt",
      "unsignedShort",
      "unsignedByte",
      "positiveInteger",
    ]);
  });

  test("5.2.2.a — listItem emits the required valid-message output", async ({ page }) => {
    const dialogMessages: string[] = [];
    page.on("dialog", async (dialog) => {
      dialogMessages.push(normalizeWhitespace(dialog.message()));
      await dialog.dismiss();
    });
    await loadAndWait(page, "Chapt05/5.2/5.2.2/5.2.2.a.xhtml");
    const input = page.locator('input[data-ref*=\"availableColors\"]');
    await expect(input).toHaveValue("RedBlueGreen");
    expect(await input.inputValue()).not.toMatch(/\s/);

    await page.waitForTimeout(300);
    expect(
      dialogMessages.some((message) => /You entered a valid listItem/i.test(message))
    ).toBe(true);
  });

  test("5.2.3.a — listItems emits the required valid-message output", async ({ page }) => {
    const dialogMessages: string[] = [];
    page.on("dialog", async (dialog) => {
      dialogMessages.push(normalizeWhitespace(dialog.message()));
      await dialog.dismiss();
    });
    await loadAndWait(page, "Chapt05/5.2/5.2.3/5.2.3.a.xhtml");
    const input = page.locator('input[data-ref*=\"availableColors\"]');
    await expect(input).toHaveValue("Red Blue Green");
    expect(await input.inputValue()).toMatch(/^\S+(\s+\S+)+$/);

    await page.waitForTimeout(300);
    expect(
      dialogMessages.some((message) => /You entered a valid listItems/i.test(message))
    ).toBe(true);
  });

  test("5.2.4.a — dayTimeDuration emits the required valid-message output", async ({ page }) => {
    const dialogMessages = collectDialogMessages(page);
    await loadAndWait(page, "Chapt05/5.2/5.2.4/5.2.4.a.xhtml");
    const input = page.locator('input[data-ref*="rentalLeaseLength"]');
    await expect(input).toHaveValue("P5DT3H4M2S");
    expect(await input.inputValue()).toMatch(/^P(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?$/);
    await page.waitForTimeout(300);
    expect(
      dialogMessages.some((message) => /You entered a valid dayTimeDuration/i.test(message))
    ).toBe(true);
  });

  test("5.2.5.a — yearMonthDuration emits the required valid-message output", async ({ page }) => {
    const dialogMessages = collectDialogMessages(page);
    await loadAndWait(page, "Chapt05/5.2/5.2.5/5.2.5.a.xhtml");
    const input = page.locator('input[data-ref*="leaseLength"]');
    await expect(input).toHaveValue("P100Y1M");
    expect(await input.inputValue()).toMatch(/^P(\d+Y)?(\d+M)?$/);
    await page.waitForTimeout(300);
    expect(
      dialogMessages.some((message) => /You entered a valid yearMonthDuration/i.test(message))
    ).toBe(true);
  });

  test("5.2.6.a — email triggers emit required valid/invalid messages", async ({ page }) => {
    const dialogMessages = collectDialogMessages(page);
    await loadAndWait(page, "Chapt05/5.2/5.2.6/5.2.6.a.xhtml");

    const emailInput = page.locator('input[data-ref*=\"email_address\"]');
    await expect(emailInput).toHaveCount(1);
    await expectDialogAfterTrigger(
      page,
      dialogMessages,
      "Valid Email Test 1",
      /You entered a valid email/i
    );
    await expect(emailInput).toHaveValue("editors@example.com");
    await expectDialogAfterTrigger(
      page,
      dialogMessages,
      "Valid Email Test 2",
      /You entered a valid email/i
    );
    await expect(emailInput).toHaveValue("~my_mail+{nospam}$?@sub-domain.example.info");
    await expectDialogAfterTrigger(
      page,
      dialogMessages,
      "Invalid Email Test 1",
      /You entered an invalid email/i
    );
    await expect(emailInput).toHaveValue("editors@(this is a comment)example.info");
    await expectDialogAfterTrigger(
      page,
      dialogMessages,
      "Invalid Email Test 2",
      /You entered an invalid email/i
    );
    await expect(emailInput).toHaveValue("editors{at}example{dot}info");
  });

  test("5.2.7.a — card-number triggers emit required valid/invalid messages", async ({ page }) => {
    const dialogMessages = collectDialogMessages(page);
    await loadAndWait(page, "Chapt05/5.2/5.2.7/5.2.7.a.xhtml");

    const cardInput = page.locator('input[data-binding-type*=\"card-number\"]');
    await expect(cardInput).toHaveCount(1);
    await expectDialogAfterTrigger(
      page,
      dialogMessages,
      "Valid card-number Test 1",
      /You entered a valid card-number/i
    );
    await expect(cardInput).toHaveValue("012345678910");
    await expectDialogAfterTrigger(
      page,
      dialogMessages,
      "Valid card-number Test 2",
      /You entered a valid card-number/i
    );
    await expect(cardInput).toHaveValue("1234567891011121314");
    await expectDialogAfterTrigger(
      page,
      dialogMessages,
      "Invalid card-number Test 1",
      /You entered an invalid card-number/i
    );
    await expect(cardInput).toHaveValue("0II23581321");
    await expectDialogAfterTrigger(
      page,
      dialogMessages,
      "Invalid card-number Test 2",
      /You entered an invalid card-number/i
    );
    await expect(cardInput).toHaveValue("0112E581321345589144");
  });

  test("5.2.7.b — credit-card example emits required valid card-number message", async ({ page }) => {
    const dialogMessages = collectDialogMessages(page);
    await loadAndWait(page, "Chapt05/5.2/5.2.7/5.2.7.b.xhtml");

    const cardInput = page.locator('input[data-binding-type*=\"card-number\"]');
    await expect(cardInput).toHaveCount(1);
    await expectDialogAfterTrigger(
      page,
      dialogMessages,
      "Valid card-number Test",
      /You entered a valid card-number/i
    );
    await expect(cardInput).toHaveValue("4111111111111111");
  });
});
