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
const AxelarSigningClient_1 = require("../AxelarSigningClient");
const types_1 = require("../types");
const tx_1 = require("@axelar-network/axelarjs-types/axelar/axelarnet/v1beta1/tx");
const tx_2 = require("@axelar-network/axelarjs-types/axelar/evm/v1beta1/tx");
const utils_1 = require("@cosmjs/stargate/build/queryclient/utils");
const const_1 = require("../AxelarSigningClient/const");
const ethers_1 = require("ethers");
describe.skip("AxelarSigningClient", () => {
    // throwaway testnet account only, address should be axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc
    const mnemonic = "grape kitchen depend dolphin elegant field hair ice bracket shell hover cover";
    const config = {
        environment: types_1.Environment.TESTNET,
        cosmosBasedWalletDetails: { mnemonic },
        options: {},
    };
    beforeEach(() => {
        vitest.clearAllMocks();
    });
    describe("axelarnet getLinkAddress", () => {
        const address = "axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc";
        const linkPayload = [
            {
                typeUrl: `/${tx_1.protobufPackage}.LinkRequest`,
                value: tx_1.LinkRequest.fromPartial({
                    sender: address,
                    recipientAddr: "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
                    recipientChain: "avalanche",
                    asset: "wavax-wei",
                }),
            },
        ];
        test("It should get a link address", () => __awaiter(void 0, void 0, void 0, function* () {
            const api = yield AxelarSigningClient_1.AxelarSigningClient.initOrGetAxelarSigningClient(config);
            const memo = `Generated from Javascript for ${address}!`;
            const result = yield api.signAndBroadcast(address, linkPayload, const_1.STANDARD_FEE, memo);
            console.log("results", result);
            expect(result).toBeDefined();
            expect(result.transactionHash).toBeDefined();
        }), 60000);
        test("It should be able to sign and broadcast separately", () => __awaiter(void 0, void 0, void 0, function* () {
            const api = yield AxelarSigningClient_1.AxelarSigningClient.initOrGetAxelarSigningClient(config);
            const memo = `Generated from JS for ${address}, signed and broadcasted separately!`;
            const signedTxBytes = yield api.signAndGetTxBytes(linkPayload, const_1.STANDARD_FEE, memo);
            const result = yield api.broadcastTx(signedTxBytes);
            expect(result).toBeDefined();
            expect(result.transactionHash).toBeDefined();
        }), 60000);
    });
    describe("confirm axelarnet deposit", () => {
        test("It should confirm axelarnet deposit tx", () => __awaiter(void 0, void 0, void 0, function* () {
            const api = yield AxelarSigningClient_1.AxelarSigningClient.initOrGetAxelarSigningClient(config);
            const address = "axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc";
            const _depositAddress = "axelar192mp2cv2s0hayv6fwgjl64zs72hl97zcxjwcg6g8nkdkjxq89dps0yt6gc";
            const denom = "wavax-wei";
            const confirmDepositPayload = [
                {
                    typeUrl: `/${tx_1.protobufPackage}.ConfirmDepositRequest`,
                    value: tx_1.ConfirmDepositRequest.fromPartial({
                        sender: address,
                        depositAddress: Buffer.from((0, utils_1.toAccAddress)(_depositAddress)),
                        denom,
                    }),
                },
            ];
            const memo = `Generated from Javascript for ${address}!`;
            const result = yield api.signThenBroadcast(confirmDepositPayload, const_1.STANDARD_FEE, memo);
            expect(result).toBeDefined();
            expect(result.transactionHash).toBeDefined();
        }), 60000);
    });
    describe("evm getLinkAddress", () => {
        const address = "axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc";
        const linkPayload = [
            {
                typeUrl: `/${tx_2.protobufPackage}.LinkRequest`,
                value: tx_2.LinkRequest.fromPartial({
                    sender: address,
                    recipientAddr: "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
                    recipientChain: "avalanche",
                    asset: "wavax-wei",
                    chain: "polygon",
                }),
            },
        ];
        test("It should get a link address", () => __awaiter(void 0, void 0, void 0, function* () {
            const api = yield AxelarSigningClient_1.AxelarSigningClient.initOrGetAxelarSigningClient(config);
            const memo = `Generated from Javascript for ${address}!`;
            const result = yield api.signAndBroadcast(address, linkPayload, const_1.STANDARD_FEE, memo);
            expect(result).toBeDefined();
            expect(result.transactionHash).toBeDefined();
        }), 60000);
    });
    describe("confirm evm deposit", () => {
        test("It should confirm evm deposit tx", () => __awaiter(void 0, void 0, void 0, function* () {
            const api = yield AxelarSigningClient_1.AxelarSigningClient.initOrGetAxelarSigningClient(config);
            const address = "axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc";
            const burnerAddress = "0xBfEf22637071550b4860027c8A4036a22fD1967e";
            const chain = "avalanche";
            const txHash = "0xf634de54ca14ed9aa8e02f42493e41a773cbd08b784de0208a46af5ad650da2b";
            const confirmDepositPayload = [
                {
                    typeUrl: `/${tx_2.protobufPackage}.ConfirmDepositRequest`,
                    value: tx_2.ConfirmDepositRequest.fromPartial({
                        sender: address,
                        chain,
                        txId: Buffer.from(ethers_1.utils.arrayify(txHash)),
                        burnerAddress: Buffer.from(ethers_1.utils.arrayify(burnerAddress)),
                    }),
                },
            ];
            const memo = `Generated from Javascript for ${address}!`;
            const result = yield api.signThenBroadcast(confirmDepositPayload, const_1.STANDARD_FEE, memo);
            expect(result).toBeDefined();
            expect(result.transactionHash).toBeDefined();
        }), 60000);
    });
    describe("execute pending transfers", () => {
        test("It should execute pending transfers", () => __awaiter(void 0, void 0, void 0, function* () {
            const api = yield AxelarSigningClient_1.AxelarSigningClient.initOrGetAxelarSigningClient(config);
            const address = "axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc";
            const executePendingTransfersPayload = [
                {
                    typeUrl: `/${tx_1.protobufPackage}.ExecutePendingTransfersRequest`,
                    value: tx_1.ExecutePendingTransfersRequest.fromPartial({
                        sender: address,
                    }),
                },
            ];
            const memo = `Generated from Javascript for ${address}!`;
            const result = yield api.signThenBroadcast(executePendingTransfersPayload, const_1.STANDARD_FEE, memo);
            expect(result).toBeDefined();
            expect(result.transactionHash).toBeDefined();
        }), 60000);
    });
});
//# sourceMappingURL=AxelarSigningClient.spec.js.map