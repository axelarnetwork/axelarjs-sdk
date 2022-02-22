"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Axelar_1 = __importDefault(require("../../../src/chains/Axelar"));
var axelarChain;
var asset;
beforeEach(function () {
    axelarChain = new Axelar_1.default();
    asset = { assetAddress: "" };
});
test("destination address validation", function () {
    var addressMap = {
        validAddr45: "axelar1cupayrv3fzgzn3mjg38d6qxqey64rw9fmkkp5f",
        invalidAddr45: "axelar1cupayrv3fzgzn3mjg38d6qxqey64rw9fmkkp5d",
        validAddr65: "axelar1386l7f7uyjejklmnzvsnkhffus625pj7eve85gx6z7696d7ujlss3ras55",
        invalidAddr65: "axelar1386l7f7uyjejklmnzvsnkhffus625pj7eve85gx6z7696d7ujlss3ras54",
    };
    asset.assetAddress = addressMap.validAddr45;
    expect(axelarChain.validateAddress(asset)).toBe(true);
    asset.assetAddress = addressMap.invalidAddr45;
    expect(axelarChain.validateAddress(asset)).toBe(false);
    asset.assetAddress = addressMap.validAddr65;
    expect(axelarChain.validateAddress(asset)).toBe(true);
    asset.assetAddress = addressMap.invalidAddr65;
    expect(axelarChain.validateAddress(asset)).toBe(false);
});
//# sourceMappingURL=Axelar.test.js.map