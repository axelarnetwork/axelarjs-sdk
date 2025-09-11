"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../../src");
const sdk = new src_1.AxelarAssetTransfer({
    environment: src_1.Environment.TESTNET,
});
const evmAddress = "0xA57ADCE1d2fE72949E4308867D894CD7E7DE0ef2";
describe("Wrap Native Asset", () => {
    describe("getDepositAddressForNativeWrap()", () => {
        let depositAddress;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            depositAddress = yield sdk.getDepositAddressForNativeWrap(src_1.CHAINS.TESTNET.AVALANCHE, src_1.CHAINS.TESTNET.SEPOLIA, evmAddress);
        }));
        describe("when called", () => {
            it("should return deposit address", () => {
                expect(depositAddress === null || depositAddress === void 0 ? void 0 : depositAddress.length).toBeGreaterThan(0);
            });
        });
    });
}, {
    timeout: 20000,
});
//# sourceMappingURL=wrap-native-asset.integration-spec.js.map