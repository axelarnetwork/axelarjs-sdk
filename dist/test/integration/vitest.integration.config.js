"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    test: {
        testTimeout: 300000,
        environment: "node",
        root: "test/integration",
        globals: true,
    },
});
//# sourceMappingURL=vitest.integration.config.js.map