import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 300000,
    environment: "node",
    root: "src",
    globals: true,
  },
});

// {
//     "moduleFileExtensions": ["js", "json", "ts"],
//     "rootDir": "src",
//     "testEnvironment": "node",
//     "testTimeout": 300000,
//     "testRegex": ".spec.ts$",
//     "transform": {
//         "^.+\\.(t|j)s$": "ts-jest"
//     }
// }
