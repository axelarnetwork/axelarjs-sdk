"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const libs_1 = require("../../libs");
const __1 = require("..");
const mock = {
    loadChains: __1.loadChains,
};
describe("loadChains()", () => {
    beforeEach(() => {
        vitest.clearAllMocks();
        vitest.spyOn(mock, "loadChains");
    });
    describe("when loadChains is called with known env, but not mainnet", () => {
        beforeEach(() => {
            mock.loadChains({
                environment: libs_1.Environment.TESTNET,
            });
        });
        test("then it should call loadChains", () => {
            expect(mock.loadChains).toHaveBeenCalledWith({ environment: libs_1.Environment.TESTNET });
        });
        test("then it should return assets", () => {
            expect(mock.loadChains).toHaveReturned();
        });
    });
    describe("when loadChains is called with mainnet", () => {
        beforeEach(() => {
            mock.loadChains({
                environment: libs_1.Environment.MAINNET,
            });
        });
        test("then it should call loadChains", () => {
            expect(mock.loadChains).toHaveBeenCalledWith({ environment: "mainnet" });
        });
        test("then it should return assets", () => {
            expect(mock.loadChains).toHaveReturned();
        });
    });
});
//# sourceMappingURL=loadChains.spec.js.map