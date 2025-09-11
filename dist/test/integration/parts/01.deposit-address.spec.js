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
describe("Parallel Deposit Address Generation", () => {
    let axelarAssetTransferTestnet;
    let axelarAssetTransferMainnet;
    beforeAll(() => {
        axelarAssetTransferTestnet = new src_1.AxelarAssetTransfer({
            environment: src_1.Environment.TESTNET,
        });
        axelarAssetTransferMainnet = new src_1.AxelarAssetTransfer({
            environment: src_1.Environment.MAINNET,
        });
    });
    test("bootstrap", () => {
        expect(axelarAssetTransferTestnet).toBeDefined();
    });
    describe("deposit address generation", () => {
        it("should generate unique deposit addresses", () => __awaiter(void 0, void 0, void 0, function* () {
            const results = yield Promise.all([
                axelarAssetTransferTestnet.getDepositAddress(src_1.CHAINS.TESTNET.AVALANCHE, src_1.CHAINS.TESTNET.MOONBEAM, "0xB8Cd93C83A974649D76B1c19f311f639e62272BC", "uausdc"),
                axelarAssetTransferTestnet.getDepositAddress(src_1.CHAINS.TESTNET.FANTOM, src_1.CHAINS.TESTNET.MOONBEAM, "0xB8Cd93C83A974649D76B1c19f311f639e62272BC", "uausdc"),
                axelarAssetTransferTestnet.getDepositAddress(src_1.CHAINS.TESTNET.OSMOSIS, src_1.CHAINS.TESTNET.MOONBEAM, "0xB8Cd93C83A974649D76B1c19f311f639e62272BC", "uausdc"),
                axelarAssetTransferTestnet.getDepositAddress(src_1.CHAINS.TESTNET.SEPOLIA, src_1.CHAINS.TESTNET.MOONBEAM, "0xB8Cd93C83A974649D76B1c19f311f639e62272BC", "uausdc"),
                axelarAssetTransferTestnet.getDepositAddress(src_1.CHAINS.TESTNET.MOONBEAM, src_1.CHAINS.TESTNET.OSMOSIS, "osmo1x3z2vepjd7fhe30epncxjrk0lehq7xdqe8ltsn", "uausdc"),
            ]);
            expect(results.length).toBe(5);
            expect(results[0]).not.toEqual(results[1]);
        }));
        it.skip("should be able to generate deposit addresses when the source chain is cosmos-based chain", () => __awaiter(void 0, void 0, void 0, function* () {
            const results = yield Promise.all([
                axelarAssetTransferMainnet.getDepositAddress(src_1.CHAINS.TESTNET.TERRA, src_1.CHAINS.TESTNET.MOONBEAM, "0xB8Cd93C83A974649D76B1c19f311f639e62272BC", "uusdc"),
                axelarAssetTransferMainnet.getDepositAddress(src_1.CHAINS.TESTNET.AXELAR, src_1.CHAINS.TESTNET.OSMOSIS, "osmo1x3z2vepjd7fhe30epncxjrk0lehq7xdqe8ltsn", "uusdc"),
                axelarAssetTransferMainnet.getDepositAddress(src_1.CHAINS.TESTNET.OSMOSIS, src_1.CHAINS.TESTNET.AXELAR, "axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc", "uusdc"),
            ]);
            console.log(results);
            expect(results.length).toBe(3);
        }));
    });
}, {
    timeout: 30000,
});
//# sourceMappingURL=01.deposit-address.spec.js.map