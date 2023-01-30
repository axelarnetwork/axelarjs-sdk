import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 300000,
    environment: "node",
    root: "test/e2e",
    include: ["**/*.e2e-spec.ts"],
    globals: true,
  },
});
