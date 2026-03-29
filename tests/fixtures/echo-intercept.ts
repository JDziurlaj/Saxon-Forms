import { test as base, expect } from "@playwright/test";

/**
 * Extends Playwright's base `test` with an auto-fixture that intercepts
 * all requests to the external echo.sh endpoint used by the W3C XForms
 * test suite.  The intercepted requests are fulfilled locally, echoing
 * back the POST body — this avoids CORS issues without modifying the
 * W3C test files.
 */
export const test = base.extend<{}>({
    page: async ({ page }, use) => {
        await page.route(/echo\.sh/, async (route) => {
            const body = route.request().postData() || "";
            await route.fulfill({
                status: 200,
                contentType: "text/plain",
                body,
            });
        });
        await use(page);
    },
});

export { expect };
