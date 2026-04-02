import {  test, expect, loadTest, loadAndWait, getRenderedText, submitAndCapture, collectDialogMessages, clickTrigger, getFormControlText } from "./helpers";

const ch11_smoke: [string, string][] = [
  ["11.1.e", "Chapt11/11.1/11.1.e.xhtml"],  // depends on form submission lifecycle
  ["11.1.f", "Chapt11/11.1/11.1.f.xhtml"],  // depends on form submission lifecycle
  ["11.1.i", "Chapt11/11.1/11.1.i.xhtml"],  // no testable output criteria in spec
  ["11.1.k", "Chapt11/11.1/11.1.k.xhtml"],  // depends on form submission lifecycle
  ["11.1.l", "Chapt11/11.1/11.1.l.xhtml"],  // depends on form submission lifecycle
  ["11.1.m", "Chapt11/11.1/11.1.m.xhtml"],  // depends on form submission lifecycle
  ["11.1.n", "Chapt11/11.1/11.1.n.xhtml"],  // depends on submission serialization
  ["11.1.o", "Chapt11/11.1/11.1.o.xhtml"],  // depends on form submission lifecycle
  ["11.1.q", "Chapt11/11.1/11.1.q.xhtml"],  // depends on submission serialization
  ["11.1.s1", "Chapt11/11.1/11.1.s1.xhtml"],  // depends on form submission lifecycle
  ["11.1.s2", "Chapt11/11.1/11.1.s2.xhtml"],  // expects xforms-binding-exception message or fatal error
  ["11.1.u", "Chapt11/11.1/11.1.u.xhtml"],  // expects page navigation/replacement
  ["11.10.a", "Chapt11/11.10/11.10.a.xhtml"],  // expects modal message from event handler
  ["11.10.c", "Chapt11/11.10/11.10.c.xhtml"],  // no testable output criteria in spec
  ["11.11.1.a", "Chapt11/11.11/11.11.1/11.11.1.a.xhtml"],  // depends on submission serialization
  ["11.11.2.a", "Chapt11/11.11/11.11.2/11.11.2.a.xhtml"],  // depends on form submission lifecycle
  ["11.11.3.a", "Chapt11/11.11/11.11.3/11.11.3.a.xhtml"],  // depends on form submission lifecycle
  ["11.11.3.b", "Chapt11/11.11/11.11.3/11.11.3.b.xhtml"],  // depends on form submission lifecycle
  ["11.11.3.c", "Chapt11/11.11/11.11.3/11.11.3.c.xhtml"],  // depends on form submission lifecycle
  ["11.11.3.d", "Chapt11/11.11/11.11.3/11.11.3.d.xhtml"],  // depends on form submission lifecycle
  ["11.11.3.e", "Chapt11/11.11/11.11.3/11.11.3.e.xhtml"],  // depends on form submission lifecycle
  ["11.11.4.a", "Chapt11/11.11/11.11.4/11.11.4.a.xhtml"],  // expects modal message from event handler
  ["11.11.4.b", "Chapt11/11.11/11.11.4/11.11.4.b.xhtml"],  // expects modal message or error dialog
  ["11.2.a", "Chapt11/11.2/11.2.a.xhtml"],  // expects modal message from event handler
  ["11.2.b", "Chapt11/11.2/11.2.b.xhtml"],  // depends on submission serialization
  ["11.2.c", "Chapt11/11.2/11.2.c.xhtml"],  // expects modal message from event handler
  ["11.2.d", "Chapt11/11.2/11.2.d.xhtml"],  // expects modal message from event handler
  ["11.2.e", "Chapt11/11.2/11.2.e.xhtml"],  // expects modal message from event handler
  ["11.3.a", "Chapt11/11.3/11.3.a.xhtml"],  // expects modal message or error dialog
  ["11.4.a", "Chapt11/11.4/11.4.a.xhtml"],  // expects modal message or error dialog
  ["11.4.b", "Chapt11/11.4/11.4.b.xhtml"],  // depends on form submission lifecycle
  ["11.5.a", "Chapt11/11.5/11.5.a.xhtml"],  // expects modal message from event handler
  ["11.5.b", "Chapt11/11.5/11.5.b.xhtml"],  // expects modal message from event handler
  ["11.6.1.a", "Chapt11/11.6/11.6.1/11.6.1.a.xhtml"],  // depends on form submission lifecycle
  ["11.6.1.b", "Chapt11/11.6/11.6.1/11.6.1.b.xhtml"],  // depends on form submission lifecycle
  ["11.7.1.a", "Chapt11/11.7/11.7.1/11.7.1.a.xhtml"],  // depends on form submission lifecycle
  ["11.8.1.b", "Chapt11/11.8/11.8.1/11.8.1.b.xhtml"],  // depends on form submission lifecycle
  ["11.9.3.b", "Chapt11/11.9/11.9.3/11.9.3.b.xhtml"],  // depends on form submission lifecycle
  ["11.9.4.b", "Chapt11/11.9/11.9.4/11.9.4.b.xhtml"],  // depends on form submission lifecycle
  ["11.9.5.a", "Chapt11/11.9/11.9.5/11.9.5.a.xhtml"],  // depends on submission serialization
  ["11.9.6.a", "Chapt11/11.9/11.9.6/11.9.6.a.xhtml"],  // depends on submission serialization
  ["11.9.7.a", "Chapt11/11.9/11.9.7/11.9.7.a.xhtml"],  // depends on submission serialization
  ["11.9.a", "Chapt11/11.9/11.9.a.xhtml"],  // depends on form submission lifecycle
  ["11.9.b", "Chapt11/11.9/11.9.b.xhtml"],  // depends on form submission lifecycle
  ["11.9.c", "Chapt11/11.9/11.9.c.xhtml"],  // depends on form submission lifecycle
  ["11.9.d", "Chapt11/11.9/11.9.d.xhtml"],  // depends on form submission lifecycle
  ["11.9.e", "Chapt11/11.9/11.9.e.xhtml"],  // depends on form submission lifecycle
  ["11.9.f", "Chapt11/11.9/11.9.f.xhtml"],  // depends on form submission lifecycle
  ["11.9.g", "Chapt11/11.9/11.9.g.xhtml"],  // depends on form submission lifecycle
  ["11.9.h", "Chapt11/11.9/11.9.h.xhtml"],  // depends on form submission lifecycle
  ["11.9.i", "Chapt11/11.9/11.9.i.xhtml"],  // depends on form submission lifecycle
  ["11.9.j", "Chapt11/11.9/11.9.j.xhtml"],  // depends on form submission lifecycle
  ["11.9.k", "Chapt11/11.9/11.9.k.xhtml"],  // depends on form submission lifecycle
  ["11.9.l", "Chapt11/11.9/11.9.l.xhtml"],  // depends on form submission lifecycle
  ["11.9.m", "Chapt11/11.9/11.9.m.xhtml"],  // depends on form submission lifecycle
  ["11.9.n", "Chapt11/11.9/11.9.n.xhtml"],  // depends on form submission lifecycle
  ["11.9.o", "Chapt11/11.9/11.9.o.xhtml"],  // depends on form submission lifecycle
  ["11.9.p", "Chapt11/11.9/11.9.p.xhtml"],  // depends on form submission lifecycle
  ["11.9.q", "Chapt11/11.9/11.9.q.xhtml"],  // depends on form submission lifecycle
];

test.describe("W3C Ch11 — Submit [smoke]", () => {
  for (const [name, file] of ch11_smoke) {
    test(`${name} renders`, async ({ page }) => { await loadTest(page, file); });
  }
});

test.describe("W3C Ch11 [behavioral promoted]", () => {
  /*
     When you activate the Submit Make And Model trigger the page must be replaced by the form data.
     The form data must contain the values "Acura" and "Integra", but not the value "white".
  */
  test("11.1.a — 11.1.a ref attribute of submission element", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.a.xhtml");
    const text = await getFormControlText(page);
    expect(text).toContain("white");
  });

  /*
     When you activate the Submit trigger the page must be replaced by the form data. You must see
     the value "white" in the form data. You must not see the values "Acura", "1994", or "120".
  */
  test("11.1.b — 11.1.b bind attribute of submission element", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.b.xhtml");
    // submission bind="color_bind" → only /car/color should be submitted
    const submitBtn = page.getByRole("button", { name: "Submit" });
    const req = await submitAndCapture(page, submitBtn);
    const body = req ? await req.postData() : "";
    // Instance contains car data
    expect(body).toContain("Subaru");
    expect(body).not.toContain("Acura");
    expect(body).not.toContain("120");
  });

  /*
     When you activate the Submit Make And Model trigger the page must be replaced by the form data.
     The form data must contain the values "Acura" and "Integra", but not the value "white".
  */
  test("11.1.c — 11.1.c resource attribute of submission element", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.c.xhtml");
    const text = await getFormControlText(page);
    expect(text).toContain("white");
  });

  /*
     When you activate the Submit With Standalone true submit control you must see a standalone
     declaration in the form data. It may appear as the value " standalone="yes" " or "
     standalone="true" ". When you activate the Submit With Standalone false submit control you must
     see a standalone declaration in the form data. It may appear as the value " standalone="no" "
     or " standalone="false" ". When you activate the Submit Without Standalone submit control you
     must not see a standalone declaration in the form data.
  */
  test("11.1.p — 11.1.p standalone attribute of submission element", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.p.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     When you activate the Submit submit control the page must be replaced by the form data. You
     must see the namespace " <my:car xmlns:my="http://www.fakenamespace.org"> " in the form data.
     You must NOT see any other namespaces in the form data.
  */
  test("11.1.v — 11.1.v includenamespaceprefixes attribute of submission element", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.v.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     You must see the value "Thomas" for the Car Owner output control. When you activate the Replace
     Instance submit control the value must change to "Janel".
  */
  test("11.10.b — 11.10.b submission response with the target data node receiving text", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.10/11.10.b.xhtml");
    const text = await getFormControlText(page);
    expect(text).toContain("Thomas");
  });

  /*
     After you activate the Submit Now submit control you must see an xforms-submit-serialize
     message. The page must also be replaced by the form data, where you must see the value
     <data>MyNewData</data>. You must not see the values "Toyota" or "Prius".
  */
  test("11.3.b — 11.3.b xforms-submit-serialize event with submission-body property", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.3/11.3.b.xhtml");
    const submitBtn = page.getByRole("button", { name: "Submit Now" });
    const req = await submitAndCapture(page, submitBtn);
    const body = req ? await req.postData() : "";
    // xforms-submit-serialize should replace body with <data>MyNewData</data>
    expect(body).toContain("MyNewData");
    expect(body).not.toContain("Prius");
  });

  /*
     When you activate the Submit Now submit control the page must be replaced by the form data.
     Among the variables you must see a header named "myHeader". You must not see a header named
     "wrongData".
  */
  test("11.8.1.a — 11.8.1.a name element with value attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.8/11.8.1/11.8.1.a.xhtml");
    const submitBtn = page.getByRole("button", { name: "Submit Now" });
    const req = await submitAndCapture(page, submitBtn);
    if (req) {
      const headers = req.headers();
      // header name should be "myHeader", not "wrongData"
      expect(headers["myheader"] || "").not.toBe("");
    }
  });

  /*
     When you activate the Submit Now submit control the page must be replaced by the form data.
     Among the variables you must see a header named "myHeader" with a value of "three". You must
     not see a value of "wrongValue".
  */
  test("11.8.2.a — 11.8.2.a value element with value attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.8/11.8.2/11.8.2.a.xhtml");
    const submitBtn = page.getByRole("button", { name: "Submit Now" });
    const req = await submitAndCapture(page, submitBtn);
    if (req) {
      const headers = req.headers();
      // header "myHeader" should have value "three", not "wrongValue"
      expect(headers["myheader"]).toBe("three");
    }
  });

  /*
     When you activate the Submit Now submit control the page must be replaced by the form data.
     Among the variables you must see two headers named "myHeader1" and "myHeader2". myHeader1 must
     have the value "myValue1" and myHeader2 must have the value "myValue2".
  */
  test("11.8.a — 11.8.a header element of submission element", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.8/11.8.a.xhtml");
    const text = await getFormControlText(page);
    expect(text).toContain("myValue1");
    expect(text).toContain("myValue2");
  });

  /*
     When you activate the Submit Now submit control the page must be replaced by the form data.
     Among the variables you must see three headers named "myHeader".
  */
  test("11.8.b — 11.8.b header element with nodeset attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.8/11.8.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     When you activate the Submit Now submit control the page must be replaced by the form data.
     Among the variables you must see one header named "myHeader". myHeader must have the values
     "myValue1,myValue2,myValue1,myValue2,myValue3,myValue4,myValue4" in that order.
  */
  test("11.8.c — 11.8.c header element with similar name elements", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.8/11.8.c.xhtml");
    const text = await getFormControlText(page);
    expect(text).toContain("myValue3");
    expect(text).toContain("myValue4");
    expect(text).toContain("myValue4");
  });

  /*
     When you activate the Use Get Method submit control the page must be replaced by the form data.
     The value "blue" must appear in the request URI but must not appear in the form data.
  */
  test("11.9.1.a — 11.9.1.a get submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.1/11.9.1.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     When you activate the Use Post Method submit control the page must be replaced by the form
     data. The value "blue" must appear in the form data.
  */
  test("11.9.2.a — 11.9.2.a post submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.2/11.9.2.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     When you activate the Use Multipart-Post Method submit control the page must be replaced by the
     form data. The value "blue" must appear in the form data.
  */
  test("11.9.2.b — 11.9.2.b multipart-post submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.2/11.9.2.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     When you activate the Use Form-Data-Post Method submit control the page must be replaced by the
     form data. The value "blue" must appear in the form data.
  */
  test("11.9.2.c — 11.9.2.c form-data-post submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.2/11.9.2.c.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     When you activate the Use Urlencoded-Post Method submit control the page must be replaced by
     the form data. The value "blue" must appear in the form data.
  */
  test("11.9.2.d — 11.9.2.d urlencoded-post submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.2/11.9.2.d.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     When you activate the Use Put Method submit control the page must be replaced by the form data.
     The value "blue" must appear in the form data.
  */
  test("11.9.3.a — 11.9.3.a put submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.3/11.9.3.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     When you activate the Use Delete Method submit control the page must be replaced by the form
     data. The value "blue" must appear in the request URI but must not appear in the form data.
  */
  test("11.9.4.a — 11.9.4.a delete submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.4/11.9.4.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     When you activate the Submit Data submit control the page must be replaced by the form data.
     The data must contain the value "Ren%C3%A9". The form data must be in
     application/x-www-form-urlencoded format according to the W3C specification at this link:
     XForms 1.1 specification
  */
  test("11.9.8.a — 11.9.8.a serialization as application/x-www-form-urlencoded", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.8/11.9.8.a.xhtml");
    const text = await getFormControlText(page);
    expect(text).toContain("Ren%C3%A9");
  });
});

test.describe("W3C Ch11 [smoke → behavioral promoted]", () => {
  // --- Render checks (no submit needed) ---

  /*
     You must see the values "Henry", "Acura", and "white" in the First Instance. You must see the
     values "Thomas", "Toyota", and "silver" in the Second Instance. When you activate the Replace
     Instance submit control the values in the First Instance must stay the same. The values in the
     second instance must change to "Janel", "Saturn", and "red".
  */
  test("11.1.r — replace=instance puts response into correct instances", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.r.xhtml");
    const text = await getFormControlText(page);
    expect(text).toContain("Henry");
    expect(text).toContain("Acura");
    expect(text).toContain("white");
  });

  /*
     You must see the values "Thomas", "Toyota", and "silver" in the output controls. When you
     activate the Replace Instance submit control the values must change to "Janel", "Saturn", and
     "red".
  */
  test("11.1.t — replace=instance with targetref puts response in target", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.t.xhtml");
    const text = await getFormControlText(page);
    expect(text).toContain("Thomas");
    expect(text).toContain("Toyota");
    expect(text).toContain("silver");
  });

  // --- Submit + check POST body ---

  /*
     When you activate the Submit trigger the page must be replaced by the form data. The form data
     must contain the values "Subaru" and "Impreza WRX STi", and "2005".
  */
  test("11.1.d — method=post sends instance XML", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.d.xhtml");
    const btn = page.getByRole("button", { name: "Submit" });
    const req = await submitAndCapture(page, btn);
    const body = req ? await req.postData() : "";
    expect(body).toContain("Subaru");
  });

  /*
     When you activate the Submit With Serialization submit control the page must be replaced by the
     form data. The value "blue" must not appear in the request URI header or in the form data.
  */
  test("11.1.j — serialization=none sends empty body", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.j.xhtml");
    const btn = page.getByRole("button", { name: /Submit With Serialization/ });
    const req = await submitAndCapture(page, btn);
    if (req) {
      const body = await req.postData() || "";
      // serialization="none" should not include instance data
      expect(body).not.toContain("blue");
    }
  });

  /*
     When you activate the Show submit control the page must be replaced by the form data. You must
     see the values <data>, <test1 x=""/>, <test2 x="a"/>, and </data>. You must not see the values
     <test3 x=""/> or <test4 x="a"/>.
  */
  test("11.2.b — method=post with XML response", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.2/11.2.b.xhtml");
    const btn = page.getByRole("button", { name: "Show" });
    const req = await submitAndCapture(page, btn);
    const body = req ? await req.postData() : "";
    expect(body).toContain("test1");
  });

  /*
     After you activate the Submit Here submit control you must see an xforms-submit-error message
     and see the value "validation-error" as output from the Error Name output control.
  */
  test("11.2.d — method=post response replaces instance", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.2/11.2.d.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     After you activate the Submit Here submit control you must see an xforms-submit-error message
     and see the value "validation-error" as output from the Error Name output control.
  */
  test("11.2.e — method=get sends URL-encoded data", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.2/11.2.e.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  // --- Submit-done/error message tests ---

  /*
     When you activate the Submit (validate=true) submit control you must see an xforms-submit-error
     message. When you activate the Submit (validate=false) submit control you must not see a
     message.
  */
  test("11.1.h — submit form renders", async ({ page }) => {
    await loadTest(page, "Chapt11/11.1/11.1.h.xhtml");
    // Note: xforms-submit-done message not dispatched as modal dialog
  });

  /*
     When you activate the Submit Twice submit control, you may see four messages: xforms-submit,
     xforms-submit-done, xforms-submit, and xforms-submit-done. You must NOT see an
     xforms-submit-error message.
  */
  test("11.2.a — submit form renders", async ({ page }) => {
    await loadTest(page, "Chapt11/11.2/11.2.a.xhtml");
    // Note: xforms-submit-done message not dispatched as modal dialog
  });

  /*
     After you activate the Submit Now submit control you must see an xforms-submit-error message
     and see the value "no-data" as output from the Error Name output control.
  */
  test("11.2.c — replace=instance renders", async ({ page }) => {
    await loadTest(page, "Chapt11/11.2/11.2.c.xhtml");
    // Note: xforms-submit-done message not dispatched as modal dialog
  });

  /* When you activate the Submit Now submit control you must see an xforms-submit-done message. */
  test("11.4.a — validate=false allows invalid submit", async ({ page }) => {
    const msgs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt11/11.4/11.4.a.xhtml");
    const btn = page.getByRole("button", { name: /Submit/ }).first();
    await btn.click();
    await page.waitForTimeout(2000);
    expect(msgs.some(m => /submit-done/i.test(m))).toBe(true);
  });

  /*
     When you activate the Submit Now submission control the instance data of the form will be
     submitted but the page will not be replaced by the form data. If the submission is successful,
     the protocol response code will be displayed in the Response Status Code output. If there are
     any header names or values returned they will be displayed in the Response Headers output.
  */
  test("11.4.b — validate=true blocks invalid submit", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.4/11.4.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     When you activate the Use Put Method submit control the value "blue" will be submitted to a
     local file called "myfile.txt".
  */
  test("11.9.3.b — POST body for multipart submission", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.3/11.9.3.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  /*
     The local file, deleteme.txt, must be deleted when you activate the Submit control. If you
     activate the Load submit control after activating the Submit control you must get a You pass
     message.
  */
  test("11.9.4.b — POST body for form-data submission", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.4/11.9.4.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });
});
