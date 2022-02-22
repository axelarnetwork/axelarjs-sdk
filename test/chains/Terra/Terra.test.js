"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Terra_1 = __importDefault(require("../../../src/chains/Terra"));
var terraChain;
var asset;
beforeEach(function () {
    terraChain = new Terra_1.default();
    asset = { assetAddress: "" };
});
test("destination address validation", function () {
    var addressMap = {
        validAddr44: "terra1d5umjr4j0k8c8qtd500mzw2f99kptqqxw2rzph",
        invalidAddr44: "terra1d5umjr4j0k8c8qtd500mzw2f99kptqqxw2rzpd",
    };
    asset.assetAddress = addressMap.validAddr44;
    expect(terraChain.validateAddress(asset)).toBe(true);
    asset.assetAddress = addressMap.invalidAddr44;
    expect(terraChain.validateAddress(asset)).toBe(false);
});
//# sourceMappingURL=Terra.test.js.map