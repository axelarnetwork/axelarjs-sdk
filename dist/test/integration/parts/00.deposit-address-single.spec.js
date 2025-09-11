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
/**
 * This test helps to check that a unique deposit address is generated for parallel requests
 * if the source chain is different but that the destination chain is the same
 */
describe("Single Deposit Address Generation", () => {
    const axelarAssetTransfer = new src_1.AxelarAssetTransfer({
        environment: src_1.Environment.TESTNET,
    });
    test("bootstrap", () => {
        expect(axelarAssetTransfer).toBeDefined();
    });
    describe("deposit address generation", () => {
        let result;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            result = yield axelarAssetTransfer.getDepositAddress("avalanche", "moonbeam", "0xB8Cd93C83A974649D76B1c19f311f639e62272BC", "uausdc");
        }));
        it("should generate unique deposit addresses", () => {
            expect(typeof result).toBe("string");
            expect(result.length).toBeGreaterThan(1);
        });
    });
}, {
    timeout: 20000,
});
//# sourceMappingURL=00.deposit-address-single.spec.js.map