import { defineConfig, devices } from "@playwright/test";
const playwrightHost = process.env.PLAYWRIGHT_TEST_HOST || "127.0.0.1";
const playwrightPort = Number(process.env.PLAYWRIGHT_TEST_PORT || 5174);
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL || `http://${playwrightHost}:${playwrightPort}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "dot",
  use: {
    baseURL,
    trace: "on-first-retry",
    bypassCSP: true,
    launchOptions: {
      args: ["--disable-web-security"],
    }
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    env: {
      ...process.env,
      PLAYWRIGHT_TEST_HOST: playwrightHost,
      PLAYWRIGHT_TEST_PORT: String(playwrightPort),
      VITE_PORT: String(playwrightPort)
    },
    reuseExistingServer: !process.env.CI,
  },
});
