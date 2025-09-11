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
describe("[TESTNET] - Deposit Address E2E", () => {
    let transferSdk;
    beforeAll(() => {
        transferSdk = new src_1.AxelarAssetTransfer({
            environment: src_1.Environment.TESTNET,
        });
    });
    it("init", () => {
        expect(transferSdk).toBeDefined();
    });
    describe("AxelarAssetTransfer.getDepositAddress()", () => {
        describe("evm -> evm", () => {
            describe("moonbeam -> avalanche", () => {
                let address;
                beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                    address = yield transferSdk.getDepositAddress("moonbeam", "avalanche", "0xA57ADCE1d2fE72949E4308867D894CD7E7DE0ef2", "uausdc");
                }));
                it("should return deposit address", () => {
                    expect(typeof address).toBe("string");
                    expect(address.length).toBeGreaterThan(0);
                });
            });
            describe("avalanche -> moonbeam", () => {
                let address;
                beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                    address = yield transferSdk.getDepositAddress("avalanche", "moonbeam", "0xA57ADCE1d2fE72949E4308867D894CD7E7DE0ef2", "uausdc");
                }));
                it("should return deposit address", () => {
                    expect(typeof address).toBe("string");
                    expect(address.length).toBeGreaterThan(0);
                });
            });
        });
    });
}, {
    timeout: 60000,
});
//# sourceMappingURL=deposit-address.e2e-spec.js.map