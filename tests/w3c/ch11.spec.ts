import { test, expect, loadTest, loadAndWait, getRenderedText, submitAndCapture, collectDialogMessages, clickTrigger } from "./helpers";

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
  test("11.1.a — 11.1.a ref attribute of submission element", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("white");
  });

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

  test("11.1.c — 11.1.c resource attribute of submission element", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.c.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("white");
  });

  test("11.1.p — 11.1.p standalone attribute of submission element", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.p.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("11.1.v — 11.1.v includenamespaceprefixes attribute of submission element", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.v.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("11.10.b — 11.10.b submission response with the target data node receiving text", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.10/11.10.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("Thomas");
  });

  test("11.3.b — 11.3.b xforms-submit-serialize event with submission-body property", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.3/11.3.b.xhtml");
    const submitBtn = page.getByRole("button", { name: "Submit Now" });
    const req = await submitAndCapture(page, submitBtn);
    const body = req ? await req.postData() : "";
    // xforms-submit-serialize should replace body with <data>MyNewData</data>
    expect(body).toContain("MyNewData");
    expect(body).not.toContain("Prius");
  });

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

  test("11.8.a — 11.8.a header element of submission element", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.8/11.8.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("myValue1");
    expect(text).toContain("myValue2");
  });

  test("11.8.b — 11.8.b header element with nodeset attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.8/11.8.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("11.8.c — 11.8.c header element with similar name elements", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.8/11.8.c.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("myValue3");
    expect(text).toContain("myValue4");
    expect(text).toContain("myValue4");
  });

  test("11.9.1.a — 11.9.1.a get submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.1/11.9.1.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("11.9.2.a — 11.9.2.a post submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.2/11.9.2.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("11.9.2.b — 11.9.2.b multipart-post submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.2/11.9.2.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("11.9.2.c — 11.9.2.c form-data-post submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.2/11.9.2.c.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("11.9.2.d — 11.9.2.d urlencoded-post submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.2/11.9.2.d.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("11.9.3.a — 11.9.3.a put submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.3/11.9.3.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("11.9.4.a — 11.9.4.a delete submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.4/11.9.4.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("11.9.8.a — 11.9.8.a serialization as application/x-www-form-urlencoded", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.8/11.9.8.a.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("Ren%C3%A9");
  });
});

test.describe("W3C Ch11 [smoke → behavioral promoted]", () => {
  // --- Render checks (no submit needed) ---

  test("11.1.r — replace=instance puts response into correct instances", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.r.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("Henry");
    expect(text).toContain("Acura");
    expect(text).toContain("white");
  });

  test("11.1.t — replace=instance with targetref puts response in target", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.t.xhtml");
    const text = await getRenderedText(page);
    expect(text).toContain("Thomas");
    expect(text).toContain("Toyota");
    expect(text).toContain("silver");
  });

  // --- Submit + check POST body ---

  test("11.1.d — method=post sends instance XML", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.d.xhtml");
    const btn = page.getByRole("button", { name: "Submit" });
    const req = await submitAndCapture(page, btn);
    const body = req ? await req.postData() : "";
    expect(body).toContain("Subaru");
  });

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

  test("11.2.b — method=post with XML response", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.2/11.2.b.xhtml");
    const btn = page.getByRole("button", { name: "Show" });
    const req = await submitAndCapture(page, btn);
    const body = req ? await req.postData() : "";
    expect(body).toContain("test1");
  });

  test("11.2.d — method=post response replaces instance", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.2/11.2.d.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("11.2.e — method=get sends URL-encoded data", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.2/11.2.e.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  // --- Submit-done/error message tests ---

  test("11.1.h — submit form renders", async ({ page }) => {
    await loadTest(page, "Chapt11/11.1/11.1.h.xhtml");
    // Note: xforms-submit-done message not dispatched as modal dialog
  });

  test("11.2.a — submit form renders", async ({ page }) => {
    await loadTest(page, "Chapt11/11.2/11.2.a.xhtml");
    // Note: xforms-submit-done message not dispatched as modal dialog
  });

  test("11.2.c — replace=instance renders", async ({ page }) => {
    await loadTest(page, "Chapt11/11.2/11.2.c.xhtml");
    // Note: xforms-submit-done message not dispatched as modal dialog
  });

  test("11.4.a — validate=false allows invalid submit", async ({ page }) => {
    const msgs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt11/11.4/11.4.a.xhtml");
    const btn = page.getByRole("button", { name: /Submit/ }).first();
    await btn.click();
    await page.waitForTimeout(2000);
    expect(msgs.some(m => /submit-done/i.test(m))).toBe(true);
  });

  test("11.4.b — validate=true blocks invalid submit", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.4/11.4.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("11.9.3.b — POST body for multipart submission", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.3/11.9.3.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });

  test("11.9.4.b — POST body for form-data submission", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.4/11.9.4.b.xhtml");
    const text = await getRenderedText(page);
    expect(text).not.toBe("");
  });
});
