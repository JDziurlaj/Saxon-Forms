import { defineConfig, devices } from "@playwright/test";
const playwrightHost = process.env.PLAYWRIGHT_TEST_HOST || "127.0.0.1";
const playwrightPort = Number(process.env.PLAYWRIGHT_TEST_PORT || 5174);
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL || `http://${playwrightHost}:${playwrightPort}`;
const includeDiagnostics = process.env.PLAYWRIGHT_INCLUDE_DIAGNOSTICS === "1";

export default defineConfig({
  testDir: "./tests",
  testIgnore: includeDiagnostics ? [] : ["**/diagnostics/**"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["dot"],
    ["html", { open: "never" }]
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
    bypassCSP: true,
    launchOptions: {
      args: ["--disable-web-security"],
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npx http-server test-app -p ${playwrightPort} -c-1`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
