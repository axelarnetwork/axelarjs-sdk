"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const libs_1 = require("../../libs");
const __1 = require("..");
const mock = {
    loadAssets: __1.loadAssets,
};
describe("loadAssets()", () => {
    beforeEach(() => {
        vitest.clearAllMocks();
        vitest.spyOn(mock, "loadAssets");
    });
    describe("when loadAssets is called with known env, but not mainnet", () => {
        beforeEach(() => {
            mock.loadAssets({
                environment: libs_1.Environment.TESTNET,
            });
        });
        test("then it should call loadAssets", () => {
            expect(mock.loadAssets).toHaveBeenCalledWith({ environment: libs_1.Environment.TESTNET });
        });
        // test("then it should return assets", () => {
        //   expect(mock.loadAssets).toHaveReturnedWith(Object.values(testnet));
        // });
    });
    describe("when loadAssets is called with mainnet", () => {
        beforeEach(() => {
            mock.loadAssets({
                environment: libs_1.Environment.MAINNET,
            });
        });
        test("then it should call loadAssets", () => {
            expect(mock.loadAssets).toHaveBeenCalledWith({ environment: libs_1.Environment.MAINNET });
        });
        // test("then it should return assets", () => {
        //   expect(mock.loadAssets).toHaveReturnedWith(Object.values(mainnet));
        // });
    });
});
//# sourceMappingURL=loadAssets.spec.js.map