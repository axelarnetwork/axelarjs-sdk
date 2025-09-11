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
const utils_1 = require("ethers/lib/utils");
const __1 = require("../..");
const AxelarAssetTransfer_1 = require("../AxelarAssetTransfer");
const types_1 = require("../types");
const EvmChain_1 = require("../../constants/EvmChain");
const proto_signing_1 = require("@cosmjs/proto-signing");
const stubs_1 = require("./stubs");
describe("AxelarAssetTransfer", () => {
    const socket = {
        joinRoomAndWaitForEvent: vitest.fn(),
    };
    beforeEach(() => {
        vitest
            .spyOn(AxelarAssetTransfer_1.AxelarAssetTransfer.prototype, "getSocketService")
            .mockReturnValueOnce(socket);
        vitest.clearAllMocks();
    });
    describe("on init", () => {
        let bridge;
        beforeEach(() => {
            bridge = new AxelarAssetTransfer_1.AxelarAssetTransfer({
                environment: types_1.Environment.TESTNET,
            });
            vitest.spyOn(bridge.axelarQueryApi, "getActiveChains").mockResolvedValue((0, stubs_1.activeChainsStub)());
        });
        describe("AxelarAssetTransfer", () => {
            it("should be defined", () => {
                expect(bridge).toBeDefined();
            });
            it("should have environment", () => {
                expect(bridge.environment).toBeTruthy();
            });
            it("should have resource url", () => {
                expect(bridge.resourceUrl).toBeTruthy();
            });
        });
        describe("RestService", () => {
            it("should be defined", () => {
                expect(bridge.api).toBeDefined();
            });
        });
        describe("SocketService", () => {
            it("should be defined", () => {
                expect(socket).toBeDefined();
            });
        });
    });
    describe("getOneTimeCode()", () => {
        let bridge;
        beforeEach(() => {
            bridge = new AxelarAssetTransfer_1.AxelarAssetTransfer({
                environment: types_1.Environment.TESTNET,
            });
            vitest.spyOn(bridge.axelarQueryApi, "getActiveChains").mockResolvedValue((0, stubs_1.activeChainsStub)());
        });
        describe("on error", () => {
            describe("when called", () => {
                let otc;
                let error;
                beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                    vitest.spyOn(bridge.api, "get").mockRejectedValue((0, stubs_1.apiErrorStub)());
                    otc = yield bridge.getOneTimeCode((0, stubs_1.ethAddressStub)(), (0, stubs_1.uuidStub)()).catch((_error) => {
                        error = _error;
                    });
                }));
                describe("api", () => {
                    it("should be called", () => {
                        expect(bridge.api.get).toHaveBeenCalledWith(`${__1.CLIENT_API_GET_OTC}?publicAddress=${(0, stubs_1.ethAddressStub)()}`, (0, stubs_1.uuidStub)());
                    });
                });
                describe("getOneTimeCode()", () => {
                    it("shoud not return", () => {
                        expect(otc).toBeUndefined();
                    });
                    it("should throw", () => {
                        expect(error).toEqual((0, stubs_1.apiErrorStub)());
                    });
                });
            });
        });
        describe("on success", () => {
            describe("when called", () => {
                let otc;
                beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                    vitest.spyOn(bridge.api, "get").mockResolvedValue((0, stubs_1.otcStub)());
                    vitest
                        .spyOn(bridge.axelarQueryApi, "getActiveChains")
                        .mockResolvedValue((0, stubs_1.activeChainsStub)());
                    otc = yield bridge.getOneTimeCode((0, stubs_1.ethAddressStub)(), (0, stubs_1.uuidStub)());
                }));
                describe("api", () => {
                    it("should be called", () => {
                        expect(bridge.api.get).toHaveBeenCalledWith(`${__1.CLIENT_API_GET_OTC}?publicAddress=${(0, stubs_1.ethAddressStub)()}`, (0, stubs_1.uuidStub)());
                    });
                });
                describe("getOneTimeCode()", () => {
                    it("shoud return", () => {
                        expect(otc).toEqual((0, stubs_1.otcStub)());
                    });
                });
            });
        });
    });
    describe("getInitRoomId()", () => {
        let bridge;
        beforeEach(() => {
            bridge = new AxelarAssetTransfer_1.AxelarAssetTransfer({
                environment: types_1.Environment.TESTNET,
            });
            vitest.spyOn(bridge.axelarQueryApi, "getActiveChains").mockResolvedValue((0, stubs_1.activeChainsStub)());
        });
        describe("on error", () => {
            describe("when called", () => {
                let roomId;
                let error;
                beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                    vitest.spyOn(bridge.api, "post").mockRejectedValue((0, stubs_1.apiErrorStub)());
                    const dto = (0, stubs_1.depositAddressPayloadStub)();
                    roomId = yield bridge
                        .getInitRoomId(dto.fromChain, dto.toChain, dto.destinationAddress, dto.asset, dto.publicAddress, dto.signature, (0, stubs_1.uuidStub)())
                        .catch((_error) => {
                        error = _error;
                    });
                }));
                describe("api", () => {
                    it("should be called", () => {
                        expect(bridge.api.post).toHaveBeenCalledWith(__1.CLIENT_API_POST_TRANSFER_ASSET, (0, stubs_1.depositAddressPayloadStub)(), (0, stubs_1.uuidStub)());
                    });
                });
                describe("getInitRoomId()", () => {
                    it("should throw", () => {
                        expect(error).toEqual((0, stubs_1.apiErrorStub)());
                    });
                    it("shoud return", () => {
                        expect(roomId).toBeUndefined();
                    });
                });
            });
        });
        describe("on success", () => {
            describe("when called", () => {
                let roomId;
                beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                    vitest.spyOn(bridge.api, "post").mockResolvedValue({
                        data: (0, stubs_1.roomIdStub)(),
                    });
                    const dto = (0, stubs_1.depositAddressPayloadStub)();
                    roomId = yield bridge.getInitRoomId(dto.fromChain, dto.toChain, dto.destinationAddress, dto.asset, dto.publicAddress, dto.signature, (0, stubs_1.uuidStub)());
                }));
                describe("api", () => {
                    it("should be called", () => {
                        expect(bridge.api.post).toHaveBeenCalledWith(__1.CLIENT_API_POST_TRANSFER_ASSET, (0, stubs_1.depositAddressPayloadStub)(), (0, stubs_1.uuidStub)());
                    });
                });
                describe("getInitRoomId()", () => {
                    it("shoud return", () => {
                        expect(roomId).toBe((0, stubs_1.roomIdStub)().roomId);
                    });
                });
            });
        });
    });
    describe("getLinkEvent()", () => {
        let bridge;
        beforeEach(() => {
            bridge = new AxelarAssetTransfer_1.AxelarAssetTransfer({
                environment: types_1.Environment.TESTNET,
            });
            vitest.spyOn(bridge.axelarQueryApi, "getActiveChains").mockResolvedValue((0, stubs_1.activeChainsStub)());
        });
        describe("on error", () => {
            const dto = (0, stubs_1.depositAddressPayloadStub)();
            describe("when called", () => {
                let roomId;
                let error;
                beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                    vitest.spyOn(socket, "joinRoomAndWaitForEvent").mockRejectedValue((0, stubs_1.apiErrorStub)());
                    roomId = yield bridge
                        .getLinkEvent((0, stubs_1.roomIdStub)().roomId, dto.fromChain, dto.toChain, dto.destinationAddress)
                        .catch((_error) => {
                        error = _error;
                    });
                }));
                describe("api", () => {
                    it("should be called", () => {
                        expect(socket.joinRoomAndWaitForEvent).toHaveBeenCalledWith((0, stubs_1.roomIdStub)().roomId, dto.fromChain, dto.toChain, dto.destinationAddress);
                    });
                });
                describe("getLinkEvent()", () => {
                    it("should throw", () => {
                        expect(error).toEqual((0, stubs_1.apiErrorStub)());
                    });
                    it("shoud return", () => {
                        expect(roomId).toBeUndefined();
                    });
                });
            });
        });
        describe("on success", () => {
            const dto = (0, stubs_1.depositAddressPayloadStub)();
            describe("when called", () => {
                let roomId;
                beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                    vitest
                        .spyOn(socket, "joinRoomAndWaitForEvent")
                        .mockResolvedValueOnce({ newRoomId: (0, stubs_1.newRoomIdStub)() });
                    roomId = yield bridge.getLinkEvent((0, stubs_1.roomIdStub)().roomId, dto.fromChain, dto.toChain, dto.destinationAddress);
                }));
                describe("api", () => {
                    it("should be called", () => {
                        expect(socket.joinRoomAndWaitForEvent).toHaveBeenCalledWith((0, stubs_1.roomIdStub)().roomId, dto.fromChain, dto.toChain, dto.destinationAddress);
                    });
                });
                describe("getInitRoomId()", () => {
                    it("shoud return", () => {
                        expect(roomId).toEqual((0, stubs_1.newRoomIdStub)());
                    });
                });
            });
        });
    });
    describe("getDepositAddress()", () => {
        let bridge;
        beforeEach(() => {
            bridge = new AxelarAssetTransfer_1.AxelarAssetTransfer({
                environment: types_1.Environment.TESTNET,
            });
        });
        describe("when called", () => {
            const fromChain = __1.CHAINS.TESTNET.OSMOSIS;
            const toChain = __1.CHAINS.TESTNET.AVALANCHE;
            const depositAddress = "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";
            const asset = "uusd";
            let response;
            let responseWithObjectParams;
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                vitest.spyOn(bridge, "getOneTimeCode").mockResolvedValue((0, stubs_1.otcStub)());
                vitest.spyOn(bridge, "getInitRoomId").mockResolvedValue((0, stubs_1.roomIdStub)().roomId);
                vitest.spyOn(bridge, "getLinkEvent").mockResolvedValue((0, stubs_1.linkEventStub)().newRoomId);
                vitest
                    .spyOn(bridge.axelarQueryApi, "getActiveChains")
                    .mockResolvedValue((0, stubs_1.activeChainsStub)());
                response = yield bridge.getDepositAddress(fromChain, toChain, depositAddress, asset);
                responseWithObjectParams = yield bridge.getDepositAddress({
                    fromChain,
                    toChain,
                    destinationAddress: depositAddress,
                    asset,
                });
            }));
            it("should return deposit address", () => {
                expect(response).toBe(JSON.parse((0, stubs_1.newRoomIdStub)())["depositAddress"]);
                expect(responseWithObjectParams).toBe(JSON.parse((0, stubs_1.newRoomIdStub)())["depositAddress"]);
            });
        });
    });
    describe("offline deposit address methods", () => {
        let bridge;
        beforeEach(() => {
            bridge = new AxelarAssetTransfer_1.AxelarAssetTransfer({
                environment: types_1.Environment.TESTNET,
            });
        });
        describe("validateOfflineDepositAddress", () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                vitest.clearAllMocks();
                vitest
                    .spyOn(bridge.axelarQueryApi, "getContractAddressFromConfig")
                    .mockResolvedValue("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955");
                vitest
                    .spyOn(bridge.axelarQueryApi, "getActiveChains")
                    .mockResolvedValue((0, stubs_1.activeChainsStub)());
            }));
            it("should be able to generate a deposit address offline", () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(bridge.validateOfflineDepositAddress("wrap", EvmChain_1.EvmChain.AVALANCHE, EvmChain_1.EvmChain.FANTOM, "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d", "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d", (0, utils_1.hexZeroPad)((0, utils_1.hexlify)(0), 32))).resolves.toBe("0xb24c3396aa90cae288b7f0771c88de4e180503e2");
            }));
        });
        describe("getDepositAddressForNativeWrap", () => {
            let address;
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                address = "0xb24c3396aa90cae288b7f0771c88de4e180503e2";
                vitest.clearAllMocks();
                vitest.spyOn(bridge, "getDepositAddressFromRemote").mockResolvedValue({ address });
                vitest
                    .spyOn(bridge.axelarQueryApi, "getContractAddressFromConfig")
                    .mockResolvedValue("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955");
                vitest
                    .spyOn(bridge.axelarQueryApi, "getActiveChains")
                    .mockResolvedValue((0, stubs_1.activeChainsStub)());
            }));
            it("should be able to generate a deposit address offline", () => {
                const depositAddress = bridge.validateOfflineDepositAddress("wrap", EvmChain_1.EvmChain.AVALANCHE, EvmChain_1.EvmChain.FANTOM, "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d", "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d", (0, utils_1.hexZeroPad)((0, utils_1.hexlify)(0), 32));
                expect(depositAddress).toBeDefined();
            });
            it("should be able to retrieve the deposit address from microservices for native wrap", () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(bridge.getDepositAddressForNativeWrap(EvmChain_1.EvmChain.AVALANCHE, EvmChain_1.EvmChain.FANTOM, "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d", "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d")).resolves.toBe(address);
            }));
        });
        describe("getDepositAddressForNativeUnwrap", () => {
            let unwrapAddress;
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                unwrapAddress = "0x34bd65b158b6b4cc539388842cb2447c0a28acc0";
                vitest.clearAllMocks();
                vitest
                    .spyOn(bridge, "getDepositAddressFromRemote")
                    .mockResolvedValue({ address: unwrapAddress });
                vitest.spyOn(bridge, "getDepositAddress").mockResolvedValue(unwrapAddress);
                vitest
                    .spyOn(bridge.axelarQueryApi, "getContractAddressFromConfig")
                    .mockResolvedValue("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955");
                vitest.spyOn(bridge, "getERC20Denom").mockResolvedValue("wavax-wei");
                vitest
                    .spyOn(bridge.axelarQueryApi, "getActiveChains")
                    .mockResolvedValue((0, stubs_1.activeChainsStub)());
            }));
            it("should be able to retrieve the deposit address from microservices for erc20 unwrap", () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(bridge.getDepositAddressForNativeUnwrap(EvmChain_1.EvmChain.AVALANCHE, EvmChain_1.EvmChain.FANTOM, "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d", "evm", "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d")).resolves.toBe(unwrapAddress);
                expect(bridge.getDepositAddress).toHaveBeenCalledWith(EvmChain_1.EvmChain.AVALANCHE, EvmChain_1.EvmChain.FANTOM, unwrapAddress, "wavax-wei");
            }));
        });
        describe("getOfflineDepositAddressForERC20Transfer", () => {
            let unwrapAddress;
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                unwrapAddress = "0x34bd65b158b6b4cc539388842cb2447c0a28acc0";
                vitest.clearAllMocks();
                vitest
                    .spyOn(bridge, "getDepositAddressFromRemote")
                    .mockResolvedValue({ address: unwrapAddress });
                vitest
                    .spyOn(bridge.axelarQueryApi, "getContractAddressFromConfig")
                    .mockResolvedValue("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955");
                vitest.spyOn(bridge, "getERC20Denom").mockResolvedValue("wavax-wei");
                vitest
                    .spyOn(bridge.axelarQueryApi, "getActiveChains")
                    .mockResolvedValue((0, stubs_1.activeChainsStub)());
            }));
            it("should be able to retrieve the deposit address from microservices for erc20", () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(bridge.getOfflineDepositAddressForERC20Transfer(EvmChain_1.EvmChain.AVALANCHE, EvmChain_1.EvmChain.FANTOM, "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d", "evm", "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d")).resolves.toBe(unwrapAddress);
            }));
            it("should be able to retrieve the deposit address from microservices for erc20 address", () => __awaiter(void 0, void 0, void 0, function* () {
                vitest.clearAllMocks();
                vitest
                    .spyOn(bridge, "getOfflineDepositAddressForERC20Transfer")
                    .mockResolvedValue(unwrapAddress);
                const res = yield bridge.getDepositAddress({
                    fromChain: __1.CHAINS.TESTNET.AVALANCHE,
                    toChain: __1.CHAINS.TESTNET.FANTOM,
                    destinationAddress: "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
                    asset: "wavax-wei",
                    options: {
                        erc20DepositAddressType: "offline",
                    },
                });
                expect(res).toEqual(unwrapAddress);
                expect(bridge.getOfflineDepositAddressForERC20Transfer).toHaveBeenCalled();
            }));
        });
    });
    describe("offline deposit address integration into getDepositAddress()", () => {
        let bridge;
        beforeEach(() => {
            bridge = new AxelarAssetTransfer_1.AxelarAssetTransfer({
                environment: types_1.Environment.TESTNET,
            });
        });
        describe("getDepositAddress - wrap", () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                vitest.clearAllMocks();
                vitest
                    .spyOn(bridge, "getDepositAddressForNativeWrap")
                    .mockResolvedValue("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955");
                vitest
                    .spyOn(bridge, "getDepositAddressForNativeUnwrap")
                    .mockResolvedValue("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955");
                vitest
                    .spyOn(bridge.axelarQueryApi, "getActiveChains")
                    .mockResolvedValue((0, stubs_1.activeChainsStub)());
            }));
            it("should call getDepositAddressForNativeWrap and not getDepositAddressForNativeUnwrap", () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(bridge.getDepositAddress(EvmChain_1.EvmChain.AVALANCHE, EvmChain_1.EvmChain.FANTOM, "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d", "AVAX", { refundAddress: "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d" })).resolves.toBe("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955");
                expect(bridge.getDepositAddressForNativeWrap).toHaveBeenCalled();
                expect(bridge.getDepositAddressForNativeUnwrap).not.toHaveBeenCalled();
            }));
            it("should call getDepositAddressForNativeUnwrap and not getDepositAddressForNativeWrap", () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(bridge.getDepositAddress(EvmChain_1.EvmChain.FANTOM, EvmChain_1.EvmChain.AVALANCHE, "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d", "wavax-wei", {
                    refundAddress: "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
                    shouldUnwrapIntoNative: true,
                })).resolves.toBe("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955");
                expect(bridge.getDepositAddressForNativeWrap).not.toHaveBeenCalled();
                expect(bridge.getDepositAddressForNativeUnwrap).toHaveBeenCalled();
            }));
        });
    });
    describe("sendToken", () => {
        let bridge;
        beforeEach(() => {
            bridge = new AxelarAssetTransfer_1.AxelarAssetTransfer({
                environment: types_1.Environment.TESTNET,
            });
        });
        describe("sendToken from Cosmos-based chain", () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                vitest.clearAllMocks();
            }));
            it("should broadcast an ibc transfer message with a memo", () => __awaiter(void 0, void 0, void 0, function* () {
                const offlineSigner = yield proto_signing_1.DirectSecp256k1HdWallet.generate();
                const rpcUrl = "https://rpc.osmotest5.osmosis.zone";
                const fee = {
                    gas: "250000",
                    amount: [{ denom: "uosmo", amount: "30000" }],
                };
                const coin = {
                    denom: "ibc/9463E39D230614B313B487836D13A392BD1731928713D4C8427A083627048DB3",
                    amount: "150000",
                };
                const requestOptions = {
                    fromChain: __1.CHAINS.TESTNET.OSMOSIS,
                    toChain: __1.CHAINS.TESTNET.AVALANCHE,
                    asset: {
                        denom: coin.denom,
                    },
                    amountInAtomicUnits: coin.amount,
                    destinationAddress: "0xB8Cd93C83A974649D76B1c19f311f639e62272BC",
                    options: {
                        cosmosOptions: {
                            cosmosDirectSigner: offlineSigner,
                            rpcUrl,
                            fee,
                        },
                    },
                };
                yield expect(bridge.sendToken(requestOptions)).toBeTruthy();
            }));
        });
    });
});
//# sourceMappingURL=AxelarAssetTransfer.spec.js.map