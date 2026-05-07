export type SubmissionXPathEvaluationResult = {
  parseError: string;
  xpathError: string;
  values: Record<string, string>;
};

export async function evaluateSubmissionXPath(
  page: any,
  xmlBody: string,
  expressions: Record<string, string>
): Promise<SubmissionXPathEvaluationResult> {
  // TEST-TRACE: shared SaxonJS XPath payload analyzer for any Playwright spec; helps tests/w3c/ch11.spec.ts and future suites.
  return page.evaluate(
    ({ payload, xpathExpressions }) => {
      const parsed = new DOMParser().parseFromString(payload, "application/xml");
      const parseError = parsed.querySelector("parsererror");
      if (parseError) {
        return {
          parseError: parseError.textContent || "XML parse error",
          xpathError: "",
          values: {} as Record<string, string>,
        };
      }
      try {
        const evaluateXPath = (expression: string) =>
          (window as any).SaxonJS.XPath.evaluate(expression, parsed);
        const values: Record<string, string> = {};
        for (const [key, expression] of Object.entries(xpathExpressions)) {
          values[key] = String(evaluateXPath(String(expression)));
        }
        return {
          parseError: "",
          xpathError: "",
          values,
        };
      } catch (error) {
        return {
          parseError: "",
          xpathError: error instanceof Error ? error.message : String(error),
          values: {} as Record<string, string>,
        };
      }
    },
    { payload: xmlBody, xpathExpressions: expressions }
  );
}
