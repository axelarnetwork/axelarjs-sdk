import { AxelarQueryClientType } from "../AxelarQueryClient";
import { AxelarRecoveryAPIConfig, Environment, EvmWalletDetails } from "../types";
import { EvmChain } from "../../constants/EvmChain";
import EVMClient from "./client/EVMClient";
import { ChainInfo } from "src/chains/types";
export declare enum GMPStatus {
    SRC_GATEWAY_CALLED = "source_gateway_called",
    DEST_GATEWAY_APPROVED = "destination_gateway_approved",
    DEST_EXECUTED = "destination_executed",
    EXPRESS_EXECUTED = "express_executed",
    DEST_EXECUTE_ERROR = "error",
    DEST_EXECUTING = "executing",
    APPROVING = "approving",
    FORECALLED = "forecalled",
    FORECALLED_WITHOUT_GAS_PAID = "forecalled_without_gas_paid",
    NOT_EXECUTED = "not_executed",
    NOT_EXECUTED_WITHOUT_GAS_PAID = "not_executed_without_gas_paid",
    INSUFFICIENT_FEE = "insufficient_fee",
    UNKNOWN_ERROR = "unknown_error",
    CANNOT_FETCH_STATUS = "cannot_fetch_status",
    SRC_GATEWAY_CONFIRMED = "confirmed"
}
export declare enum GasPaidStatus {
    GAS_UNPAID = "gas_unpaid",
    GAS_PAID = "gas_paid",
    GAS_PAID_NOT_ENOUGH_GAS = "gas_paid_not_enough_gas",
    GAS_PAID_ENOUGH_GAS = "gas_paid_enough_gas"
}
export interface GasPaidInfo {
    status: GasPaidStatus;
    details?: any;
}
export interface GMPStatusResponse {
    status: GMPStatus | string;
    timeSpent?: Record<string, number>;
    gasPaidInfo?: GasPaidInfo;
    error?: GMPError;
    callTx?: any;
    executed?: any;
    expressExecuted?: any;
    approved?: any;
    callback?: any;
}
export interface GMPError {
    txHash: string;
    chain: string;
    message: string;
}
export interface ExecuteParams {
    commandId: string;
    sourceChain: string;
    sourceAddress: string;
    payload: string;
    symbol?: string;
    amount?: string;
    srcTxInfo: {
        transactionHash: string;
        transactionIndex: number;
        logIndex: number;
    };
    destinationContractAddress: string;
    destinationChain: EvmChain;
    isContractCallWithToken: boolean;
}
export interface ExecuteParamsResponse {
    status: GMPStatus;
    data?: ExecuteParams;
}
export interface CommandObj {
    id: string;
    type: string;
    key_id: string;
    max_gas_cost: number;
    executed: boolean;
    transactionHash: string;
    transactionIndex: string;
    logIndex: number;
    block_timestamp: number;
}
export interface BatchedCommandsAxelarscanResponse {
    data: string;
    status: string;
    key_id: string;
    execute_data: string;
    prev_batched_commands_id: string;
    command_ids: string[];
    batch_id: string;
    chain: string;
    id: string;
}
export type SubscriptionStrategy = {
    kind: "websocket";
} | {
    kind: "polling";
    interval: number;
};
export declare class AxelarRecoveryApi {
    readonly environment: Environment;
    readonly recoveryApiUrl: string;
    readonly axelarGMPApiUrl: string;
    readonly axelarscanBaseApiUrl: string;
    readonly axelarRpcUrl: string;
    readonly axelarLcdUrl: string;
    readonly wssStatusUrl: string;
    readonly debugMode: boolean;
    readonly config: AxelarRecoveryAPIConfig;
    protected axelarQuerySvc: AxelarQueryClientType | null;
    protected evmClient: EVMClient;
    protected chainsList: ChainInfo[];
    constructor(config: AxelarRecoveryAPIConfig);
    fetchGMPTransaction(txHash: string, txLogIndex?: number | undefined): Promise<any>;
    fetchBatchData(chainId: string, commandId: string): Promise<BatchedCommandsAxelarscanResponse | undefined>;
    private searchRecentBatchesFromCore;
    parseGMPStatus(response: any): GMPStatus | string;
    private parseGMPError;
    queryTransactionStatus(txHash: string, txLogIndex?: number | undefined): Promise<GMPStatusResponse>;
    /**
     * Subscribe to a transaction status using either a websocket or polling strategy
     */
    subscribeToTx(txHash: string, cb: (data: GMPStatusResponse) => void, strategy?: SubscriptionStrategy): Promise<void>;
    /**
     * Subscribe to a transaction status using a polling strategy
     */
    private subscribeToTxPOLLING;
    /**
     * Subscribe to a transaction status using a websocket strategy (Experimental)
     */
    private subscribeToTxWSS_EXPERIMENTAL;
    queryExecuteParams(txHash: string, txLogIndex?: number): Promise<Nullable<ExecuteParamsResponse>>;
    protected getChainInfo(chainId: string): Promise<ChainInfo>;
    confirmGatewayTx(txHash: string, chainName: string): Promise<import("../types").AxelarTxResponse>;
    createPendingTransfers(chainName: string): Promise<import("../types").AxelarTxResponse>;
    executePendingTransfers(chainName: string): Promise<import("../types").AxelarTxResponse>;
    routeMessageRequest(txHash: string, payload: string, logIndex?: number): Promise<import("../types").AxelarTxResponse>;
    signCommands(chainName: string): Promise<import("../types").AxelarTxResponse>;
    queryBatchedCommands(chainId: string, batchCommandId?: string): Promise<import("@axelar-network/axelarjs-types/axelar/evm/v1beta1/query").BatchedCommandsResponse>;
    queryGatewayAddress({ chain }: {
        chain: string;
    }): Promise<import("@axelar-network/axelarjs-types/axelar/evm/v1beta1/query").GatewayAddressResponse>;
    getSignedTxAndBroadcast(chain: string, data: string): Promise<import("@ethersproject/abstract-provider").TransactionResponse>;
    sendApproveTx(chain: string, data: string, evmWalletDetails: EvmWalletDetails): Promise<any>;
    broadcastEvmTx(chain: string, data: string, evmWalletDetails?: {
        useWindowEthereum: boolean;
    }): Promise<import("@ethersproject/abstract-provider").TransactionResponse>;
    execRecoveryUrlFetch(endpoint: string, params: any): Promise<any>;
    execPost(base: string, endpoint: string, params: any): Promise<any>;
    execGet(base: string, params?: any): Promise<any>;
    get getAxelarGMPApiUrl(): string;
}
//# sourceMappingURL=AxelarRecoveryApi.d.ts.map