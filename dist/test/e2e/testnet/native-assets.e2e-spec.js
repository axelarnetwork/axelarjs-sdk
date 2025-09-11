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
describe("AxelarAssetTransfer", () => {
    let sdk;
    beforeAll(() => {
        sdk = new src_1.AxelarAssetTransfer({
            environment: src_1.Environment.TESTNET,
        });
    });
    describe("getDepositAddressForNativeWrap()", () => {
        let address;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            address = yield sdk.getDepositAddressForNativeWrap("avalanche", "ethereum-2", "0xA57ADCE1d2fE72949E4308867D894CD7E7DE0ef2");
        }));
        it("should get native deposit address", () => {
            expect(address).toBeTruthy();
            console.log({
                address,
            });
        });
    });
    describe("getDepositAddressForNativeUnwrap()", () => {
        let depositAddress;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield sdk.getDepositAddressForNativeUnwrap("moonbeam", "avalanche", "0xA57ADCE1d2fE72949E4308867D894CD7E7DE0ef2");
            depositAddress = result;
        }));
        it("should get native deposit address", () => {
            expect(depositAddress).toBeTruthy();
        });
    });
}, {
    timeout: 20000,
});
//# sourceMappingURL=native-assets.e2e-spec.js.map