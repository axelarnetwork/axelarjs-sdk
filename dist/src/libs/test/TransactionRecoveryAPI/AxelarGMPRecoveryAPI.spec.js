"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const AxelarGMPRecoveryAPI_1 = require("../../TransactionRecoveryApi/AxelarGMPRecoveryAPI");
const types_1 = require("../../types");
const faucet_1 = require("@mysten/sui/faucet");
const secp256k1_1 = require("@mysten/sui/keypairs/secp256k1");
const EvmChain_1 = require("../../../constants/EvmChain");
const axelar_local_dev_1 = require("@axelar-network/axelar-local-dev");
const ethers_1 = require("ethers");
const DistributionExecutable_json_1 = __importDefault(require("../abi/DistributionExecutable.json"));
const DistributionExecutableGasToken_json_1 = __importDefault(require("../abi/DistributionExecutableGasToken.json"));
const TestToken_json_1 = __importDefault(require("../abi/TestToken.json"));
const helpers_1 = require("../../TransactionRecoveryApi/helpers");
const utils_1 = require("ethers/lib/utils");
const error_1 = require("../../TransactionRecoveryApi/constants/error");
const AxelarGateway_1 = require("../../AxelarGateway");
const AxelarRecoveryApi_1 = require("../../TransactionRecoveryApi/AxelarRecoveryApi");
const ContractCallHelper = __importStar(require("../../TransactionRecoveryApi/helpers/contractCallHelper"));
const stubs_1 = require("../stubs");
const Sleep = __importStar(require("../../../utils/sleep"));
const types_2 = require("@axelar-network/axelarjs-types/axelar/evm/v1beta1/types");
const client_1 = require("@mysten/sui/client");
describe("AxelarGMPRecoveryAPI", () => {
    const { setLogger } = axelar_local_dev_1.utils;
    setLogger(() => null);
    let evmWalletDetails;
    beforeEach(() => {
        vitest.clearAllMocks();
        evmWalletDetails = {
            privateKey: "",
            useWindowEthereum: false,
        };
    });
    describe("findEventAndConfirmIfNeeded", () => {
        const api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.TESTNET });
        test("It should confirm an event if needed", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockConfirmGatewayTx = vitest
                .spyOn(api, "confirmGatewayTx")
                .mockResolvedValue((0, stubs_1.axelarTxResponseStub)());
            const mockEvmEvent = vitest
                .spyOn(api, "getEvmEvent")
                .mockResolvedValue((0, stubs_1.evmEventStubResponse)());
            vitest.spyOn(api, "isEVMEventCompleted").mockReturnValueOnce(false).mockReturnValueOnce(true);
            vitest.spyOn(api, "isEVMEventConfirmed").mockReturnValueOnce(false);
            const mockDoesTxMeetConfirmHt = vitest
                .spyOn(api, "doesTxMeetConfirmHt")
                .mockResolvedValue(true);
            const txHash = "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503";
            const response = yield api.findEventAndConfirmIfNeeded(EvmChain_1.EvmChain.AVALANCHE, EvmChain_1.EvmChain.POLYGON, txHash, undefined, evmWalletDetails);
            expect(mockEvmEvent).toHaveBeenCalledWith(EvmChain_1.EvmChain.AVALANCHE, EvmChain_1.EvmChain.POLYGON, txHash, undefined);
            expect(mockEvmEvent).toHaveBeenCalledWith(EvmChain_1.EvmChain.AVALANCHE, EvmChain_1.EvmChain.POLYGON, txHash, undefined);
            expect(mockConfirmGatewayTx).toHaveBeenCalledWith(txHash, EvmChain_1.EvmChain.AVALANCHE);
            expect(mockDoesTxMeetConfirmHt).toHaveBeenCalledWith(EvmChain_1.EvmChain.AVALANCHE, txHash, undefined);
            expect(response).toBeDefined();
            expect(response.infoLogs.length).toBeGreaterThan(0);
            expect(response.eventResponse).toBeDefined();
            expect(response.success).toBeTruthy();
            expect(response.commandId).toBe("commandId");
        }));
        test("It should not confirm an event if the evm event is completed", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockConfirmGatewayTx = vitest
                .spyOn(api, "confirmGatewayTx")
                .mockResolvedValue((0, stubs_1.axelarTxResponseStub)());
            vitest.spyOn(api, "getEvmEvent").mockResolvedValue(Object.assign(Object.assign({}, (0, stubs_1.evmEventStubResponse)()), { eventResponse: {
                    event: Object.assign(Object.assign({}, (0, stubs_1.evmEventStubResponse)().eventResponse.event), { status: types_2.Event_Status.STATUS_COMPLETED }),
                } }));
            const response = yield api.findEventAndConfirmIfNeeded(EvmChain_1.EvmChain.AVALANCHE, EvmChain_1.EvmChain.POLYGON, "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503", undefined, evmWalletDetails);
            expect(mockConfirmGatewayTx).not.toHaveBeenCalled();
            expect(response).toBeTruthy();
            expect(response.success).toBeTruthy();
            expect(response.eventResponse).toBeDefined();
            expect(response.commandId).toBe("commandId");
        }));
        test("It should not confirm an event if the finalized block is not met", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockConfirmGatewayTx = vitest
                .spyOn(api, "confirmGatewayTx")
                .mockResolvedValue((0, stubs_1.axelarTxResponseStub)());
            vitest.spyOn(api, "getEvmEvent").mockResolvedValue(Object.assign(Object.assign({}, (0, stubs_1.evmEventStubResponse)()), { eventResponse: {
                    event: Object.assign(Object.assign({}, (0, stubs_1.evmEventStubResponse)().eventResponse.event), { status: types_2.Event_Status.STATUS_UNSPECIFIED }),
                } }));
            const mockDoesTxMeetConfirmHt = vitest
                .spyOn(api, "doesTxMeetConfirmHt")
                .mockResolvedValue(false);
            const txHash = "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503";
            const response = yield api.findEventAndConfirmIfNeeded(EvmChain_1.EvmChain.AVALANCHE, EvmChain_1.EvmChain.POLYGON, txHash, undefined, evmWalletDetails);
            expect(mockConfirmGatewayTx).toBeCalledTimes(0);
            expect(mockDoesTxMeetConfirmHt).toHaveBeenCalledWith(EvmChain_1.EvmChain.AVALANCHE, txHash, undefined);
            expect(response.success).toBeFalsy();
            expect(response.eventResponse).toBeDefined();
            expect(response.commandId).toBe("commandId");
            expect(response.errorMessage).toContain(`minimum confirmation`);
            expect(response.confirmTx).toBeUndefined();
        }));
        test("It should return success: false if the confirmGatewayTx is failed", () => __awaiter(void 0, void 0, void 0, function* () {
            vitest.spyOn(api, "getEvmEvent").mockResolvedValue(Object.assign(Object.assign({}, (0, stubs_1.evmEventStubResponse)()), { eventResponse: {
                    event: Object.assign(Object.assign({}, (0, stubs_1.evmEventStubResponse)().eventResponse.event), { status: types_2.Event_Status.STATUS_UNSPECIFIED }),
                } }));
            const mockDoesTxMeetConfirmHt = vitest
                .spyOn(api, "doesTxMeetConfirmHt")
                .mockResolvedValue(true);
            const txHash = "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503";
            const mockConfirmGatewayTx = vitest.spyOn(api, "confirmGatewayTx").mockRejectedValue("error");
            const response = yield api.findEventAndConfirmIfNeeded(EvmChain_1.EvmChain.AVALANCHE, EvmChain_1.EvmChain.POLYGON, txHash, undefined, evmWalletDetails);
            expect(mockConfirmGatewayTx).toHaveBeenCalledWith(txHash, EvmChain_1.EvmChain.AVALANCHE);
            expect(mockDoesTxMeetConfirmHt).toHaveBeenCalledWith(EvmChain_1.EvmChain.AVALANCHE, txHash, undefined);
            expect(response.success).toBeFalsy();
            expect(response.eventResponse).toBeDefined();
            expect(response.commandId).toBe("commandId");
            expect(response.errorMessage).toContain(`could not confirm`);
            expect(response.confirmTx).toBeUndefined();
        }));
    });
    describe("findBatchAndSignIfNeeded", () => {
        const api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.TESTNET });
        test("It should sign an event if needed", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSignCommandTx = vitest
                .spyOn(api, "signCommands")
                .mockResolvedValue((0, stubs_1.axelarTxResponseStub)());
            vitest.spyOn(api, "fetchBatchData").mockResolvedValue(undefined);
            const signResult = yield api.findBatchAndSignIfNeeded("conmmandId", EvmChain_1.EvmChain.AVALANCHE);
            expect(mockSignCommandTx).toHaveBeenLastCalledWith(EvmChain_1.EvmChain.AVALANCHE);
            expect(signResult).toBeDefined();
        }));
        test("It should skip sign an event if batch is found", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSignCommandTx = vitest
                .spyOn(api, "signCommands")
                .mockResolvedValue((0, stubs_1.axelarTxResponseStub)());
            vitest.spyOn(api, "fetchBatchData").mockResolvedValue({});
            const signResult = yield api.findBatchAndSignIfNeeded("commandId", EvmChain_1.EvmChain.MOONBEAM);
            expect(mockSignCommandTx).not.toHaveBeenCalled();
            expect(signResult).toBeDefined();
        }));
        test("It should return an error if unable to fetchBatchData", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSignCommandTx = vitest
                .spyOn(api, "signCommands")
                .mockResolvedValue((0, stubs_1.axelarTxResponseStub)());
            vitest.spyOn(api, "fetchBatchData").mockRejectedValue("error");
            const signResult = yield api.findBatchAndSignIfNeeded("commandId", EvmChain_1.EvmChain.MOONBEAM);
            expect(mockSignCommandTx).not.toHaveBeenCalled();
            expect(signResult).toBeDefined();
            expect(signResult.errorMessage).toContain(`findBatchAndSignIfNeeded(): issue retrieving and signing`);
        }));
    });
    describe("findBatchAndApproveGateway", () => {
        const api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.TESTNET });
        beforeEach(() => {
            vitest.clearAllMocks();
        });
        test("It should broadcast an event if needed", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSendApproveTx = vitest
                .spyOn(api, "sendApproveTx")
                .mockResolvedValue((0, stubs_1.axelarTxResponseStub)());
            vitest.spyOn(api, "fetchBatchData").mockResolvedValue(Object.assign(Object.assign({}, (0, stubs_1.batchCommandStub)()), { status: "BATCHED_COMMANDS_STATUS_SIGNED" }));
            const response = yield api.findBatchAndApproveGateway((0, stubs_1.batchCommandStub)().command_ids[0], EvmChain_1.EvmChain.MOONBEAM, evmWalletDetails);
            expect(mockSendApproveTx).toHaveBeenCalled();
            expect(response).toBeDefined();
            expect(response.errorMessage).toBeFalsy();
            expect(response.approveTx).toEqual((0, stubs_1.axelarTxResponseStub)());
            expect(response.success).toBeTruthy();
        }));
        test("It should return unsuccess message if batch data is not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSendApproveTx = vitest
                .spyOn(api, "sendApproveTx")
                .mockResolvedValue((0, stubs_1.axelarTxResponseStub)());
            vitest.spyOn(api, "fetchBatchData").mockResolvedValue(undefined);
            const response = yield api.findBatchAndApproveGateway((0, stubs_1.batchCommandStub)().command_ids[0], EvmChain_1.EvmChain.MOONBEAM, evmWalletDetails);
            expect(mockSendApproveTx).not.toHaveBeenCalled();
            expect(response).toBeTruthy();
            expect(response.errorMessage).toContain(`findBatchAndApproveGateway(): unable to retrieve batch data for`);
            expect(response.approveTx).toBeUndefined();
            expect(response.success).toBeFalsy();
        }));
        test("It should return unsuccess message if batch data does not contain command ID", () => __awaiter(void 0, void 0, void 0, function* () {
            vitest.spyOn(api, "sendApproveTx").mockResolvedValue((0, stubs_1.axelarTxResponseStub)());
            vitest.spyOn(api, "fetchBatchData").mockResolvedValue(Object.assign(Object.assign({}, (0, stubs_1.batchCommandStub)()), { status: "BATCHED_COMMANDS_STATUS_SIGNED" }));
            const response = yield api.findBatchAndApproveGateway("non-existent-command-id", EvmChain_1.EvmChain.MOONBEAM, evmWalletDetails);
            expect(response).toBeDefined();
            expect(response.errorMessage).toContain("unable to retrieve command ID");
            expect(response.approveTx).toBeUndefined();
            expect(response.success).toBeFalsy();
        }));
    });
    describe.skip("confirmGatewayTx", () => {
        const api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.TESTNET });
        test("It should confirm a gateway tx", () => __awaiter(void 0, void 0, void 0, function* () {
            const confirmation = yield api.confirmGatewayTx("0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503", EvmChain_1.EvmChain.AVALANCHE);
            expect(confirmation).toBeTruthy();
        }), 60000);
    });
    describe("getRouteDir", () => {
        const api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.TESTNET });
        const axelarnetModule = Object.assign(Object.assign({}, (0, stubs_1.chainInfoStub)()), { module: "axelarnet" });
        const evmModule = Object.assign(Object.assign({}, (0, stubs_1.chainInfoStub)()), { module: "evm" });
        test("it should return cosmos_to_evm", () => {
            const routeDir = api.getRouteDir(axelarnetModule, evmModule);
            expect(routeDir).toBe(AxelarGMPRecoveryAPI_1.RouteDir.COSMOS_TO_EVM);
        });
        test("it should return evm_to_cosmos", () => {
            const routeDir = api.getRouteDir(evmModule, axelarnetModule);
            expect(routeDir).toBe(AxelarGMPRecoveryAPI_1.RouteDir.EVM_TO_COSMOS);
        });
        test("it should return evm_to_evm", () => {
            const routeDir = api.getRouteDir(evmModule, evmModule);
            expect(routeDir).toBe(AxelarGMPRecoveryAPI_1.RouteDir.EVM_TO_EVM);
        });
    });
    describe("recoverEvmToCosmosTx", () => {
        const api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.TESTNET });
        beforeEach(() => {
            vitest.clearAllMocks();
            vitest.spyOn(api, "queryTransactionStatus").mockResolvedValueOnce({
                status: "called",
                callTx: {
                    chain: "avalanche",
                    returnValues: {
                        destinationChain: "osmosis-7",
                    },
                },
            });
        });
        test("it returns error if the confirmation is not met", () => __awaiter(void 0, void 0, void 0, function* () {
            vitest.spyOn(api, "doesTxMeetConfirmHt").mockReturnValue(Promise.resolve(false));
            const result = yield api.manualRelayToDestChain("0xtest");
            expect(result.success).toBeFalsy();
            expect(result.error).toContain("not confirmed");
        }));
        test("it returns error if the api fails to send ConfirmGatewayTx tx", () => __awaiter(void 0, void 0, void 0, function* () {
            vitest.spyOn(api, "doesTxMeetConfirmHt").mockReturnValue(Promise.resolve(true));
            vitest.spyOn(api, "confirmGatewayTx").mockRejectedValue({ message: "any" });
            const result = yield api.manualRelayToDestChain("0xtest");
            expect(result.success).toBeFalsy();
            expect(result.error).toContain("ConfirmGatewayTx");
        }));
        test("it returns error if the api fails to send RouteMessage tx", () => __awaiter(void 0, void 0, void 0, function* () {
            vitest.spyOn(api, "doesTxMeetConfirmHt").mockReturnValue(Promise.resolve(true));
            vitest.spyOn(api, "confirmGatewayTx").mockResolvedValue((0, stubs_1.axelarTxResponseStub)());
            vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValue({
                call: { returnValues: { payload: "payload" } },
            });
            vitest.spyOn(api, "getEventIndex").mockResolvedValue(0);
            vitest.spyOn(api, "routeMessageRequest").mockRejectedValue({ message: "any" });
            const result = yield api.manualRelayToDestChain("0xtest");
            expect(result.success).toBeFalsy();
            expect(result.error).toContain("RouteMessage");
        }));
        test("it should return success if the api succeeds to send RouteMessage tx", () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            vitest.spyOn(api, "doesTxMeetConfirmHt").mockReturnValue(Promise.resolve(true));
            vitest.spyOn(api, "confirmGatewayTx").mockResolvedValue((0, stubs_1.axelarTxResponseStub)());
            vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValue({
                call: { returnValues: { payload: "payload" } },
            });
            vitest.spyOn(api, "getEventIndex").mockResolvedValue(0);
            vitest.spyOn(api, "routeMessageRequest").mockResolvedValue((0, stubs_1.axelarTxResponseStub)());
            const result = yield api.manualRelayToDestChain("0xtest");
            expect(result.success).toBeTruthy();
            expect(result.confirmTx).toBeDefined();
            expect(result.routeMessageTx).toBeDefined();
            expect((_a = result.infoLogs) === null || _a === void 0 ? void 0 : _a.length).toBeGreaterThan(0);
        }));
    });
    describe("recoverCosmosToEvmTx", () => {
        const api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.TESTNET });
        beforeEach(() => {
            vitest.clearAllMocks();
            vitest.spyOn(api, "queryTransactionStatus").mockResolvedValueOnce({
                status: "called",
                callTx: {
                    chain: "osmosis-7",
                    returnValues: {
                        destinationChain: "avalanche",
                    },
                },
            });
        });
        test("it should return error if the routeMessage tx is undefined", () => __awaiter(void 0, void 0, void 0, function* () {
            vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValue({
                call: { returnValues: { payload: "payload", messageId: "messageID" } },
            });
            vitest.spyOn(api, "routeMessageRequest").mockRejectedValue("any");
            const result = yield api.manualRelayToDestChain("0xtest");
            expect(result.success).toBeFalsy();
            expect(result.error).toContain("RouteMessage");
        }));
        test("it should return error if the signAndApproveGateway is not success", () => __awaiter(void 0, void 0, void 0, function* () {
            vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValue({
                call: { returnValues: { payload: "payload", messageId: "messageID" } },
            });
            vitest.spyOn(api, "routeMessageRequest").mockResolvedValue((0, stubs_1.axelarTxResponseStub)());
            vitest.spyOn(api, "signAndApproveGateway").mockResolvedValue({
                success: false,
                error: "any",
            });
            const result = yield api.manualRelayToDestChain("0xtest");
            expect(result.success).toBeFalsy();
            expect(result.error).toBe("any");
        }));
        test("it should return success response if the signAndApproveGateway is success", () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValue({
                call: {
                    returnValues: {
                        payload: "payload",
                        messageId: "messageID",
                        destinationChain: "avalanche",
                    },
                },
                command_id: "commandID",
            });
            const mockRouteMesssageRequest = vitest
                .spyOn(api, "routeMessageRequest")
                .mockResolvedValue((0, stubs_1.axelarTxResponseStub)());
            const mockSignAndApproveGateway = vitest
                .spyOn(api, "signAndApproveGateway")
                .mockResolvedValue({
                success: true,
                signCommandTx: (0, stubs_1.axelarTxResponseStub)(),
                infoLogs: ["log"],
            });
            const result = yield api.manualRelayToDestChain("0xtest");
            expect(mockRouteMesssageRequest).toHaveBeenLastCalledWith("messageID", "payload", -1);
            expect(mockSignAndApproveGateway).toHaveBeenLastCalledWith("commandID", "avalanche", {
                useWindowEthereum: true,
            });
            expect(result.success).toBeTruthy();
            expect(result.signCommandTx).toBeDefined();
            expect((_a = result.infoLogs) === null || _a === void 0 ? void 0 : _a.length).toEqual(2);
            expect(result.routeMessageTx).toEqual((0, stubs_1.axelarTxResponseStub)());
        }));
    });
    describe("doesTxMeetConfirmHt", () => {
        const api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.TESTNET });
        beforeEach(() => {
            vitest.clearAllMocks();
            vitest.spyOn(api, "getSigner").mockReturnValue({
                provider: {
                    getTransactionReceipt: () => Promise.resolve({ confirmations: 10 }),
                },
            });
        });
        test("it should return true if the given transaction hash has enough confirmation", () => __awaiter(void 0, void 0, void 0, function* () {
            const isConfirmed = yield api.doesTxMeetConfirmHt("ethereum-2", "0xinsufficient");
            expect(isConfirmed).toBeFalsy();
        }));
        test("it should return false if the given transaction hash does not have enough confirmation", () => __awaiter(void 0, void 0, void 0, function* () {
            const isConfimed = yield api.doesTxMeetConfirmHt("avalanche", "0xsufficient");
            expect(isConfimed).toBeTruthy();
        }));
    });
    describe("recoverEvmToEvmTx", () => {
        const api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.TESTNET });
        beforeEach(() => {
            // Prevent sleep while testing
            vitest.clearAllMocks();
            const mockSleep = vitest.spyOn(Sleep, "sleep");
            mockSleep.mockImplementation(() => Promise.resolve(undefined));
        });
        test("it shouldn't call approve given the gmp status cannot be fetched", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
            mockQueryTransactionStatus.mockResolvedValueOnce({ status: AxelarRecoveryApi_1.GMPStatus.CANNOT_FETCH_STATUS });
            const response = yield api.manualRelayToDestChain("0x");
            expect(response).toEqual({
                success: false,
                error: types_1.ApproveGatewayError.FETCHING_STATUS_FAILED,
            });
        }));
        test("it should fail if the evm event cannot be retrieved", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
            mockQueryTransactionStatus.mockResolvedValueOnce({
                status: AxelarRecoveryApi_1.GMPStatus.SRC_GATEWAY_CALLED,
                callTx: {
                    chain: EvmChain_1.EvmChain.AVALANCHE,
                    returnValues: { destinationChain: EvmChain_1.EvmChain.MOONBEAM },
                },
            });
            vitest.spyOn(api, "doesTxMeetConfirmHt").mockReturnValue(Promise.resolve(true));
            const res = yield api.manualRelayToDestChain("0x");
            expect(res).toBeTruthy();
            expect(res === null || res === void 0 ? void 0 : res.success).toBeFalsy();
            expect(res === null || res === void 0 ? void 0 : res.error).toEqual("findEventAndConfirmIfNeeded(): could not confirm transaction on Axelar");
        }));
        test("it should fail if it confirms the tx and event still incomplete", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
            mockQueryTransactionStatus.mockResolvedValueOnce({
                status: AxelarRecoveryApi_1.GMPStatus.SRC_GATEWAY_CALLED,
                callTx: {
                    chain: EvmChain_1.EvmChain.AVALANCHE,
                    returnValues: { destinationChain: EvmChain_1.EvmChain.MOONBEAM },
                },
            });
            const mockFindEventAndConfirmIfNeeded = vitest.spyOn(api, "findEventAndConfirmIfNeeded");
            mockFindEventAndConfirmIfNeeded.mockResolvedValueOnce({
                success: false,
                errorMessage: `findEventAndConfirmIfNeeded(): could not confirm event successfully`,
                commandId: "",
                eventResponse: {},
                infoLogs: [""],
            });
            const mockGetEvmEvent = vitest.spyOn(api, "getEvmEvent");
            mockGetEvmEvent.mockResolvedValueOnce((0, stubs_1.evmEventStubResponse)());
            const res = yield api.manualRelayToDestChain("0x");
            expect(res).toBeTruthy();
            expect(res === null || res === void 0 ? void 0 : res.success).toBeFalsy();
            expect(res === null || res === void 0 ? void 0 : res.error).toEqual(`findEventAndConfirmIfNeeded(): could not confirm event successfully`);
        }));
        test("it should fail if it has an issue finding the batch and trying to sign", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
            mockQueryTransactionStatus.mockResolvedValueOnce({
                status: AxelarRecoveryApi_1.GMPStatus.SRC_GATEWAY_CALLED,
                callTx: {
                    chain: EvmChain_1.EvmChain.AVALANCHE,
                    returnValues: { destinationChain: EvmChain_1.EvmChain.MOONBEAM },
                },
            });
            const mockFindBatchAndSignIfNeeded = vitest.spyOn(api, "findBatchAndSignIfNeeded");
            mockFindBatchAndSignIfNeeded.mockResolvedValueOnce({
                success: false,
                errorMessage: "findBatchAndSignIfNeeded(): issue retrieving and signing command data",
                signCommandTx: undefined,
                infoLogs: [],
            });
            const mockGetEvmEvent = vitest.spyOn(api, "getEvmEvent");
            mockGetEvmEvent.mockResolvedValueOnce((0, stubs_1.evmEventStubResponse)());
            const res = yield api.manualRelayToDestChain("0x", undefined, undefined, undefined, false);
            expect(res).toBeTruthy();
            expect(res === null || res === void 0 ? void 0 : res.success).toBeFalsy();
            expect(res === null || res === void 0 ? void 0 : res.error).toEqual("findBatchAndSignIfNeeded(): issue retrieving and signing command data");
        }));
        test("it should fail if it has an issue finding the batch and trying to broadcast", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
            mockQueryTransactionStatus.mockResolvedValueOnce({
                status: AxelarRecoveryApi_1.GMPStatus.SRC_GATEWAY_CALLED,
                callTx: {
                    chain: EvmChain_1.EvmChain.AVALANCHE,
                    returnValues: { destinationChain: EvmChain_1.EvmChain.MOONBEAM },
                },
            });
            const mockFindEventAndConfirmIfNeeded = vitest.spyOn(api, "findEventAndConfirmIfNeeded");
            mockFindEventAndConfirmIfNeeded.mockResolvedValueOnce({
                success: true,
                errorMessage: "",
                commandId: "",
                eventResponse: {},
                confirmTx: {},
                infoLogs: [""],
            });
            const mockFindBatchAndSignIfNeeded = vitest.spyOn(api, "findBatchAndSignIfNeeded");
            mockFindBatchAndSignIfNeeded.mockResolvedValueOnce({
                success: true,
                errorMessage: "",
                signCommandTx: undefined,
                infoLogs: [],
            });
            const mockfindBatchAndApproveGateway = vitest.spyOn(api, "findBatchAndApproveGateway");
            mockfindBatchAndApproveGateway.mockResolvedValueOnce({
                success: false,
                errorMessage: "findBatchAndApproveGateway(): unable to retrieve command ID",
                approveTx: {},
                infoLogs: [],
            });
            const mockGetEvmEvent = vitest.spyOn(api, "getEvmEvent");
            mockGetEvmEvent.mockResolvedValueOnce((0, stubs_1.evmEventStubResponse)());
            const res = yield api.manualRelayToDestChain("0x", undefined, undefined, undefined, false);
            expect(res).toBeTruthy();
            expect(res === null || res === void 0 ? void 0 : res.success).toBeFalsy();
            expect(res === null || res === void 0 ? void 0 : res.error).toEqual(`findBatchAndApproveGateway(): unable to retrieve command ID`);
        }));
        test("it should call approve successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
            mockQueryTransactionStatus.mockResolvedValueOnce({
                status: AxelarRecoveryApi_1.GMPStatus.SRC_GATEWAY_CALLED,
                callTx: {
                    chain: EvmChain_1.EvmChain.AVALANCHE,
                    returnValues: { destinationChain: EvmChain_1.EvmChain.MOONBEAM },
                },
            });
            vitest.spyOn(api, "getEvmEvent").mockResolvedValueOnce((0, stubs_1.evmEventStubResponse)());
            const mockFindEventAndConfirmIfNeeded = vitest
                .spyOn(api, "findEventAndConfirmIfNeeded")
                .mockResolvedValueOnce((0, stubs_1.findEventAndConfirmStub)());
            const mockSignAndApproveGateway = vitest
                .spyOn(api, "signAndApproveGateway")
                .mockResolvedValue({
                success: true,
                signCommandTx: (0, stubs_1.axelarTxResponseStub)(),
                approveTx: (0, stubs_1.axelarTxResponseStub)(),
                infoLogs: ["log"],
            });
            const response = yield api.manualRelayToDestChain("0x", undefined, undefined, undefined, false);
            expect(mockFindEventAndConfirmIfNeeded).toHaveBeenCalled();
            expect(mockSignAndApproveGateway).toHaveBeenCalled();
            expect(response.success).toBeTruthy();
            expect(response.confirmTx).toBeDefined();
            expect(response.signCommandTx).toBeDefined();
            expect(response.approveTx).toBeDefined();
            expect((_a = response.infoLogs) === null || _a === void 0 ? void 0 : _a.length).greaterThan(2);
        }));
    });
    describe("getCidFromSrcTxHash", () => {
        const mainnetApi = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.MAINNET });
        // https://axelarscan.io/gmp/0x3828bf893801f337e08d15b89efc9c3c2d9196fe7f83f3b7640425b24d122cb2:12
        it("should return the correct commandId from evm -> evm for ContractCallWithToken event", () => {
            expect(mainnetApi.getCidFromSrcTxHash("celo", "0x3828bf893801f337e08d15b89efc9c3c2d9196fe7f83f3b7640425b24d122cb2", 8)).toEqual("0xa45da101fcfed541b8251cb8a288b5b7dd84086377eb9cf3f8d4a99f11e062e0");
        });
        // https://axelarscan.io/gmp/0x92f676751feccab46a048a16aaf81b26620a3683933b56a722ce742de8ea7429:349
        it("should return the correct commandId from evm -> evm for ContractCall event", () => {
            expect(mainnetApi.getCidFromSrcTxHash("blast", "0x92f676751feccab46a048a16aaf81b26620a3683933b56a722ce742de8ea7429-5", 5)).toEqual("0xe6868c6e94240fa6a37cc71d265106a00ad8fa0652319f145e3235f703046574");
        });
    });
    describe.skip("calculateNativeGasFee", () => {
        const api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.TESTNET });
        let contract;
        let userWallet;
        let usdc;
        let provider;
        const tokenSymbol = "aUSDC";
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create a source chain network
            const srcChain = yield (0, axelar_local_dev_1.createNetwork)({ name: EvmChain_1.EvmChain.AVALANCHE });
            userWallet = srcChain.adminWallets[0];
            provider = srcChain.provider;
            const args = [srcChain.gateway.address, srcChain.gasReceiver.address];
            // Deploy test contract
            contract = yield axelar_local_dev_1.utils.deployContract(userWallet, DistributionExecutable_json_1.default, args);
            usdc = yield srcChain.deployToken("Axelar Wrapped aUSDC", "aUSDC", 6, BigInt(1e70));
            // Send USDC to the user wallet for testing
            yield srcChain.giveToken(userWallet.address, tokenSymbol, BigInt("10000000"));
            // Approve token before running any test
            yield usdc
                .connect(userWallet)
                .approve(contract.address, ethers_1.ethers.constants.MaxUint256)
                .then((tx) => tx.wait(1));
            vitest.spyOn(api.axelarQueryApi, "getActiveChains").mockResolvedValue((0, stubs_1.activeChainsStub)());
        }));
        test("it should return 'gas required' - 'gas paid' given 'gas required' > 'gas paid'", () => __awaiter(void 0, void 0, void 0, function* () {
            const gasPaid = ethers_1.ethers.utils.parseEther("1");
            const gasRequired = ethers_1.ethers.utils.parseEther("2");
            // Send transaction at the source chain with some gas.
            const tx = yield contract
                .connect(userWallet)
                .sendToMany(EvmChain_1.EvmChain.MOONBEAM, ethers_1.ethers.constants.AddressZero, [ethers_1.ethers.constants.AddressZero], tokenSymbol, "10000", {
                value: gasPaid,
            })
                .then((tx) => tx.wait());
            vitest
                .spyOn(api.axelarQueryApi, "estimateGasFee")
                .mockResolvedValueOnce(gasRequired.toString());
            vitest.spyOn(api.axelarQueryApi, "getActiveChains").mockResolvedValueOnce((0, stubs_1.activeChainsStub)());
            // Calculate how many gas we need to add more.
            const wantedGasFee = yield api.calculateNativeGasFee(tx.transactionHash, EvmChain_1.EvmChain.AVALANCHE, EvmChain_1.EvmChain.MOONBEAM, 700000, { provider });
            return expect(wantedGasFee).toBe(gasRequired.sub(gasPaid).toString());
        }));
        test("it should return 0 given 'gas paid' >= 'gas required'", () => __awaiter(void 0, void 0, void 0, function* () {
            const gasPaid = ethers_1.ethers.utils.parseEther("10");
            const gasRequired = ethers_1.ethers.utils.parseEther("2");
            // Send transaction at the source chain with overpaid gas.
            const tx = yield contract
                .connect(userWallet)
                .sendToMany(EvmChain_1.EvmChain.MOONBEAM, ethers_1.ethers.constants.AddressZero, [ethers_1.ethers.constants.AddressZero], tokenSymbol, "10000", {
                value: gasPaid,
            })
                .then((tx) => tx.wait());
            vitest
                .spyOn(api.axelarQueryApi, "estimateGasFee")
                .mockResolvedValueOnce(gasRequired.toString());
            // Calculate how many gas we need to add more.
            const wantedGasFee = yield api.calculateNativeGasFee(tx.transactionHash, EvmChain_1.EvmChain.AVALANCHE, EvmChain_1.EvmChain.MOONBEAM, 700000, { provider });
            return expect(wantedGasFee).toBe("0");
        }));
    });
    describe.skip("addNativeGas", () => {
        let api;
        let contract;
        let userWallet;
        let provider;
        let gasReceiverContract;
        let usdc;
        let addNativeGasOptions;
        const chain = EvmChain_1.EvmChain.AVALANCHE;
        const tokenSymbol = "aUSDC";
        beforeEach(() => {
            api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.TESTNET });
            vitest.clearAllMocks();
            vitest
                .spyOn(api.axelarQueryApi, "getContractAddressFromConfig")
                .mockResolvedValue(gasReceiverContract.address);
            vitest.spyOn(api.axelarQueryApi, "getActiveChains").mockResolvedValue((0, stubs_1.activeChainsStub)());
        });
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create a source chain network
            const srcChain = yield (0, axelar_local_dev_1.createNetwork)({ name: chain });
            gasReceiverContract = srcChain.gasReceiver;
            userWallet = srcChain.adminWallets[0];
            provider = srcChain.provider;
            usdc = yield (yield srcChain.deployToken("Axelar Wrapped aUSDC", "aUSDC", 6, BigInt(1e70))).connect(userWallet);
            // Override the provider and wallet to use data from the local network
            addNativeGasOptions = {
                evmWalletDetails: {
                    useWindowEthereum: false,
                    privateKey: userWallet.privateKey,
                    provider,
                },
            };
            const args = [srcChain.gateway.address, srcChain.gasReceiver.address];
            // Deploy test contract
            contract = yield axelar_local_dev_1.utils
                .deployContract(userWallet, DistributionExecutable_json_1.default, args)
                .then((contract) => contract.connect(userWallet));
            // Send USDC to the user wallet for testing
            yield srcChain.giveToken(userWallet.address, tokenSymbol, BigInt("10000000"));
            // Approve token before running any test
            yield usdc
                .approve(contract.address, ethers_1.ethers.constants.MaxUint256)
                .then((tx) => tx.wait(1));
        }));
        test("it shouldn't call 'addNativeGas' given tx is already executed", () => __awaiter(void 0, void 0, void 0, function* () {
            const gasPaid = ethers_1.ethers.utils.parseEther("0.000001");
            // Send transaction at the source chain with some gas.
            const tx = yield contract
                .sendToMany(EvmChain_1.EvmChain.MOONBEAM, ethers_1.ethers.constants.AddressZero, [ethers_1.ethers.constants.AddressZero], tokenSymbol, "10000", {
                value: gasPaid,
            })
                .then((tx) => tx.wait());
            // Mock that this transaction is already executed.
            vitest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(true));
            // Call addNativeGas function
            const response = yield api.addNativeGas(EvmChain_1.EvmChain.AVALANCHE, tx.transactionHash, 700000, addNativeGasOptions);
            expect(response).toEqual((0, error_1.AlreadyExecutedError)());
        }));
        test("it shouldn't call 'addNativeGas' given tx doesn't exist", () => __awaiter(void 0, void 0, void 0, function* () {
            // Override the provider and wallet to use data from the local network
            const addNativeGasOptions = {
                evmWalletDetails: {
                    useWindowEthereum: false,
                    privateKey: userWallet.privateKey,
                    provider,
                },
            };
            // Call addNativeGas function by passing non-existing tx hash
            const response = yield api.addNativeGas(chain, "0xcd1edb36c37caadf852c4614e3bed1082528d7c6a8d2de3fff3c596f8e675b90", // random tx hash
            700000, addNativeGasOptions);
            // Validate response
            expect(response).toEqual((0, error_1.InvalidTransactionError)(chain));
        }));
        test("it shouldn't call 'addNativeGas' given tx is not gmp call", () => __awaiter(void 0, void 0, void 0, function* () {
            // Sending non-gmp transaction
            const notGmpTx = yield usdc
                .transfer("0x0000000000000000000000000000000000000001", "1")
                .then((tx) => tx.wait());
            // Call addNativeGas function and passing non-gmp tx hash
            const response = yield api.addNativeGas(chain, notGmpTx.transactionHash, // random tx hash
            700000, addNativeGasOptions);
            // Validate response
            expect(response).toEqual((0, error_1.NotGMPTransactionError)());
        }));
        test("it shouldn't call 'addNativeGas' given gas is already overpaid", () => __awaiter(void 0, void 0, void 0, function* () {
            const gasPaid = ethers_1.ethers.utils.parseEther("10");
            // Send transaction at the source chain with overpaid gas
            const tx = yield contract
                .sendToMany(EvmChain_1.EvmChain.MOONBEAM, ethers_1.ethers.constants.AddressZero, [ethers_1.ethers.constants.AddressZero], tokenSymbol, "10000", {
                value: gasPaid,
            })
                .then((tx) => tx.wait());
            vitest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(false));
            vitest.spyOn(api.axelarQueryApi, "estimateGasFee").mockResolvedValueOnce(gasPaid.toString());
            // Call addNativeGas function
            const response = yield api.addNativeGas(chain, tx.transactionHash, 700000, addNativeGasOptions);
            expect(response).toEqual((0, error_1.AlreadyPaidGasFeeError)());
        }));
        test("it shouldn't call 'addNativeGas' given gasPrice api is not available and gas amount is not specified", () => __awaiter(void 0, void 0, void 0, function* () {
            // Override the provider and wallet to use data from the local network
            const addNativeGasOptions = {
                evmWalletDetails: {
                    useWindowEthereum: false,
                    privateKey: userWallet.privateKey,
                    provider,
                },
            };
            const gasPaid = ethers_1.ethers.utils.parseEther("10");
            // Send transaction at the source chain with overpaid gas
            const tx = yield contract
                .connect(userWallet)
                .sendToMany(EvmChain_1.EvmChain.MOONBEAM, ethers_1.ethers.constants.AddressZero, [ethers_1.ethers.constants.AddressZero], tokenSymbol, "10000", {
                value: gasPaid,
            })
                .then((tx) => tx.wait());
            // Simulate gasPrice api error
            vitest
                .spyOn(api.axelarQueryApi, "estimateGasFee")
                .mockRejectedValueOnce(() => Promise.reject());
            vitest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(false));
            // Call addNativeGas function
            const response = yield api.addNativeGas(chain, // Passing wrong value here will cause the gas price api to return error
            tx.transactionHash, 700000, addNativeGasOptions);
            expect(response.success).toBe(false);
            expect(response.error).toBe("Couldn't query the gas price");
        }));
        test("it should call 'addNativeGas' with specified amount in 'options' object without calling 'calculateNativeGasFee' function", () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const gasPaid = ethers_1.ethers.utils.parseEther("1");
            const tx = yield contract
                .sendToMany(EvmChain_1.EvmChain.MOONBEAM, ethers_1.ethers.constants.AddressZero, [ethers_1.ethers.constants.AddressZero], tokenSymbol, "10000", {
                value: gasPaid,
            })
                .then((tx) => tx.wait());
            const manualAddedGasAmount = ethers_1.ethers.utils.parseEther("2");
            // Manually specify gas amount
            const overpaidAddNativeGasOptions = Object.assign(Object.assign({}, addNativeGasOptions), { amount: manualAddedGasAmount.toString() });
            // Mock that this transaction is already executed.
            vitest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(false));
            const calculateNativeGasFeeFunction = vitest
                .spyOn(api, "calculateNativeGasFee")
                .mockResolvedValueOnce("9");
            // Call addNativeGas function
            const response = yield api.addNativeGas(chain, tx.transactionHash, 700000, overpaidAddNativeGasOptions);
            const signatureNativeGasAdded = ethers_1.ethers.utils.id("NativeGasAdded(bytes32,uint256,uint256,address)");
            const nativeGasAddedEvent = (0, helpers_1.findContractEvent)(response.transaction, [signatureNativeGasAdded], new utils_1.Interface([
                "event NativeGasAdded(bytes32 indexed txHash,  uint256 indexed logIndex, uint256 gasFeeAmount, address refundAddress)",
            ]));
            // Validate event data
            const args = nativeGasAddedEvent === null || nativeGasAddedEvent === void 0 ? void 0 : nativeGasAddedEvent.eventLog.args;
            const eventGasFeeAmount = (_a = args === null || args === void 0 ? void 0 : args.gasFeeAmount) === null || _a === void 0 ? void 0 : _a.toString();
            expect(calculateNativeGasFeeFunction).not.toHaveBeenCalled();
            expect(response.success).toBe(true);
            // Validate that the additional gas fee is equal to "total gas fee" - "gas paid".
            expect(eventGasFeeAmount).toBe(manualAddedGasAmount.toString());
        }));
        test("it should call 'addNativeGas' successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const gasPaid = ethers_1.ethers.utils.parseEther("1");
            // Send transaction at the source chain with some gas.
            const tx = yield contract
                .sendToMany(EvmChain_1.EvmChain.MOONBEAM, ethers_1.ethers.constants.AddressZero, [ethers_1.ethers.constants.AddressZero], tokenSymbol, "10000", {
                value: gasPaid,
            })
                .then((tx) => tx.wait());
            // Mock that this transaction is already executed.
            vitest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(false));
            // Mock the this transaction requires 2 ETH gas to be paid.
            const mockedGasFee = ethers_1.ethers.utils.parseEther("2").toString();
            vitest.spyOn(api.axelarQueryApi, "estimateGasFee").mockResolvedValueOnce(mockedGasFee);
            // Call addNativeGas function
            const response = yield api.addNativeGas(chain, tx.transactionHash, 700000, addNativeGasOptions);
            // Validate response structure
            expect(response.success).toBe(true);
            expect(response.transaction).toBeDefined();
            const signatureNativeGasAdded = ethers_1.ethers.utils.id("NativeGasAdded(bytes32,uint256,uint256,address)");
            const nativeGasAddedEvent = (0, helpers_1.findContractEvent)(response.transaction, [signatureNativeGasAdded], new utils_1.Interface([
                "event NativeGasAdded(bytes32 indexed txHash, uint256 indexed logIndex, uint256 gasFeeAmount, address refundAddress)",
            ]));
            // Calculate how many gas we need to add more.
            const expectedLogIndex = (0, helpers_1.getLogIndexFromTxReceipt)(tx);
            // Validate event data
            const args = nativeGasAddedEvent === null || nativeGasAddedEvent === void 0 ? void 0 : nativeGasAddedEvent.eventLog.args;
            const eventGasFeeAmount = (_a = args === null || args === void 0 ? void 0 : args.gasFeeAmount) === null || _a === void 0 ? void 0 : _a.toString();
            expect((_b = args === null || args === void 0 ? void 0 : args.logIndex) === null || _b === void 0 ? void 0 : _b.toNumber()).toBe(expectedLogIndex);
            // Validate that the additional gas fee is equal to "total gas fee" - "gas paid".
            expect(eventGasFeeAmount).toBe(ethers_1.ethers.BigNumber.from(mockedGasFee).sub(gasPaid).toString());
            expect(args === null || args === void 0 ? void 0 : args.refundAddress).toBe(userWallet.address);
        }));
    });
    describe("addGasToSuiChain", () => {
        const network = "testnet";
        // The default rpc url for testnet doesn't work as of 07 November 2024, so we need to use a custom one for testing.
        const api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.DEVNET });
        const testRpcUrl = "https://sui-testnet-rpc.publicnode.com";
        const suiClient = new client_1.SuiClient({
            url: testRpcUrl,
        });
        const keypair = secp256k1_1.Secp256k1Keypair.deriveKeypair("test test test test test test test test test test test junk");
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            vitest.clearAllMocks();
            console.log("Sui Wallet address", keypair.toSuiAddress());
            const balance = yield suiClient.getBalance({
                owner: keypair.toSuiAddress(),
            });
            // If the balance is less than 0.2 SUI, request funds from the faucet.
            // This is to avoid too many requests error.
            if (BigInt(balance.totalBalance) < 2e8) {
                console.log("Requesting faucet funds...");
                yield (0, faucet_1.requestSuiFromFaucetV0)({
                    host: (0, faucet_1.getFaucetHost)(network),
                    recipient: keypair.toSuiAddress(),
                });
            }
        }), 15000);
        test("addGasToSuiChain should work given valid params", () => __awaiter(void 0, void 0, void 0, function* () {
            const tx = yield api.addGasToSuiChain({
                gasParams: "0x",
                messageId: "test-1",
                refundAddress: keypair.toSuiAddress(),
            });
            const response = yield suiClient.signAndExecuteTransaction({
                transaction: tx,
                signer: keypair,
                options: {
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: true,
                },
            });
            expect(response.events).toBeDefined();
            expect(response.events.length).toBeGreaterThan(0);
            expect(response.events[0].type).toContain("GasAdded");
        }));
    });
    describe.skip("addGas", () => {
        let api;
        let contract;
        let userWallet;
        let provider;
        let gasReceiverContract;
        let usdc;
        const chain = EvmChain_1.EvmChain.AVALANCHE;
        const tokenSymbol = "aUSDC";
        // Override the provider and wallet to use data from the local network
        let addGasOptions;
        beforeEach(() => {
            vitest.clearAllMocks();
            api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.TESTNET });
            vitest
                .spyOn(api.axelarQueryApi, "getContractAddressFromConfig")
                .mockResolvedValueOnce(gasReceiverContract.address);
            vitest.spyOn(api.axelarQueryApi, "getActiveChains").mockResolvedValue((0, stubs_1.activeChainsStub)());
        });
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create a source chain network
            const srcChain = yield (0, axelar_local_dev_1.createNetwork)({ name: chain });
            gasReceiverContract = srcChain.gasReceiver;
            userWallet = srcChain.adminWallets[0];
            provider = srcChain.provider;
            usdc = yield srcChain
                .deployToken("Axelar Wrapped aUSDC", "aUSDC", 6, BigInt(1e70))
                .then((usdc) => usdc.connect(userWallet));
            addGasOptions = {
                evmWalletDetails: {
                    useWindowEthereum: false,
                    privateKey: userWallet.privateKey,
                    provider,
                },
            };
            const args = [srcChain.gateway.address, srcChain.gasReceiver.address];
            // Deploy test contract
            contract = yield axelar_local_dev_1.utils
                .deployContract(userWallet, DistributionExecutableGasToken_json_1.default, args)
                .then((contract) => contract.connect(userWallet));
            // Send USDC to the user wallet for testing
            yield srcChain.giveToken(userWallet.address, tokenSymbol, BigInt(ethers_1.ethers.utils.parseEther("1000000").toString()));
            // Approve token before running any test
            yield usdc
                .approve(contract.address, ethers_1.ethers.constants.MaxUint256)
                .then((tx) => tx.wait(1));
            yield usdc
                .approve(gasReceiverContract.address, ethers_1.ethers.constants.MaxUint256)
                .then((tx) => tx.wait(1));
            // This is a hacky way to set the gateway object to local gateway contract address
            AxelarGateway_1.AXELAR_GATEWAY[types_1.Environment.TESTNET][chain] = srcChain.gateway.address;
        }));
        test("it shouldn't call 'addGas' given tx is already executed", () => __awaiter(void 0, void 0, void 0, function* () {
            const amount = ethers_1.ethers.utils.parseEther("0.0001");
            const gasPaid = ethers_1.ethers.utils.parseEther("0.000001");
            // Send transaction at the source chain with some gas.
            const tx = yield contract
                .sendToMany(EvmChain_1.EvmChain.MOONBEAM, ethers_1.ethers.constants.AddressZero, [ethers_1.ethers.constants.AddressZero], tokenSymbol, amount, usdc.address, gasPaid)
                .then((tx) => tx.wait());
            // Mock that this transaction is already executed.
            vitest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(true));
            // Call addGas function
            const response = yield api.addGas(EvmChain_1.EvmChain.AVALANCHE, tx.transactionHash, usdc.address, 700000, addGasOptions);
            expect(response).toEqual((0, error_1.AlreadyExecutedError)());
        }));
        test("it shouldn't call 'addGas' given tx doesn't exist", () => __awaiter(void 0, void 0, void 0, function* () {
            // Call addNativeGas function by passing non-existing tx hash
            const response = yield api.addGas(chain, "0xcd1edb36c37caadf852c4614e3bed1082528d7c6a8d2de3fff3c596f8e675b90", // random tx hash
            usdc.address, 700000, addGasOptions);
            // Validate response
            expect(response).toEqual((0, error_1.InvalidTransactionError)(chain));
        }));
        test("it shouldn't call 'addGas' given tx is not gmp call", () => __awaiter(void 0, void 0, void 0, function* () {
            // Sending non-gmp transaction
            const notGmpTx = yield usdc
                .transfer("0x0000000000000000000000000000000000000001", "1")
                .then((tx) => tx.wait());
            // Call addNativeGas function and passing non-gmp tx hash
            const response = yield api.addGas(chain, notGmpTx.transactionHash, // random tx hash
            usdc.address, 700000, addGasOptions);
            // Validate response
            expect(response).toEqual((0, error_1.NotGMPTransactionError)());
        }));
        test("it shouldn't call 'addGas' given gas is already overpaid", () => __awaiter(void 0, void 0, void 0, function* () {
            const decimals = yield usdc.decimals();
            const gasPaid = ethers_1.ethers.utils.parseUnits("100", decimals);
            // Send transaction at the source chain with overpaid gas
            const tx = yield contract
                .connect(userWallet)
                .sendToMany(EvmChain_1.EvmChain.MOONBEAM, ethers_1.ethers.constants.AddressZero, [ethers_1.ethers.constants.AddressZero], tokenSymbol, "10000", usdc.address, gasPaid)
                .then((tx) => tx.wait());
            vitest.spyOn(api, "isExecuted").mockResolvedValueOnce(false);
            // Mock total gas fee is 0.1 USDC
            vitest
                .spyOn(api.axelarQueryApi, "estimateGasFee")
                .mockResolvedValue(ethers_1.ethers.utils.parseUnits("0.1", decimals).toString());
            // Call addGas function
            const response = yield api.addGas(chain, tx.transactionHash, usdc.address, 700000, addGasOptions);
            expect(response).toEqual((0, error_1.AlreadyPaidGasFeeError)());
        }));
        test("it shouldn't call 'addGas' given gasPrice api is not available and gas amount is not specified", () => __awaiter(void 0, void 0, void 0, function* () {
            const gasPaid = ethers_1.ethers.utils.parseEther("10");
            // Send transaction at the source chain with overpaid gas
            const tx = yield contract
                .sendToMany(EvmChain_1.EvmChain.MOONBEAM, ethers_1.ethers.constants.AddressZero, [ethers_1.ethers.constants.AddressZero], tokenSymbol, "10000", usdc.address, gasPaid)
                .then((tx) => tx.wait());
            vitest.spyOn(api, "isExecuted").mockResolvedValueOnce(false);
            // Simulate gasPrice api error
            vitest
                .spyOn(api.axelarQueryApi, "estimateGasFee")
                .mockRejectedValueOnce("unable to fetch gas price");
            // Call addNativeGas function
            const response = yield api.addGas(chain, // Passing wrong value here will cause the gas price api to return error
            tx.transactionHash, usdc.address, 700000, addGasOptions);
            expect(response).toEqual((0, error_1.GasPriceAPIError)());
        }));
        test("it shouldn't call 'addGas' given 'gasTokenAddress' does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const gasPaid = ethers_1.ethers.utils.parseEther("0.00001");
            // Send transaction at the source chain with overpaid gas
            const tx = yield contract
                .sendToMany(EvmChain_1.EvmChain.MOONBEAM, ethers_1.ethers.constants.AddressZero, [ethers_1.ethers.constants.AddressZero], tokenSymbol, "10000", usdc.address, gasPaid)
                .then((tx) => tx.wait());
            // Simulate gasPrice api error
            vitest
                .spyOn(api.axelarQueryApi, "estimateGasFee")
                .mockRejectedValueOnce(() => Promise.reject());
            // Call addGas function
            const response = yield api.addGas(chain, tx.transactionHash, ethers_1.ethers.constants.AddressZero, 700000, addGasOptions);
            expect(response).toEqual((0, error_1.InvalidGasTokenError)());
        }));
        test("it shouldn't call 'addGas' given `gasTokenAddress` is not supported by Axelar", () => __awaiter(void 0, void 0, void 0, function* () {
            const testToken = yield axelar_local_dev_1.utils
                .deployContract(userWallet, TestToken_json_1.default, ["100000000000"])
                .then((contract) => contract.connect(userWallet));
            const gasPaid = ethers_1.ethers.utils.parseEther("0.00001");
            // Send transaction at the source chain with overpaid gas
            const tx = yield contract
                .sendToMany(EvmChain_1.EvmChain.MOONBEAM, ethers_1.ethers.constants.AddressZero, [ethers_1.ethers.constants.AddressZero], tokenSymbol, "10000", usdc.address, gasPaid)
                .then((tx) => tx.wait());
            // Simulate gasPrice api error
            vitest
                .spyOn(api.axelarQueryApi, "estimateGasFee")
                .mockRejectedValueOnce(() => Promise.reject());
            // Call addGas function
            const response = yield api.addGas(chain, tx.transactionHash, testToken.address, 700000, addGasOptions);
            expect(response).toEqual((0, error_1.UnsupportedGasTokenError)(testToken.address));
        }));
        test("it should call 'addGas' with specified amount in 'options' object without calling 'calculateGasFee' function", () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const gasPaid = ethers_1.ethers.utils.parseEther("0.00001");
            // Send transaction at the source chain with overpaid gas
            const tx = yield contract
                .sendToMany(EvmChain_1.EvmChain.MOONBEAM, ethers_1.ethers.constants.AddressZero, [ethers_1.ethers.constants.AddressZero], tokenSymbol, "10000", usdc.address, gasPaid)
                .then((tx) => tx.wait());
            // Override the amount, so it should call contract's addGas even the gas price api returns error
            const overridedAddGasOptions = Object.assign(Object.assign({}, addGasOptions), { amount: ethers_1.ethers.utils.parseEther("10").toString() });
            vitest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(false));
            const calculateGasFeeFunction = vitest.spyOn(api, "calculateGasFee");
            // Call addGas function
            const response = yield api.addGas(chain, tx.transactionHash, usdc.address, 700000, overridedAddGasOptions);
            expect(response.success).toBe(true);
            expect(calculateGasFeeFunction).not.toHaveBeenCalled();
            // Validate event data
            const signatureGasAdded = ethers_1.ethers.utils.id("GasAdded(bytes32,uint256,address,uint256,address)");
            const gasAddedEvent = (0, helpers_1.findContractEvent)(response.transaction, [signatureGasAdded], new utils_1.Interface([
                "event GasAdded(bytes32 indexed txHash, uint256 indexed logIndex, address gasToken, uint256 gasFeeAmount, address refundAddress)",
            ]));
            const args = gasAddedEvent === null || gasAddedEvent === void 0 ? void 0 : gasAddedEvent.eventLog.args;
            const eventGasFeeAmount = (_a = args === null || args === void 0 ? void 0 : args.gasFeeAmount) === null || _a === void 0 ? void 0 : _a.toString();
            expect(eventGasFeeAmount).toBe(overridedAddGasOptions.amount);
        }));
        test("it should call 'addGas' successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const gasPaid = ethers_1.ethers.utils.parseEther("1");
            // Send transaction at the source chain with some gas.
            const tx = yield contract
                .sendToMany(EvmChain_1.EvmChain.MOONBEAM, ethers_1.ethers.constants.AddressZero, [ethers_1.ethers.constants.AddressZero], tokenSymbol, "10000", usdc.address, gasPaid)
                .then((tx) => tx.wait());
            vitest.spyOn(api, "isExecuted").mockResolvedValueOnce(false);
            const mockedGasFee = ethers_1.ethers.utils.parseEther("2").toString();
            vitest.spyOn(api.axelarQueryApi, "estimateGasFee").mockResolvedValue(mockedGasFee);
            // Call addGas function
            const response = yield api.addGas(chain, tx.transactionHash, usdc.address, 700000, addGasOptions);
            // Validate response structure
            expect(response.success).toBe(true);
            expect(response.transaction).toBeDefined();
            const signatureGasAdded = ethers_1.ethers.utils.id("GasAdded(bytes32,uint256,address,uint256,address)");
            const gasAddedEvent = (0, helpers_1.findContractEvent)(response.transaction, [signatureGasAdded], new utils_1.Interface([
                "event GasAdded(bytes32 indexed txHash, uint256 indexed logIndex, address gasToken, uint256 gasFeeAmount, address refundAddress)",
            ]));
            // Calculate how many gas we need to add more.
            const expectedLogIndex = (0, helpers_1.getLogIndexFromTxReceipt)(tx);
            // Validate event data
            const args = gasAddedEvent === null || gasAddedEvent === void 0 ? void 0 : gasAddedEvent.eventLog.args;
            const eventGasFeeAmount = (_a = args === null || args === void 0 ? void 0 : args.gasFeeAmount) === null || _a === void 0 ? void 0 : _a.toString();
            expect((_b = args === null || args === void 0 ? void 0 : args.logIndex) === null || _b === void 0 ? void 0 : _b.toNumber()).toBe(expectedLogIndex);
            expect(eventGasFeeAmount).toBe(ethers_1.ethers.BigNumber.from(mockedGasFee).sub(gasPaid).toString());
            expect(args === null || args === void 0 ? void 0 : args.refundAddress).toBe(userWallet.address);
        }));
    });
    describe.skip("execute", () => {
        let api;
        const wallet = ethers_1.Wallet.createRandom();
        const evmWalletDetails = {
            privateKey: wallet.privateKey,
        };
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            vitest.clearAllMocks();
            api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.TESTNET });
        }));
        test("it shouldn't call 'execute' given tx is already executed", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockApi = vitest.spyOn(api, "queryExecuteParams");
            mockApi.mockResolvedValueOnce({ status: AxelarRecoveryApi_1.GMPStatus.DEST_EXECUTED });
            const response = yield api.execute("0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae", undefined, evmWalletDetails);
            expect(response).toEqual((0, error_1.AlreadyExecutedError)());
        }));
        test("it shouldn't call 'execute' given tx has not approved yet", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockApi = vitest.spyOn(api, "queryExecuteParams");
            mockApi.mockResolvedValueOnce({ status: AxelarRecoveryApi_1.GMPStatus.SRC_GATEWAY_CALLED });
            const response = yield api.execute("0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae", undefined, evmWalletDetails);
            expect(response).toEqual((0, error_1.NotApprovedError)());
        }));
        test("it shouldn't call 'execute' given gmp api error", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockApi = vitest.spyOn(api, "queryExecuteParams");
            mockApi.mockResolvedValueOnce(undefined);
            const response = yield api.execute("0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae", undefined, evmWalletDetails);
            expect(response).toEqual((0, error_1.GMPQueryError)());
        }));
        test("it calls 'execute' and return revert error given 'callExecute' throws 'CALL_EXECUTE_ERROR.REVERT' error", () => __awaiter(void 0, void 0, void 0, function* () {
            // mock query api
            const executeParams = (0, stubs_1.executeParamsStub)();
            const mockApi = vitest.spyOn(api, "queryExecuteParams");
            mockApi.mockResolvedValueOnce({
                status: AxelarRecoveryApi_1.GMPStatus.DEST_GATEWAY_APPROVED,
                data: executeParams,
            });
            // Mock contract call is failed
            const error = new Error(ContractCallHelper.CALL_EXECUTE_ERROR.REVERT);
            vitest.spyOn(ContractCallHelper, "callExecute").mockRejectedValueOnce(error);
            const sourceTxHash = "0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae";
            const response = yield api.execute(sourceTxHash, undefined, evmWalletDetails);
            // Expect returns error
            expect(response).toEqual((0, error_1.ExecutionRevertedError)(executeParams));
        }));
        test("it calls 'execute' and return revert error given 'callExecute' throws 'CALL_EXECUTE_ERROR.INSUFFICIENT_FUNDS' error", () => __awaiter(void 0, void 0, void 0, function* () {
            // mock query api
            const executeParams = (0, stubs_1.executeParamsStub)();
            const mockApi = vitest.spyOn(api, "queryExecuteParams");
            mockApi.mockResolvedValueOnce({
                status: AxelarRecoveryApi_1.GMPStatus.DEST_GATEWAY_APPROVED,
                data: executeParams,
            });
            // Mock contract call is failed
            const error = new Error(ContractCallHelper.CALL_EXECUTE_ERROR.INSUFFICIENT_FUNDS);
            vitest.spyOn(ContractCallHelper, "callExecute").mockRejectedValueOnce(error);
            const sourceTxHash = "0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae";
            const response = yield api.execute(sourceTxHash, undefined, evmWalletDetails);
            // Expect returns error
            expect(response).toEqual((0, error_1.InsufficientFundsError)(executeParams));
        }));
        test("it should call 'execute' and return success = true", () => __awaiter(void 0, void 0, void 0, function* () {
            // mock query api
            const mockApi = vitest.spyOn(api, "queryExecuteParams");
            const executeParams = (0, stubs_1.executeParamsStub)();
            mockApi.mockResolvedValueOnce({
                status: AxelarRecoveryApi_1.GMPStatus.DEST_GATEWAY_APPROVED,
                data: executeParams,
            });
            // Mock contract call is successful
            vitest.spyOn(ContractCallHelper, "callExecute").mockResolvedValueOnce((0, stubs_1.contractReceiptStub)());
            const response = yield api.execute("0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae", undefined, evmWalletDetails);
            const { commandId, sourceChain, sourceAddress, payload, symbol, amount, isContractCallWithToken, } = executeParams;
            const functionName = isContractCallWithToken ? "executeWithToken" : "execute";
            expect(response).toEqual({
                success: true,
                transaction: (0, stubs_1.contractReceiptStub)(),
                data: {
                    functionName,
                    args: {
                        commandId,
                        sourceChain,
                        sourceAddress,
                        payload,
                        symbol,
                        amount,
                    },
                },
            });
        }));
    });
});
//# sourceMappingURL=AxelarGMPRecoveryAPI.spec.js.map