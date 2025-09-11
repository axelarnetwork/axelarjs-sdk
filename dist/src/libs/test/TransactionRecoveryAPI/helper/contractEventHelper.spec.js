"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../../../TransactionRecoveryApi/helpers");
describe("contractEventHelper", () => {
    describe("validateContractCall", () => {
        const gatewayEvent = {
            eventLog: {
                args: {
                    sender: "0x123",
                    destinationChain: 1,
                    destinationContractAddress: "0x123",
                    payloadHash: "0x123",
                },
            },
        };
        const gasReceiverEvent = {
            eventLog: {
                args: {
                    sourceAddress: "0x123",
                    destinationChain: 1,
                    destinationAddress: "0x123",
                    payloadHash: "0x1234",
                },
            },
        };
        it("should return false if the payloadHash is different", () => {
            expect((0, helpers_1.validateContractCall)(gatewayEvent, {
                eventLog: {
                    args: Object.assign(Object.assign({}, gasReceiverEvent.eventLog.args), { payloadHash: "0x1234567" }),
                },
            })).toBe(false);
        });
        it("should return false if the sourceAddress is different", () => {
            expect((0, helpers_1.validateContractCall)(gatewayEvent, {
                eventLog: {
                    args: Object.assign(Object.assign({}, gasReceiverEvent.eventLog.args), { sourceAddress: "0x1234567" }),
                },
            })).toBe(false);
        });
        it("should return false if the destinationContractAddress is different", () => {
            expect((0, helpers_1.validateContractCall)(gatewayEvent, {
                eventLog: {
                    args: Object.assign(Object.assign({}, gasReceiverEvent.eventLog.args), { destinationAddress: "0x1234567" }),
                },
            })).toBe(false);
        });
        it("should return false if the destinationChain is different", () => {
            expect((0, helpers_1.validateContractCall)(gatewayEvent, {
                eventLog: {
                    args: Object.assign(Object.assign({}, gasReceiverEvent.eventLog.args), { destinationChain: 2 }),
                },
            })).toBe(false);
        });
        it("should return true when all event arguments are the same", () => {
            expect((0, helpers_1.validateContractCall)(gatewayEvent, gasReceiverEvent)).toBe(false);
        });
    });
    describe("validateContractCallWithToken", () => {
        const gatewayEvent = {
            eventLog: {
                args: {
                    sender: "0x123",
                    destinationChain: 1,
                    destinationContractAddress: "0x123",
                    payloadHash: "0x123",
                    symbol: "AXL",
                    amount: "1",
                },
            },
        };
        const gasReceiverEvent = {
            eventLog: {
                args: {
                    sourceAddress: "0x123",
                    destinationChain: 1,
                    destinationAddress: "0x123",
                    payloadHash: "0x123",
                    symbol: "AXL",
                    amount: "1",
                },
            },
        };
        it("should return false if the payloadHash is different", () => {
            expect((0, helpers_1.validateContractCallWithToken)(gatewayEvent, {
                eventLog: {
                    args: Object.assign(Object.assign({}, gasReceiverEvent.eventLog.args), { payloadHash: "0x1234567" }),
                },
            })).toBe(false);
        });
        it("should return false if the sourceAddress is different", () => {
            expect((0, helpers_1.validateContractCallWithToken)(gatewayEvent, {
                eventLog: {
                    args: Object.assign(Object.assign({}, gasReceiverEvent.eventLog.args), { sourceAddress: "0x1234567" }),
                },
            })).toBe(false);
        });
        it("should return false if the destinationContractAddress is different", () => {
            expect((0, helpers_1.validateContractCallWithToken)(gatewayEvent, {
                eventLog: {
                    args: Object.assign(Object.assign({}, gasReceiverEvent.eventLog.args), { destinationAddress: "0x1234567" }),
                },
            })).toBe(false);
        });
        it("should return false if the destinationChain is different", () => {
            expect((0, helpers_1.validateContractCallWithToken)(gatewayEvent, {
                eventLog: {
                    args: Object.assign(Object.assign({}, gasReceiverEvent.eventLog.args), { destinationChain: 8 }),
                },
            })).toBe(false);
        });
        it("should return false if the symbol is different", () => {
            expect((0, helpers_1.validateContractCallWithToken)(gatewayEvent, {
                eventLog: {
                    args: Object.assign(Object.assign({}, gasReceiverEvent.eventLog.args), { symbol: "ETH" }),
                },
            })).toBe(false);
        });
        it("should return false if the amount is different", () => {
            expect((0, helpers_1.validateContractCallWithToken)(gatewayEvent, {
                eventLog: {
                    args: Object.assign(Object.assign({}, gasReceiverEvent.eventLog.args), { amount: "1234" }),
                },
            })).toBe(false);
        });
        it("should return true when all event arguments are the same", () => {
            expect((0, helpers_1.validateContractCallWithToken)(gatewayEvent, gasReceiverEvent)).toBe(true);
        });
    });
    describe("getNativeGasAmountFromTxReceipt", () => {
        const mismatchPayloadHashGasReceiverEvent = {
            transactionIndex: 4,
            blockNumber: 15155410,
            transactionHash: "0xd4d3f300b8b85295c42b3a2db98bae6a04958a4c5d2f026558eb76978d3f7165",
            address: "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6",
            topics: [
                "0x999d431b58761213cf53af96262b67a069cbd963499fd8effd1e21556217b841",
                "0x000000000000000000000000984e6396aa71091d0824486dd1ab07b392b4e35f",
                "0x83a0c20ad506ae83b9f84420cefb118d97244ff2eddbf5b1ed4a790cefa68f33",
            ],
            data: "0x00000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000286a83ee4734bc0000000000000000000000001cc5f2f37a4787f02e18704d252735fb714f35ec00000000000000000000000000000000000000000000000000000000000000084d6f6f6e6265616d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a3078393835386634326345443334373631354538424338314439313141303635373931323331634430630000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000056155534443000000000000000000000000000000000000000000000000000000",
            logIndex: 11,
            blockHash: "0x970dedd5170549bd0582bb4c86a2872e292b1a7b3f3385cfcfb7443331cca748",
        };
        const mismatchPayloadHashContractCallWithTokenEvent = {
            transactionIndex: 4,
            blockNumber: 15155410,
            transactionHash: "0xd4d3f300b8b85295c42b3a2db98bae6a04958a4c5d2f026558eb76978d3f7165",
            address: "0xC249632c2D40b9001FE907806902f63038B737Ab",
            topics: [
                "0x7e50569d26be643bda7757722291ec66b1be66d8283474ae3fab5a98f878a7a2",
                "0x000000000000000000000000984e6396aa71091d0824486dd1ab07b392b4e35f",
                "0xe2a7b7b637af73417b3b11c272cc9f7bea1521345d8627453f96beff1394574d",
            ],
            data: "0x00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000000000000000084d6f6f6e6265616d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a3078393835386634326345443334373631354538424338314439313141303635373931323331634430630000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000001cc5f2f37a4787f02e18704d252735fb714f35ec00000000000000000000000000000000000000000000000000000000000000056155534443000000000000000000000000000000000000000000000000000000",
            logIndex: 14,
            blockHash: "0x970dedd5170549bd0582bb4c86a2872e292b1a7b3f3385cfcfb7443331cca748",
        };
        const validContractCallWithTokenEvent = Object.assign(Object.assign({}, mismatchPayloadHashContractCallWithTokenEvent), { topics: [
                "0x7e50569d26be643bda7757722291ec66b1be66d8283474ae3fab5a98f878a7a2",
                "0x0000000000000000000000008d013ac025c8f949cafe11f935f24130d3330008",
                "0x68d333ae12aee7a6f856000885d87f35853bac3fb2f6f0a2b5d29b56d6af4dd4",
            ], data: "0x00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000002dcbfd9c5d3ca00000000000000000000000000000000000000000000000000000000000000000094176616c616e6368650000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a30783844303133616330323543386639343943614665313146393335663234313330443333333030303800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000076d8ad69d7695c9621453cb768d73f7060e4f9a80000000000000000000000007ee1704b30c7efe70e2ca7d143a4585f47e05edf000000000000000000000000b5dd06efa3c2e807d78679ecfc217a9df675121800000000000000000000000000000000000000000000000000000000000132ad00000000000000000000000000000000000000000000000000000000000000055741564158000000000000000000000000000000000000000000000000000000" });
        const validGasReceiverEvent = Object.assign(Object.assign({}, mismatchPayloadHashGasReceiverEvent), { topics: [
                "0x999d431b58761213cf53af96262b67a069cbd963499fd8effd1e21556217b841",
                "0x0000000000000000000000008d013ac025c8f949cafe11f935f24130d3330008",
                "0x68d333ae12aee7a6f856000885d87f35853bac3fb2f6f0a2b5d29b56d6af4dd4",
            ], data: "0x00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000002dcbfd9c5d3ca000000000000000000000000000000000000000000000000000002aa1efb94e000000000000000000000000000076d8ad69d7695c9621453cb768d73f7060e4f9a800000000000000000000000000000000000000000000000000000000000000094176616c616e6368650000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a3078384430313361633032354338663934394361466531314639333566323431333044333333303030380000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000055741564158000000000000000000000000000000000000000000000000000000" });
        const receipt = {
            logs: [mismatchPayloadHashGasReceiverEvent, mismatchPayloadHashContractCallWithTokenEvent],
        };
        it("should return 0 if the gasReceiver event is undefined", () => {
            expect((0, helpers_1.getNativeGasAmountFromTxReceipt)({
                logs: [mismatchPayloadHashContractCallWithTokenEvent],
            })).toBe("0");
        });
        it("should return 0 if the validateContractCallWithToken returns false", () => {
            expect((0, helpers_1.getNativeGasAmountFromTxReceipt)(receipt)).toBe("0");
        });
        it("should return non-zero if the validateContractCallWithToken return true", () => {
            expect((0, helpers_1.getNativeGasAmountFromTxReceipt)({
                logs: [validGasReceiverEvent, validContractCallWithTokenEvent],
            })).toBe("12000000000000000");
        });
        // it("should return 0 if the validateContractCall returns false", () => {});
        // it("should return non-zero if the validateContractCall return true", () => {});
    });
});
//# sourceMappingURL=contractEventHelper.spec.js.map