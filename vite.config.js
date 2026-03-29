import { defineConfig } from "vite";

export default defineConfig({
  root: "test-app",
  publicDir: "../public-test",
  server: {
    port: 5174,
    cors: true,
  },
});
