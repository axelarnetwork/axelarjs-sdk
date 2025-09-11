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
    environment: src_1.Environment.MAINNET,
});
const cosmosAddress = "terra1u8xlzsfuxe0lv6u2ws2zymrnnlc9pmyynu7pym";
const evmAsset = "uusdc";
describe("EVM - COSMOS", () => {
    describe("getDepositAddress()", () => {
        let depositAddress;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            depositAddress = yield sdk.getDepositAddress(src_1.CHAINS.MAINNET.AVALANCHE, src_1.CHAINS.MAINNET.TERRA, cosmosAddress, evmAsset);
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
//# sourceMappingURL=evm-cosmos.integration-spec.js.map