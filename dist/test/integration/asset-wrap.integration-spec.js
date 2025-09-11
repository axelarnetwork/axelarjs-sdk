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
const EvmChain_1 = require("../../src/constants/EvmChain");
const src_1 = require("../../src");
describe("Asset Wrap", () => {
    const axelarAssetTransfer = new src_1.AxelarAssetTransfer({
        environment: src_1.Environment.TESTNET,
    });
    test("bootstrap", () => {
        expect(axelarAssetTransfer).toBeDefined();
    });
    describe("getDepositAddressForNativeWrap()", () => {
        let result;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            result = yield axelarAssetTransfer.getDepositAddressForNativeWrap("ethereum-2", EvmChain_1.EvmChain.MOONBEAM, "0xa411977dd24F1547065C6630E468a43275cB4d7f", "");
        }));
        it("should generate unique deposit addresses", () => {
            console.log({ result });
        });
    });
}, {
    timeout: 20000,
});
//# sourceMappingURL=asset-wrap.integration-spec.js.map