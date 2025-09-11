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
const ethers_1 = require("ethers");
const AxelarRecoveryApi_1 = require("../../TransactionRecoveryApi/AxelarRecoveryApi");
const types_1 = require("../../types");
const EvmChain_1 = require("../../../constants/EvmChain");
describe("AxelarRecoveryAPI", () => {
    const api = new AxelarRecoveryApi_1.AxelarRecoveryApi({ environment: types_1.Environment.TESTNET });
    beforeEach(() => {
        vitest.clearAllMocks();
    });
    describe("queryTransactionStatus", () => {
        test("it should return 'GMPStatus.DEST_GATEWAY_APPROVED' when the transaction is approved, but not executed.", () => __awaiter(void 0, void 0, void 0, function* () {
            const txHash = "0x123456789";
            const txDetails = {
                call: {
                    transactionHash: txHash,
                },
                gas_paid: {
                    transactionHash: txHash,
                },
                approved: {
                    transactionHash: `${txHash}1`,
                },
                executed: {
                    transactionHash: `${txHash}2`,
                },
                gas_status: "gas_paid",
                status: "approved",
            };
            vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(txDetails);
            const status = yield api.queryTransactionStatus(txHash);
            expect(status).toEqual({
                status: AxelarRecoveryApi_1.GMPStatus.DEST_GATEWAY_APPROVED,
                error: undefined,
                approved: txDetails.approved,
                callTx: txDetails.call,
                gasPaidInfo: {
                    status: AxelarRecoveryApi_1.GasPaidStatus.GAS_PAID,
                    details: txDetails.gas_paid,
                },
                executed: txDetails.executed,
                callback: undefined,
            });
        }));
        test("it should return a valid result when the source tx is from a cosmos-based chain", () => __awaiter(void 0, void 0, void 0, function* () {
            const txHash = "B210DF80331FB40A61229D23DEF849FF04A51839D47F7D696A4B228DB57EED1D";
            const result = yield api.queryTransactionStatus(txHash);
            expect(result.status).toEqual("destination_executed");
        }));
        test("it should return 'GMPStatus.DEST_EXECUTING' when the transaction is still in process", () => __awaiter(void 0, void 0, void 0, function* () {
            const txHash = "0x123456789";
            const txDetails = {
                call: {
                    transactionHash: txHash,
                },
                gas_paid: {
                    transactionHash: txHash,
                },
                approved: {
                    transactionHash: `${txHash}1`,
                },
                executed: {
                    transactionHash: `${txHash}2`,
                },
                gas_status: "gas_paid",
                status: "executing",
            };
            vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(txDetails);
            const status = yield api.queryTransactionStatus(txHash);
            expect(status).toEqual({
                status: AxelarRecoveryApi_1.GMPStatus.DEST_EXECUTING,
                error: undefined,
                callTx: txDetails.call,
                approved: txDetails.approved,
                gasPaidInfo: {
                    status: AxelarRecoveryApi_1.GasPaidStatus.GAS_PAID,
                    details: txDetails.gas_paid,
                },
                executed: txDetails.executed,
                callback: undefined,
            });
        }));
        test("it should return 'GMPStatus.DEST_EXECUTED' when the transaction is already executed", () => __awaiter(void 0, void 0, void 0, function* () {
            const txHash = "0x123456789";
            const txDetails = {
                call: {
                    transactionHash: txHash,
                },
                gas_paid: {
                    transactionHash: txHash,
                },
                approved: {
                    transactionHash: `${txHash}1`,
                },
                executed: {
                    transactionHash: `${txHash}2`,
                },
                gas_status: "gas_paid_enough_gas",
                status: "executed",
            };
            vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(txDetails);
            const status = yield api.queryTransactionStatus(txHash);
            expect(status).toEqual({
                status: AxelarRecoveryApi_1.GMPStatus.DEST_EXECUTED,
                error: undefined,
                callTx: txDetails.call,
                approved: txDetails.approved,
                gasPaidInfo: {
                    status: AxelarRecoveryApi_1.GasPaidStatus.GAS_PAID_ENOUGH_GAS,
                    details: txDetails.gas_paid,
                },
                executed: txDetails.executed,
                callback: undefined,
            });
        }));
        test("it should return 'GMPStatus.SRC_GATEWAY_CALLED' when the transaction is not approved", () => __awaiter(void 0, void 0, void 0, function* () {
            const txHash = "0x123456789";
            const txDetails = {
                call: {
                    transactionHash: txHash,
                },
                gas_paid: {
                    transactionHash: txHash,
                },
                gas_status: "gas_paid",
                status: "called",
            };
            vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(txDetails);
            const status = yield api.queryTransactionStatus(txHash);
            expect(status).toEqual({
                status: AxelarRecoveryApi_1.GMPStatus.SRC_GATEWAY_CALLED,
                error: undefined,
                callTx: txDetails.call,
                gasPaidInfo: {
                    status: AxelarRecoveryApi_1.GasPaidStatus.GAS_PAID,
                    details: txDetails.gas_paid,
                },
            });
        }));
        test("it should return error when the transaction fee is not enough", () => __awaiter(void 0, void 0, void 0, function* () {
            const txHash = "0x123456789";
            const txDetails = {
                call: {
                    transaction: {
                        hash: txHash,
                    },
                    chain: EvmChain_1.EvmChain.ETHEREUM,
                },
                gas_paid: {
                    transactionHash: txHash,
                },
                is_insufficient_fee: true,
                gas_status: "gas_paid",
                status: "called",
            };
            vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(txDetails);
            const status = yield api.queryTransactionStatus(txHash);
            expect(status).toEqual({
                status: AxelarRecoveryApi_1.GMPStatus.SRC_GATEWAY_CALLED,
                error: {
                    message: "Insufficient fee",
                    txHash: txHash,
                    chain: EvmChain_1.EvmChain.ETHEREUM,
                },
                callTx: txDetails.call,
                gasPaidInfo: {
                    status: AxelarRecoveryApi_1.GasPaidStatus.GAS_PAID,
                    details: txDetails.gas_paid,
                },
            });
        }));
        test("it should return 'GMPStatus.DEST_EXECUTE_ERROR' when the transaction is not executed", () => __awaiter(void 0, void 0, void 0, function* () {
            const txHash = "0x123456789";
            const txDetails = {
                call: {
                    transactionHash: txHash,
                },
                gas_paid: {
                    transactionHash: txHash,
                },
                approved: {
                    transactionHash: `${txHash}1`,
                },
                executed: {
                    transactionHash: `${txHash}2`,
                },
                error: {
                    chain: "ethereum",
                    error: {
                        message: "execution reverted",
                        transactionHash: `${txHash}2`,
                    },
                },
                gas_status: "gas_paid_enough_gas",
                status: "error",
            };
            vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(txDetails);
            const status = yield api.queryTransactionStatus(txHash);
            expect(status).toEqual({
                status: AxelarRecoveryApi_1.GMPStatus.DEST_EXECUTE_ERROR,
                error: {
                    chain: EvmChain_1.EvmChain.ETHEREUM,
                    message: "execution reverted",
                    txHash: `${txHash}2`,
                },
                approved: txDetails.approved,
                callTx: txDetails.call,
                gasPaidInfo: {
                    status: AxelarRecoveryApi_1.GasPaidStatus.GAS_PAID_ENOUGH_GAS,
                    details: txDetails.gas_paid,
                },
                executed: txDetails.executed,
                callback: undefined,
            });
        }));
        test("it should return 'GMPStatus.UNKNOWN_ERROR' when the api status is error but 'error' object is undefined", () => __awaiter(void 0, void 0, void 0, function* () {
            const txHash = "0x123456789";
            const txDetails = {
                call: {
                    transactionHash: txHash,
                },
                gas_paid: {
                    transactionHash: txHash,
                },
                approved: {
                    transactionHash: `${txHash}1`,
                },
                executed: {
                    transactionHash: `${txHash}2`,
                },
                gas_status: "gas_paid_enough_gas",
                status: "error",
            };
            vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(txDetails);
            const status = yield api.queryTransactionStatus(txHash);
            expect(status).toEqual({
                status: "error",
                callTx: txDetails.call,
                approved: txDetails.approved,
                error: undefined,
                gasPaidInfo: {
                    status: AxelarRecoveryApi_1.GasPaidStatus.GAS_PAID_ENOUGH_GAS,
                    details: txDetails.gas_paid,
                },
                executed: txDetails.executed,
                callback: undefined,
            });
        }));
        test("it should return 'GMPStatus.CANNOT_FETCH_STATUS' when the axelarscan api is down", () => __awaiter(void 0, void 0, void 0, function* () {
            vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(undefined);
            const status = yield api.queryTransactionStatus("0x");
            expect(status).toEqual({
                status: AxelarRecoveryApi_1.GMPStatus.CANNOT_FETCH_STATUS,
            });
        }));
    });
    describe.skip("create pending transfers", () => {
        test("It should create pending transfers", () => __awaiter(void 0, void 0, void 0, function* () {
            const confirmation = yield api.createPendingTransfers("ethereum");
            console.log("confirmation", confirmation);
            expect(confirmation).toBeTruthy();
        }), 60000);
    });
    describe.skip("create pending transfers", () => {
        test("It should create pending transfers", () => __awaiter(void 0, void 0, void 0, function* () {
            const confirmation = yield api.createPendingTransfers("ethereum");
            console.log("confirmation", confirmation);
            expect(confirmation).toBeTruthy();
        }), 60000);
    });
    describe.skip("sign commands", () => {
        test("It should sign commands", () => __awaiter(void 0, void 0, void 0, function* () {
            const confirmation = yield api.signCommands("ethereum");
            console.log("confirmation", confirmation);
            expect(confirmation).toBeTruthy();
        }), 60000);
    });
    describe.skip("execute pending transfers", () => {
        test("It should execute pending transfers", () => __awaiter(void 0, void 0, void 0, function* () {
            const confirmation = yield api.executePendingTransfers("terra");
            console.log("confirmation", confirmation);
            expect(confirmation).toBeTruthy();
        }), 60000);
    });
    describe.skip("query execute params", () => {
        test("It should return null when the response is undefined", () => __awaiter(void 0, void 0, void 0, function* () {
            vitest.spyOn(api, "execGet").mockResolvedValueOnce(undefined);
            const response = yield api.queryExecuteParams("0x");
            expect(response).toBeUndefined();
        }));
        test("It should return null when response array is empty", () => __awaiter(void 0, void 0, void 0, function* () {
            vitest.spyOn(api, "execGet").mockResolvedValueOnce([]);
            const response = yield api.queryExecuteParams("0x");
            expect(response).toBeUndefined();
        }));
        test("It should return status: 'call' when the approve transaction hash is undefined", () => __awaiter(void 0, void 0, void 0, function* () {
            vitest.spyOn(api, "execGet").mockResolvedValueOnce([{}]);
            const response = yield api.queryExecuteParams("0x");
            expect(response === null || response === void 0 ? void 0 : response.status).toBe(AxelarRecoveryApi_1.GMPStatus.SRC_GATEWAY_CALLED);
            vitest.spyOn(api, "execGet").mockResolvedValueOnce([
                {
                    approved: {},
                },
            ]);
            const response2 = yield api.queryExecuteParams("0x");
            expect(response2 === null || response2 === void 0 ? void 0 : response2.status).toBe(AxelarRecoveryApi_1.GMPStatus.SRC_GATEWAY_CALLED);
        }));
        test("It should return status: 'executed' when the execute transaction hash is defined", () => __awaiter(void 0, void 0, void 0, function* () {
            vitest.spyOn(api, "execGet").mockResolvedValueOnce([
                {
                    approved: {
                        transactionHash: "0x",
                    },
                    executed: {
                        transactionHash: "0x",
                    },
                },
            ]);
            const response = yield api.queryExecuteParams("0x");
            expect(response === null || response === void 0 ? void 0 : response.status).toBe(AxelarRecoveryApi_1.GMPStatus.DEST_EXECUTED);
        }));
        test("It should get the execute params when the event type is 'ContractCallWithToken'", () => __awaiter(void 0, void 0, void 0, function* () {
            const txHash = "0x1";
            vitest.spyOn(api, "execGet").mockResolvedValueOnce([
                {
                    call: {
                        chain: "Moonbeam",
                        returnValues: {
                            payload: "payload",
                            destinationContractAddress: "destinationContractAddress",
                        },
                        event: "ContractCallWithToken",
                    },
                    approved: {
                        transactionHash: txHash,
                        chain: "Avalanche",
                        returnValues: {
                            commandId: "0x1",
                            sourceAddress: "0x2",
                            sourceChain: "Moonbeam",
                            symbol: "UST",
                            amount: ethers_1.ethers.BigNumber.from("1"),
                        },
                    },
                },
            ]);
            const executeParams = yield api.queryExecuteParams(txHash);
            expect(api.execGet).toHaveBeenCalledWith(api.axelarGMPApiUrl, {
                method: "searchGMP",
                txHash,
            });
            expect(executeParams).toEqual({
                status: AxelarRecoveryApi_1.GMPStatus.DEST_GATEWAY_APPROVED,
                data: {
                    commandId: "0x1",
                    destinationChain: EvmChain_1.EvmChain.AVALANCHE,
                    destinationContractAddress: "destinationContractAddress",
                    isContractCallWithToken: true,
                    payload: "payload",
                    sourceAddress: "0x2",
                    sourceChain: "Moonbeam",
                    symbol: "UST",
                    amount: "1",
                },
            });
        }));
        test("It should get the execute params when the event type is 'ContractCall'", () => __awaiter(void 0, void 0, void 0, function* () {
            const txHash = "0x1";
            vitest.spyOn(api, "execGet").mockResolvedValueOnce([
                {
                    call: {
                        chain: "Moonbeam",
                        returnValues: {
                            payload: "payload",
                            destinationContractAddress: "destinationContractAddress",
                        },
                        event: "ContractCall",
                    },
                    approved: {
                        transactionHash: txHash,
                        chain: "Avalanche",
                        returnValues: {
                            commandId: "0x1",
                            sourceAddress: "0x2",
                            sourceChain: "Moonbeam",
                        },
                    },
                },
            ]);
            const executeParams = yield api.queryExecuteParams(txHash);
            expect(api.execGet).toHaveBeenCalledWith(api.axelarGMPApiUrl, {
                method: "searchGMP",
                txHash,
            });
            expect(executeParams).toEqual({
                status: AxelarRecoveryApi_1.GMPStatus.DEST_GATEWAY_APPROVED,
                data: {
                    commandId: "0x1",
                    destinationChain: EvmChain_1.EvmChain.AVALANCHE,
                    destinationContractAddress: "destinationContractAddress",
                    isContractCallWithToken: false,
                    payload: "payload",
                    sourceAddress: "0x2",
                    sourceChain: "Moonbeam",
                    symbol: undefined,
                    amount: undefined,
                },
            });
        }));
    });
});
//# sourceMappingURL=AxelarRecoveryAPI.spec.js.map