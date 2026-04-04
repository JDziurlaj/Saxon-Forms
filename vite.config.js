import { defineConfig } from "vite";
const configuredPort = process.env.VITE_PORT || process.env.PLAYWRIGHT_TEST_PORT;
const serverPort = Number(configuredPort || 5174);

export default defineConfig({
  root: "test-app",
  publicDir: "../public-test",
  server: {
    port: serverPort,
    strictPort: !!configuredPort,
    cors: true,
  },
});
