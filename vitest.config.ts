import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 300000,
    environment: "node",
    root: "src",
    setupFiles: ["./test/setup.ts"],
    globals: true,
  },
});
