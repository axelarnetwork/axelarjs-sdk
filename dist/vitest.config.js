"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    test: {
        testTimeout: 300000,
        environment: "node",
        root: "src",
        globals: true,
    },
});
//# sourceMappingURL=vitest.config.js.map