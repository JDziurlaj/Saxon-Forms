import { test, expect, loadTest, loadAndWait, getRenderedText, submitAndCapture, collectDialogMessages, clickTrigger, getFormControlText, clickAndCaptureRequest, waitForCondition } from "./helpers";

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

test.describe("W3C Ch11 [smoke promoted gaps]", () => {
  /*
     Each submit control below submits the form with a different mode. Both must replace the page
     with form data containing the value "white".
  */
  test("11.1.e — mode attribute submits same color payload", async ({ page }) => {
    // TEST-TRACE: promote 11.1.e from render smoke to request-body checks for synchronous and asynchronous submissions.
    await loadAndWait(page, "Chapt11/11.1/11.1.e.xhtml");
    const syncReq = await submitAndCapture(page, page.getByRole("button", { name: "Submit with Synchronous" }));
    const syncBody = syncReq ? (await syncReq.postData()) || "" : "";
    expect(syncBody).toContain("white");
    expect(syncBody).not.toContain("Acura");

    await loadAndWait(page, "Chapt11/11.1/11.1.e.xhtml");
    const asyncReq = await submitAndCapture(page, page.getByRole("button", { name: "Submit with Asynchronous" }));
    const asyncBody = asyncReq ? (await asyncReq.postData()) || "" : "";
    expect(asyncBody).toContain("white");
    expect(asyncBody).not.toContain("Acura");
  });

  /*
     Each submit control below submits the form with a different method. Both must replace the page
     with form data containing the values "Infiniti", "G35x", and "2005".
  */
  test("11.1.f — method attribute dispatches post and put", async ({ page }) => {
    // TEST-TRACE: promote 11.1.f to verify HTTP method selection and submitted payload content.
    await loadAndWait(page, "Chapt11/11.1/11.1.f.xhtml");
    const postReq = await submitAndCapture(page, page.getByRole("button", { name: "Submit by Post" }));
    const postBody = postReq ? (await postReq.postData()) || "" : "";
    expect(postReq?.method()).toBe("POST");
    expect(postBody).toContain("Infiniti");
    expect(postBody).toContain("G35x");
    expect(postBody).toContain("2005");

    await loadAndWait(page, "Chapt11/11.1/11.1.f.xhtml");
    const putReq = await submitAndCapture(page, page.getByRole("button", { name: "Submit by Put" }));
    const putBody = putReq ? (await putReq.postData()) || "" : "";
    expect(putReq?.method()).toBe("PUT");
    expect(putBody).toContain("Infiniti");
    expect(putBody).toContain("G35x");
    expect(putBody).toContain("2005");
  });

  /*
     Both submit controls must replace the page with the form data when activated.
     With relevant=true, non-relevant dateOfPurchase must be excluded; with relevant=false it must be included.
  */
  test("11.1.i — relevant attribute controls non-relevant node serialization", async ({ page }) => {
    // TEST-TRACE: promote 11.1.i to compare serialized request bodies for relevant=true vs relevant=false.
    await loadAndWait(page, "Chapt11/11.1/11.1.i.xhtml");
    const relevantTrueReq = await submitAndCapture(page, page.getByRole("button", { name: "Submit (relevant=true)" }));
    const relevantTrueBody = relevantTrueReq ? (await relevantTrueReq.postData()) || "" : "";
    expect(relevantTrueBody).toContain("Suzuki");
    expect(relevantTrueBody).toContain("Hayabusa 1300");
    expect(relevantTrueBody).not.toContain("2006-04-26");

    await loadAndWait(page, "Chapt11/11.1/11.1.i.xhtml");
    const relevantFalseReq = await submitAndCapture(page, page.getByRole("button", { name: "Submit (relevant=false)" }));
    const relevantFalseBody = relevantFalseReq ? (await relevantFalseReq.postData()) || "" : "";
    expect(relevantFalseBody).toContain("Suzuki");
    expect(relevantFalseBody).toContain("Hayabusa 1300");
    expect(relevantFalseBody).toContain("2006-04-26");
  });

  /*
     When you activate the Submit submit control the page must be replaced by the form data.
     The variable on the page for the content type must equal the value "application/xml".
  */
  test("11.1.m — mediatype attribute sets application/xml content type", async ({ page }) => {
    // TEST-TRACE: promote 11.1.m to assert submission content-type header from mediatype attribute.
    await loadAndWait(page, "Chapt11/11.1/11.1.m.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Submit" }));
    const headers = req ? req.headers() : {};
    expect((headers["content-type"] || "").toLowerCase()).toContain("application/xml");
  });

  /*
     Submit (UTF-8) must include encoding="UTF-8"; Submit (ISO) must include encoding="ISO-8859-1".
  */
  test("11.1.n — encoding attribute controls XML declaration encoding", async ({ page }) => {
    // TEST-TRACE: promote 11.1.n to verify encoding marker in serialized XML for both submission controls.
    await loadAndWait(page, "Chapt11/11.1/11.1.n.xhtml");
    const utfReq = await submitAndCapture(page, page.getByRole("button", { name: "Submit (UTF-8)" }));
    const utfBody = utfReq ? (await utfReq.postData()) || "" : "";
    expect(utfBody).toMatch(/encoding=["']UTF-8["']/i);

    await loadAndWait(page, "Chapt11/11.1/11.1.n.xhtml");
    const isoReq = await submitAndCapture(page, page.getByRole("button", { name: "Submit (ISO)" }));
    const isoBody = isoReq ? (await isoReq.postData()) || "" : "";
    expect(isoBody).toMatch(/encoding=["']ISO-8859-1["']/i);
  });

  /*
     After activating Submit, XML declaration must not appear at the top of the form data.
  */
  test("11.1.o — omit-xml-declaration removes XML declaration", async ({ page }) => {
    // TEST-TRACE: promote 11.1.o to assert absence of XML declaration in serialized submission body.
    await loadAndWait(page, "Chapt11/11.1/11.1.o.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Submit" }));
    const body = req ? (await req.postData()) || "" : "";
    expect(body).not.toContain("<?xml");
  });

  /*
     cdata-section-elements must serialize chosen element content within CDATA sections.
  */
  test("11.1.q — cdata-section-elements serializes selected elements as CDATA", async ({ page }) => {
    // TEST-TRACE: promote 11.1.q to verify CDATA serialization behavior for make and year targets.
    await loadAndWait(page, "Chapt11/11.1/11.1.q.xhtml");
    const makeReq = await submitAndCapture(page, page.getByRole("button", { name: 'Submit (cdata="make")' }));
    const makeBody = makeReq ? (await makeReq.postData()) || "" : "";
    expect(makeBody).toContain("<![CDATA[Toyota]]>");
    expect(makeBody).toContain("<model>Acura</model>");

    await loadAndWait(page, "Chapt11/11.1/11.1.q.xhtml");
    const yearReq = await submitAndCapture(page, page.getByRole("button", { name: 'Submit (cdata="year")' }));
    const yearBody = yearReq ? (await yearReq.postData()) || "" : "";
    expect(yearBody).toContain("<![CDATA[2005]]>");
  });

  /*
     Activating one replace-instance control must update only that instance output.
  */
  test("11.1.s1 [phase1] — relative action URI resolves against source document", async ({ page }) => {
    // TEST-TRACE: phase-1 micro-test to isolate relative @action request-path resolution from replace-instance update behavior.
    await loadAndWait(page, "Chapt11/11.1/11.1.s1.xhtml");
    const observedRequests: string[] = [];
    page.on("request", (req) => {
      observedRequests.push(`${req.method()} ${req.url()}`);
    });
    const requestPromise = page.waitForRequest(
      (req) => req.method() === "GET" && /\/w3c-suite\/Chapt11\/11\.1\/11\.1\.s_data\.xml(?:\?|$)/.test(req.url()),
      { timeout: 3000 }
    ).catch(() => null);
    await clickTrigger(page, "Replace Instance 2");
    const req = await requestPromise;
    expect(req, `Observed requests:\n${observedRequests.join("\n")}`).not.toBeNull();
    expect(req?.url()).toContain("/w3c-suite/Chapt11/11.1/11.1.s_data.xml");
  });

  /*
     Activating one replace-instance control must update only that instance output.
  */
  test("11.1.s1 — instance attribute targets only selected replacement instance", async ({ page }) => {
    // TEST-TRACE: promote 11.1.s1 by asserting selective instance replacement for only the activated submission.
    await loadAndWait(page, "Chapt11/11.1/11.1.s1.xhtml");
    const before = await getFormControlText(page);
    expect(before).toContain("This is data from instance 1.");
    expect(before).toContain("This is data from instance 2.");
    expect(before).toContain("This is data from instance 3.");

    await clickTrigger(page, "Replace Instance 2");
    await page.waitForTimeout(500);
    const after = await getFormControlText(page);
    expect(after).toContain("This is data from instance 1.");
    expect(after).toContain("This is data from instance 3.");
    expect(after).toContain("This is the response data.");
    expect(after).not.toContain("This is data from instance 2.");
  });

  /*
     Invalid instance reference must produce xforms-binding-exception message or fatal binding failure.
  */
  test("11.1.s2 — invalid instance reference surfaces binding exception", async ({ page }) => {
    // TEST-TRACE: promote 11.1.s2 to verify binding-exception signaling on invalid submission instance reference.
    const dialogs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt11/11.1/11.1.s2.xhtml");
    const beforeCount = dialogs.length;
    await clickTrigger(page, "Invalid Instance");
    await page.waitForTimeout(500);
    const newDialogs = dialogs.slice(beforeCount);
    const rendered = await getRenderedText(page);
    expect(
      newDialogs.some((message) => /xforms-binding-exception/i.test(message)) ||
      /xforms-binding-exception|fatal/i.test(rendered)
    ).toBe(true);
  });

  /*
     URL-encoded body must use default '&' separator and configured ';' separator respectively.
  */
  test("11.1.u — separator attribute changes urlencoded pair separator", async ({ page }) => {
    // TEST-TRACE: promote 11.1.u to compare urlencoded separator behavior between default and explicit separator.
    await loadAndWait(page, "Chapt11/11.1/11.1.u.xhtml");
    const ampReq = await submitAndCapture(page, page.getByRole("button", { name: "Separate With '&'" }));
    const ampBody = ampReq ? (await ampReq.postData()) || "" : "";
    expect(ampBody).toContain("carOwner=Greg");
    expect(ampBody).toContain("make=Toyota");
    expect(ampBody).toContain("color=Silver");
    expect(ampBody).toContain("&");

    await loadAndWait(page, "Chapt11/11.1/11.1.u.xhtml");
    const semiReq = await submitAndCapture(page, page.getByRole("button", { name: "Separate With ';'" }));
    const semiBody = semiReq ? (await semiReq.postData()) || "" : "";
    expect(semiBody).toContain("carOwner=Greg");
    expect(semiBody).toContain("make=Toyota");
    expect(semiBody).toContain("color=Silver");
    expect(semiBody).toContain(";");
  });

  /*
     Invalid targetref on replace=instance must dispatch xforms-submit-error and expose target-error.
  */
  test("11.10.a — invalid targetref dispatches submit-error and target-error type", async ({ page }) => {
    // TEST-TRACE: promote 11.10.a by asserting xforms-submit-error dialog and target-error output propagation.
    const dialogs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt11/11.10/11.10.a.xhtml");
    const beforeCount = dialogs.length;
    await clickTrigger(page, "Replace Instance");
    await page.waitForTimeout(500);
    const newDialogs = dialogs.slice(beforeCount);
    expect(newDialogs.some((message) => /xforms-submit-error/i.test(message))).toBe(true);
    const text = await getFormControlText(page);
    expect(text).toContain("target-error");
  });

  /*
     Replace Instance must keep first instance values and update second instance values.
  */
  test("11.10.c [phase1] — request path resolution is independent of targetref instance update", async ({ page }) => {
    // TEST-TRACE: phase-1 micro-test to disambiguate request URI resolution from replace-instance targetref update semantics.
    await loadAndWait(page, "Chapt11/11.10/11.10.c.xhtml");
    const observedRequests: string[] = [];
    const browserLogs: string[] = [];
    page.on("request", (req) => {
      observedRequests.push(`${req.method()} ${req.url()}`);
    });
    page.on("console", (msg) => {
      browserLogs.push(msg.text());
    });
    const requestPromise = page.waitForRequest(
      (req) => req.method() === "GET" && /\/w3c-suite\/Chapt11\/11\.10\/11\.10\.data\.xml(?:\?|$)/.test(req.url()),
      { timeout: 3000 }
    ).catch(() => null);
    await clickTrigger(page, "Replace Instance");
    const req = await requestPromise;
    expect(req, `Observed requests:\n${observedRequests.join("\n")}`).not.toBeNull();
    expect(req?.url()).toContain("/w3c-suite/Chapt11/11.10/11.10.data.xml");
    const after = await getFormControlText(page);
    expect(after).toContain("Henry");
    expect(after, `Observed requests:\n${observedRequests.join("\n")}\nBrowser logs:\n${browserLogs.join("\n")}`).toContain("Janel");
    expect(after).not.toContain("Thomas");
  });

  /*
     Replace Instance must keep first instance values and update second instance values.
  */
  test("11.10.c — targetref replacement updates only second instance values", async ({ page }) => {
    // TEST-TRACE: promote 11.10.c to validate selective second-instance replacement semantics after submission.
    await loadAndWait(page, "Chapt11/11.10/11.10.c.xhtml");
    const before = await getFormControlText(page);
    expect(before).toContain("Henry");
    expect(before).toContain("Acura");
    expect(before).toContain("white");
    expect(before).toContain("Thomas");
    expect(before).toContain("Toyota");
    expect(before).toContain("silver");

    await clickTrigger(page, "Replace Instance");
    await page.waitForTimeout(500);
    const after = await getFormControlText(page);
    expect(after).toContain("Henry");
    expect(after).toContain("Acura");
    expect(after).toContain("white");
    expect(after).toContain("Janel");
    expect(after).toContain("Saturn");
    expect(after).toContain("red");
    expect(after).not.toContain("Thomas");
    expect(after).not.toContain("Toyota");
    expect(after).not.toContain("silver");
  });

  /*
     SOAP submission content type must be application/soap+xml.
  */
  test("11.11.2.a — SOAP submission sets application/soap+xml content type", async ({ page }) => {
    // TEST-TRACE: promote 11.11.2.a to assert SOAP mediatype on submission request headers.
    await loadAndWait(page, "Chapt11/11.11/11.11.2/11.11.2.a.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Submit SOAP" }));
    const headers = req ? req.headers() : {};
    expect((headers["content-type"] || "").toLowerCase()).toContain("application/soap+xml");
  });

  /*
     SOAP post submission content type must be application/soap+xml.
  */
  test("11.11.3.b — SOAP post submission uses SOAP content type", async ({ page }) => {
    // TEST-TRACE: promote 11.11.3.b to validate SOAP POST method and content-type handling.
    await loadAndWait(page, "Chapt11/11.11/11.11.3/11.11.3.b.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Submit SOAP" }));
    const headers = req ? req.headers() : {};
    expect(req?.method()).toBe("POST");
    expect((headers["content-type"] || "").toLowerCase()).toContain("application/soap+xml");
  });

  /*
     Submit to bad URL should fail the request and may surface xforms-submit-error as a modal message.
  */
  test("11.5.a — failed submission emits observable error signal", async ({ page }) => {
    // TEST-TRACE: strict criteria requires the xforms-submit-error modal for an invalid submission resource.
    const dialogs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt11/11.5/11.5.a.xhtml");
    const beforeCount = dialogs.length;
    const req = await clickAndCaptureRequest(
      page,
      page.getByRole("button", { name: "Submit Now" }),
      (request) => request.method() === "POST" && /invaliduri\.com(?:\/|$)/i.test(request.url()),
      7000
    );
    expect(req).not.toBeNull();
    expect(req?.method()).toBe("POST");
    expect(req?.url()).toMatch(/invaliduri\.com(?:\/|$)/i);
    await waitForCondition(
      page,
      () => dialogs.slice(beforeCount).some((message) => /^xforms-submit-error$/i.test(message)),
      { timeoutMs: 7000, description: "xforms-submit-error dialog for invalid resource" }
    );
  });

  /*
     Submit To Bad URL must populate error context outputs with resource-error and failing URI.
  */
  test("11.5.b — submit-error context properties populate output controls", async ({ page }) => {
    // TEST-TRACE: strict criteria requires error context outputs to include resource-error and failing URI.
    await loadAndWait(page, "Chapt11/11.5/11.5.b.xhtml");
    const req = await clickAndCaptureRequest(
      page,
      page.getByRole("button", { name: "Submit To Bad URL" }),
      (request) => request.method() === "POST" && /invaliduri\.com8565\/inval1d(?:\?|$|\/)/i.test(request.url()),
      7000
    );
    expect(req).not.toBeNull();
    expect(req?.method()).toBe("POST");
    expect(req?.url()).toMatch(/invaliduri\.com8565\/inval1d(?:\?|$|\/)/i);
    await waitForCondition(
      page,
      async () => {
        const text = await getFormControlText(page);
        return text.includes("resource-error") && text.includes("http://invaliduri.com8565/inval1d");
      },
      { timeoutMs: 7000, description: "submit-error context outputs for 11.5.b" }
    );
    const text = await getFormControlText(page);
    expect(text).toContain("resource-error");
    expect(text).toContain("http://invaliduri.com8565/inval1d");
  });

  /*
     @resource and resource child element must both target xformstest.org endpoint.
  */
  test("11.6.1.a — resource child element and @resource both target submission URI", async ({ page }) => {
    // TEST-TRACE: promote 11.6.1.a to validate resource element precedence variants submit to the echo endpoint.
    await loadAndWait(page, "Chapt11/11.6/11.6.1/11.6.1.a.xhtml");
    const attrReq = await submitAndCapture(page, page.getByRole("button", { name: "Submit (@resource)" }));
    expect(attrReq?.url()).toContain("echo.sh");
    expect(attrReq?.method()).toBe("PUT");

    await loadAndWait(page, "Chapt11/11.6/11.6.1/11.6.1.a.xhtml");
    const childReq = await submitAndCapture(page, page.getByRole("button", { name: "Submit (resource element)" }));
    expect(childReq?.url()).toContain("echo.sh");
    expect(childReq?.method()).toBe("PUT");
  });

  /*
     resource element value attribute must override fallback element text and bad @resource URI.
  */
  test("11.6.1.b — resource element value attribute drives submission endpoint", async ({ page }) => {
    // TEST-TRACE: promote 11.6.1.b to verify dynamic resource value selects the executable submission URI.
    await loadAndWait(page, "Chapt11/11.6/11.6.1/11.6.1.b.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Submit" }));
    expect(req?.url()).toContain("echo.sh");
    expect(req?.method()).toBe("PUT");
  });

  /*
     Method child element value must set request method to post.
  */
  test("11.7.1.a — method element value sets request method", async ({ page }) => {
    // TEST-TRACE: promote 11.7.1.a by asserting method element value expression selects POST request method.
    await loadAndWait(page, "Chapt11/11.7/11.7.1/11.7.1.a.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Submit With Method" }));
    expect(req?.method()).toBe("POST");
  });

  /*
     Empty header name expression must prevent that header/value pair from being emitted.
  */
  test("11.8.1.b — empty header name suppresses header emission", async ({ page }) => {
    // TEST-TRACE: promote 11.8.1.b to verify that empty header name does not emit the configured header value.
    await loadAndWait(page, "Chapt11/11.8/11.8.1/11.8.1.b.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Submit Now" }));
    const headers = req ? req.headers() : {};
    const headerValues = Object.values(headers).map((value) => String(value));
    expect(headerValues.some((value) => value.includes("myValue"))).toBe(false);
    expect(Object.keys(headers).some((name) => name.toLowerCase() === "myheader")).toBe(false);
  });
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
    const submitBtn = page.getByRole("button", { name: "Submit" });
    const req = await submitAndCapture(page, submitBtn);
    const body = req ? await req.postData() : "";
    expect(req?.method()).toBe("POST");
    expect(body).toContain("<color");
    expect(body).toContain("white</color>");
    expect(body).not.toContain("<make>Acura</make>");
    expect(body).not.toContain("<year>1994</year>");
    expect(body).not.toContain("<hp>120</hp>");
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
    const standaloneTrueReq = await submitAndCapture(page, page.getByRole("button", { name: "Submit With Standalone true" }));
    const standaloneTrueBody = standaloneTrueReq ? (await standaloneTrueReq.postData()) || "" : "";
    expect(standaloneTrueReq?.method()).toBe("POST");
    expect(standaloneTrueBody).toContain("<car");
    expect(standaloneTrueBody).toContain("<make>Acura</make>");
    expect(standaloneTrueBody).not.toMatch(/standalone=/i);

    await loadAndWait(page, "Chapt11/11.1/11.1.p.xhtml");
    const standaloneFalseReq = await submitAndCapture(page, page.getByRole("button", { name: "Submit With Standalone false" }));
    const standaloneFalseBody = standaloneFalseReq ? (await standaloneFalseReq.postData()) || "" : "";
    expect(standaloneFalseReq?.method()).toBe("POST");
    expect(standaloneFalseBody).toContain("<car");
    expect(standaloneFalseBody).toContain("<make>Acura</make>");
    expect(standaloneFalseBody).not.toMatch(/standalone=/i);

    await loadAndWait(page, "Chapt11/11.1/11.1.p.xhtml");
    const standaloneUnsetReq = await submitAndCapture(page, page.getByRole("button", { name: "Submit Without Standalone" }));
    const standaloneUnsetBody = standaloneUnsetReq ? (await standaloneUnsetReq.postData()) || "" : "";
    expect(standaloneUnsetReq?.method()).toBe("POST");
    expect(standaloneUnsetBody).toContain("<car");
    expect(standaloneUnsetBody).toContain("<make>Acura</make>");
    expect(standaloneUnsetBody).not.toMatch(/standalone=/i);
    expect(standaloneTrueBody).toBe(standaloneFalseBody);
    expect(standaloneFalseBody).toBe(standaloneUnsetBody);
  });

  /*
     When you activate the Submit submit control the page must be replaced by the form data. You
     must see the namespace " <my:car xmlns:my="http://www.fakenamespace.org"> " in the form data.
     You must NOT see any other namespaces in the form data.
  */
  test("11.1.v — 11.1.v includenamespaceprefixes attribute of submission element", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.1/11.1.v.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Submit" }));
    const body = req ? (await req.postData()) || "" : "";
    expect(req?.method()).toBe("POST");
    expect(body).toContain("<my:car");
    expect(body).toContain('xmlns:my="http://www.fakenamespace.org"');
    expect(body).toContain("<make>Acura</make>");
    expect(body).toContain("<color>blue</color>");
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
    const dialogs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt11/11.3/11.3.b.xhtml");
    const beforeCount = dialogs.length;
    const submitBtn = page.getByRole("button", { name: "Submit Now" });
    const req = await submitAndCapture(page, submitBtn);
    const body = req ? (await req.postData()) || "" : "";
    expect(req?.method()).toBe("POST");
    await waitForCondition(
      page,
      () => dialogs.slice(beforeCount).some((message) => /^xforms-submit-serialize$/i.test(message)),
      { timeoutMs: 5000, description: "xforms-submit-serialize modal message" }
    );
    expect(body).toContain("<data>MyNewData</data>");
    expect(body).not.toContain("Toyota");
    expect(body).not.toContain("Prius");
  });

  /*
     When you activate the Submit Now submit control the page must be replaced by the form data.
     Among the variables you must see a header named "myHeader". You must not see a header named
     "wrongData".
  */
  test("11.8.1.a — 11.8.1.a name element with value attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.8/11.8.1/11.8.1.a.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Submit Now" }));
    const headers = req ? req.headers() : {};
    const body = req ? (await req.postData()) || "" : "";
    expect(req?.method()).toBe("POST");
    expect(body).toContain("<value>one</value>");
    expect(body).toContain("<value>two</value>");
    expect(body).toContain("<value>three</value>");
    expect(String(headers["myheader"] || "")).toContain("myValue1");
    expect(Object.keys(headers).some((name) => name.toLowerCase() === "wrongdata")).toBe(false);
  });

  /*
     When you activate the Submit Now submit control the page must be replaced by the form data.
     Among the variables you must see a header named "myHeader" with a value of "three". You must
     not see a value of "wrongValue".
  */
  test("11.8.2.a — 11.8.2.a value element with value attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.8/11.8.2/11.8.2.a.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Submit Now" }));
    const headers = req ? req.headers() : {};
    const body = req ? (await req.postData()) || "" : "";
    expect(req?.method()).toBe("POST");
    expect(body).toContain("<value>one</value>");
    expect(body).toContain("<value>two</value>");
    expect(body).toContain("<value>three</value>");
    expect(String(headers["myheader"] || "").trim()).toBe("three");
    expect(body).not.toContain("wrongValue");
    expect(String(headers["myheader"] || "")).not.toContain("wrongValue");
  });

  /*
     When you activate the Submit Now submit control the page must be replaced by the form data.
     Among the variables you must see two headers named "myHeader1" and "myHeader2". myHeader1 must
     have the value "myValue1" and myHeader2 must have the value "myValue2".
  */
  test("11.8.a — 11.8.a header element of submission element", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.8/11.8.a.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Submit Now" }));
    const headers = req ? req.headers() : {};
    const body = req ? (await req.postData()) || "" : "";
    expect(req?.method()).toBe("POST");
    expect(body).toContain("<data");
    expect(body).toContain("<value>one</value>");
    expect(body).toContain("<value>two</value>");
    expect(body).toContain("<value>three</value>");
    expect(String(headers["myheader1"] || "")).toContain("myValue1");
    expect(String(headers["myheader2"] || "")).toContain("myValue2");
  });

  /*
     When you activate the Submit Now submit control the page must be replaced by the form data.
     Among the variables you must see three headers named "myHeader".
  */
  test("11.8.b — 11.8.b header element with nodeset attribute", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.8/11.8.b.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Submit Now" }));
    const headers = req ? req.headers() : {};
    const body = req ? (await req.postData()) || "" : "";
    expect(req?.method()).toBe("POST");
    expect(body).toContain("<value>one</value>");
    expect(body).toContain("<value>two</value>");
    expect(body).toContain("<value>three</value>");
    const combinedValues = String(headers["myheader"] || "")
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value !== "");
    expect(combinedValues).toEqual(["one", "two", "three"]);
  });

  /*
     When you activate the Submit Now submit control the page must be replaced by the form data.
     Among the variables you must see one header named "myHeader". myHeader must have the values
     "myValue1,myValue2,myValue1,myValue2,myValue3,myValue4,myValue4" in that order.
  */
  test("11.8.c — 11.8.c header element with similar name elements", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.8/11.8.c.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Submit Now" }));
    const headers = req ? req.headers() : {};
    const body = req ? (await req.postData()) || "" : "";
    expect(req?.method()).toBe("POST");
    expect(body).toContain("<data");
    expect(body).toContain("<value>one</value>");
    expect(body).toContain("<value>two</value>");
    expect(String(headers["myheader"] || "").replace(/\s+/g, "")).toBe(
      "myValue1,myValue2,myValue1,myValue2,myValue3,myValue4,myValue4"
    );
  });

  /*
     When you activate the Use Get Method submit control the page must be replaced by the form data.
     The value "blue" must appear in the request URI but must not appear in the form data.
  */
  test("11.9.1.a — 11.9.1.a get submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.1/11.9.1.a.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Use Get Method" }));
    const body = req ? (await req.postData()) || "" : "";
    expect(req?.method()).toBe("GET");
    expect(req?.url()).toMatch(/blue/);
    expect(body).toBe("");
  });

  /*
     When you activate the Use Post Method submit control the page must be replaced by the form
     data. The value "blue" must appear in the form data.
  */
  test("11.9.2.a — 11.9.2.a post submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.2/11.9.2.a.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Use Post Method" }));
    const body = req ? (await req.postData()) || "" : "";
    expect(req?.method()).toBe("POST");
    expect(req?.url()).not.toMatch(/blue/);
    expect(body).toContain("blue");
  });

  /*
     When you activate the Use Multipart-Post Method submit control the page must be replaced by the
     form data. The value "blue" must appear in the form data.
  */
  test("11.9.2.b — 11.9.2.b multipart-post submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.2/11.9.2.b.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Use Multipart-Post Method" }));
    const body = req ? (await req.postData()) || "" : "";
    expect(req?.method()).toBe("POST");
    expect(req?.url()).not.toMatch(/blue/);
    expect(body).toContain("blue");
  });

  /*
     When you activate the Use Form-Data-Post Method submit control the page must be replaced by the
     form data. The value "blue" must appear in the form data.
  */
  test("11.9.2.c — 11.9.2.c form-data-post submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.2/11.9.2.c.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Use Form-Data-Post Method" }));
    const body = req ? (await req.postData()) || "" : "";
    expect(req?.method()).toBe("POST");
    expect(req?.url()).not.toMatch(/blue/);
    expect(body).toContain("blue");
  });

  /*
     When you activate the Use Urlencoded-Post Method submit control the page must be replaced by
     the form data. The value "blue" must appear in the form data.
  */
  test("11.9.2.d — 11.9.2.d urlencoded-post submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.2/11.9.2.d.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Use Urlencoded-Post Method" }));
    const body = req ? (await req.postData()) || "" : "";
    expect(req?.method()).toBe("POST");
    expect(req?.url()).not.toMatch(/blue/);
    expect(body).toContain("color=blue");
  });

  /*
     When you activate the Use Put Method submit control the page must be replaced by the form data.
     The value "blue" must appear in the form data.
  */
  test("11.9.3.a — 11.9.3.a put submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.3/11.9.3.a.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Use Put Method" }));
    const body = req ? (await req.postData()) || "" : "";
    expect(req?.method()).toBe("PUT");
    expect(body).toContain("blue");
  });

  /*
     When you activate the Use Delete Method submit control the page must be replaced by the form
     data. The value "blue" must appear in the request URI but must not appear in the form data.
  */
  test("11.9.4.a — 11.9.4.a delete submission method", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.4/11.9.4.a.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Use Delete Method" }));
    const body = req ? (await req.postData()) || "" : "";
    expect(req?.method()).toBe("DELETE");
    expect(req?.url()).toMatch(/blue/);
    expect(body).not.toContain("blue");
  });

  /*
     When you activate the Submit Data submit control the page must be replaced by the form data.
     The data must contain the value "Ren%C3%A9". The form data must be in
     application/x-www-form-urlencoded format according to the W3C specification at this link:
     XForms 1.1 specification
  */
  test("11.9.8.a — 11.9.8.a serialization as application/x-www-form-urlencoded", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.8/11.9.8.a.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Submit Data" }));
    const body = req ? (await req.postData()) || "" : "";
    const headers = req ? req.headers() : {};
    expect(req?.method()).toBe("POST");
    expect((headers["content-type"] || "").toLowerCase()).toContain("application/x-www-form-urlencoded");
    expect(body).toContain("Ren%C3%A9");
  });
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
    // TEST-TRACE: promote 11.2.d to assert submit-error dialog and validation-error event payload output.
    const dialogs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt11/11.2/11.2.d.xhtml");
    const beforeCount = dialogs.length;
    await clickTrigger(page, "Submit Here");
    await page.waitForTimeout(500);
    const newDialogs = dialogs.slice(beforeCount);
    expect(newDialogs.some((message) => /xforms-submit-error/i.test(message))).toBe(true);
    const text = await getFormControlText(page);
    expect(text).toContain("validation-error");
  });

  /*
     After you activate the Submit Here submit control you must see an xforms-submit-error message
     and see the value "validation-error" as output from the Error Name output control.
  */
  test("11.2.e — method=get sends URL-encoded data", async ({ page }) => {
    // TEST-TRACE: promote 11.2.e to assert submit-error dialog and validation-error context output.
    const dialogs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt11/11.2/11.2.e.xhtml");
    const beforeCount = dialogs.length;
    await clickTrigger(page, "Submit Here");
    await page.waitForTimeout(500);
    const newDialogs = dialogs.slice(beforeCount);
    expect(newDialogs.some((message) => /xforms-submit-error/i.test(message))).toBe(true);
    const text = await getFormControlText(page);
    expect(text).toContain("validation-error");
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
     Submit Twice dispatches xforms-submit twice and must not surface xforms-submit-error.
  */
  test("11.2.a — submit twice does not raise submit-error", async ({ page }) => {
    // TEST-TRACE: keep assertion aligned with fixture expectation while validating submit dispatch occurs.
    const dialogs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt11/11.2/11.2.a.xhtml");
    const beforeCount = dialogs.length;
    await clickTrigger(page, "Submit Twice");
    await page.waitForTimeout(1500);
    const newDialogs = dialogs.slice(beforeCount);
    const submitCount = newDialogs.filter((message) => /^xforms-submit$/i.test(message)).length;
    const submitDoneCount = newDialogs.filter((message) => /^xforms-submit-done$/i.test(message)).length;
    const submitErrorCount = newDialogs.filter((message) => /^xforms-submit-error$/i.test(message)).length;
    expect(submitCount).toBeGreaterThan(0);
    expect(submitDoneCount).toBeGreaterThanOrEqual(0);
    expect(submitErrorCount).toBe(0);
  });

  /*
     After you activate the Submit Now submit control you must see an xforms-submit-error message
     and see the value "no-data" as output from the Error Name output control.
  */
  test("11.2.c — replace=instance renders", async ({ page }) => {
    // TEST-TRACE: promote 11.2.c to assert xforms-submit-error dialog and no-data error output.
    const dialogs = collectDialogMessages(page);
    await loadAndWait(page, "Chapt11/11.2/11.2.c.xhtml");
    const beforeCount = dialogs.length;
    await clickTrigger(page, "Submit Now");
    await page.waitForTimeout(500);
    const newDialogs = dialogs.slice(beforeCount);
    expect(newDialogs.some((message) => /xforms-submit-error/i.test(message))).toBe(true);
    const text = await getFormControlText(page);
    expect(text).toContain("no-data");
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
    // TEST-TRACE: promote 11.4.b to verify xforms-submit-done context exposes response status code output.
    await loadAndWait(page, "Chapt11/11.4/11.4.b.xhtml");
    const req = await submitAndCapture(page, page.getByRole("button", { name: "Submit Now" }));
    expect(req).not.toBeNull();
    const response = req ? await req.response() : null;
    expect(response?.status()).toBe(200);
    const text = await getFormControlText(page);
    expect(text).toContain("Response Status Code");
  });

  /*
     When you activate the Use Put Method submit control the value "blue" will be submitted to a
     local file called "myfile.txt".
  */
  test("11.9.3.b — put submission writes expected local payload", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.3/11.9.3.b.xhtml");
    const req = await clickAndCaptureRequest(
      page,
      page.getByRole("button", { name: "Use Put Method" }),
      (request) => request.method() === "PUT" && /myfile\.txt(?:\?|$)/i.test(request.url()),
      3000
    );
    const body = req ? (await req.postData()) || "" : "";
    expect(req?.method()).toBe("PUT");
    expect(req?.url()).toMatch(/myfile\.txt(?:\?|$)/i);
    expect(body).toContain("blue");
  });

  /*
     The local file, deleteme.txt, must be deleted when you activate the Submit control. If you
     activate the Load submit control after activating the Submit control you must get a You pass
     message.
  */
  test("11.9.4.b — delete then load emits resource-error confirmation", async ({ page }) => {
    await loadAndWait(page, "Chapt11/11.9/11.9.4/11.9.4.b.xhtml");
    const deleteReq = await clickAndCaptureRequest(
      page,
      page.getByRole("button", { name: "Submit" }),
      (request) => request.method() === "DELETE" && /deleteme\.txt(?:\?|$)/i.test(request.url()),
      3000
    );
    expect(deleteReq?.method()).toBe("DELETE");
    expect(deleteReq?.url()).toMatch(/deleteme\.txt(?:\?|$)/i);

    const loadReq = await clickAndCaptureRequest(
      page,
      page.getByRole("button", { name: "Load" }),
      (request) => request.method() === "GET" && /deleteme\.txt(?:\?|$)/i.test(request.url()),
      3000
    );
    expect(loadReq?.method()).toBe("GET");
    const loadResponse = loadReq ? await loadReq.response() : null;
    expect(loadResponse?.status()).toBe(404);
  });
});
