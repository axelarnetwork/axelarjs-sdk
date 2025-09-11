"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../../src");
vitest.setConfig({
    testTimeout: 20000,
});
describe("Validations - Testnet", () => {
    const environment = src_1.Environment.TESTNET;
    describe("validateChainIdentifiers()", () => {
        describe("when called", () => {
            it("should validate chain identifiers", () => {
                expect((0, src_1.throwIfInvalidChainIds)([src_1.CHAINS.TESTNET.AVALANCHE, src_1.CHAINS.TESTNET.SEPOLIA], environment)).resolves.toBeUndefined();
            });
        });
        describe("when wrong identifier", () => {
            it("should throw error", () => {
                expect((0, src_1.throwIfInvalidChainIds)([src_1.CHAINS.TESTNET.AVALANCHE, "ethereum"], environment)).rejects.toThrow("Invalid chain identifier for ethereum. Did you mean ethereum-2?");
            });
            it("should throw error", () => {
                expect((0, src_1.throwIfInvalidChainIds)(["osmosis", src_1.CHAINS.TESTNET.AVALANCHE], environment)).rejects.toThrow("Invalid chain identifier for osmosis. Did you mean osmosis-4?");
            });
            it("should throw error", () => {
                expect((0, src_1.throwIfInvalidChainIds)([src_1.CHAINS.TESTNET.OSMOSIS, "terra"], environment)).rejects.toThrow("Invalid chain identifier for terra. Did you mean terra-3?");
            });
        });
    });
});
describe("Validations - Mainnet", () => {
    const environment = src_1.Environment.MAINNET;
    describe("validateChainIdentifiers()", () => {
        describe("when called", () => {
            it("should validate chain identifiers", () => {
                expect((0, src_1.throwIfInvalidChainIds)([src_1.CHAINS.MAINNET.AVALANCHE, src_1.CHAINS.MAINNET.ETHEREUM], environment)).resolves.toBeUndefined();
            });
        });
        describe("when wrong identifier", () => {
            it("should throw error", () => {
                expect((0, src_1.throwIfInvalidChainIds)([src_1.CHAINS.MAINNET.AVALANCHE, "ethereum-2"], environment)).rejects.toThrow("Invalid chain identifier for ethereum-2. Did you mean ethereum?");
            });
            it("should throw error", () => {
                expect((0, src_1.throwIfInvalidChainIds)([src_1.CHAINS.MAINNET.OSMOSIS, "terra"], environment)).rejects.toThrow("Invalid chain identifier for terra. Did you mean terra-2?");
            });
        });
    });
});
//# sourceMappingURL=validations.integration-spec.js.map