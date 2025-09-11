import { AxelarRecoveryAPIConfig, EvmWalletDetails, AddGasOptions, TxResult, QueryGasFeeOptions, ApproveGatewayError, GMPRecoveryResponse, AxelarTxResponse, Environment } from "../types";
import { EvmChain } from "../../constants/EvmChain";
import { AxelarRecoveryApi } from "./AxelarRecoveryApi";
import { AxelarQueryAPI } from "../AxelarQueryAPI";
import { Transaction } from "@mysten/sui/transactions";
import { EventResponse } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/query";
import { ChainInfo } from "src/chains/types";
import { Coin, OfflineSigner } from "@cosmjs/proto-signing";
import { DeliverTxResponse, SigningStargateClient, StdFee } from "@cosmjs/stargate";
import { JsonRpcProvider } from "@ethersproject/providers";
export declare const GMPErrorMap: Record<string, ApproveGatewayError>;
interface ConfirmTxSDKResponse {
    success: boolean;
    errorMessage?: string;
    infoLogs: string[];
    commandId: string;
    confirmTx?: AxelarTxResponse;
    eventResponse?: EventResponse;
}
interface SignTxSDKResponse {
    success: boolean;
    errorMessage?: string;
    signCommandTx?: AxelarTxResponse;
    infoLogs: string[];
}
interface BroadcastTxSDKResponse {
    success: boolean;
    errorMessage?: string;
    approveTx?: AxelarTxResponse;
    infoLogs: string[];
}
export declare enum RouteDir {
    COSMOS_TO_EVM = "cosmos_to_evm",
    EVM_TO_COSMOS = "evm_to_cosmos",
    EVM_TO_EVM = "evm_to_evm",
    COSMOS_TO_COSMOS = "cosmos_to_cosmos"
}
export type SendOptions = {
    txFee: StdFee;
    environment: Environment;
    offlineSigner: OfflineSigner;
    rpcUrl?: string;
    timeoutTimestamp?: number;
};
export type AddGasStellarParams = {
    senderAddress: string;
    tokenAddress?: string;
    contractAddress?: string;
    amount: string;
    spender: string;
    messageId: string;
};
export type AutocalculateGasOptions = {
    gasMultipler?: number;
};
export type AddGasParams = {
    txHash: string;
    chain: string;
    token: Coin | "autocalculate";
    sendOptions: SendOptions;
    gasLimit: number;
    autocalculateGasOptions?: AutocalculateGasOptions;
};
export type AddGasSuiParams = {
    amount?: string;
    refundAddress: string;
    messageId: string;
    gasParams: string;
};
export type AddGasResponse = {
    success: boolean;
    info: string;
    broadcastResult?: DeliverTxResponse;
};
export type GetFullFeeOptions = {
    environment: Environment;
    autocalculateGasOptions?: AutocalculateGasOptions | undefined;
    tx: any;
    chainConfig: any;
};
export declare const getCosmosSigner: (rpcUrl: string, offlineDirectSigner: OfflineSigner) => Promise<SigningStargateClient>;
export declare class AxelarGMPRecoveryAPI extends AxelarRecoveryApi {
    axelarQueryApi: AxelarQueryAPI;
    private staticInfo;
    constructor(config: AxelarRecoveryAPIConfig);
    getCidFromSrcTxHash(destChainId: string, messageId: string, eventIndex: number): string;
    doesTxMeetConfirmHt(chain: string, txHash: string, provider?: JsonRpcProvider): Promise<boolean | undefined>;
    isEVMEventFailed(eventResponse: EventResponse | undefined): boolean | undefined;
    isEVMEventConfirmed(eventResponse: EventResponse): boolean | undefined;
    isEVMEventCompleted(eventResponse: EventResponse): boolean | undefined;
    getEvmEvent(srcChainId: string, destChainId: string, srcTxHash: string, srcTxEventIndex: number | undefined, evmWalletDetails?: EvmWalletDetails): Promise<{
        commandId: string;
        eventResponse: EventResponse;
        success: boolean;
        errorMessage: string;
        infoLog: string;
    }>;
    findEventAndConfirmIfNeeded(srcChain: string, destChain: string, txHash: string, txEventIndex: number | undefined, evmWalletDetails: EvmWalletDetails): Promise<ConfirmTxSDKResponse>;
    findBatchAndSignIfNeeded(commandId: string, destChainId: string): Promise<SignTxSDKResponse>;
    findBatchAndApproveGateway(commandId: string, destChainId: string, wallet: EvmWalletDetails): Promise<BroadcastTxSDKResponse>;
    manualRelayToDestChain(txHash: string, txLogIndex?: number | undefined, txEventIndex?: number | undefined, evmWalletDetails?: EvmWalletDetails, escapeAfterConfirm?: boolean, messageId?: string): Promise<GMPRecoveryResponse>;
    getRouteDir(srcChain: ChainInfo, destChain: ChainInfo): RouteDir;
    private recoverCosmosToCosmosTx;
    private recoverEvmToCosmosTx;
    private recoverCosmosToEvmTx;
    private recoverEvmToEvmTx;
    private signAndApproveGateway;
    /**
     * Check if given transaction is already executed.
     * @param txHash string - transaction hash
     * @returns Promise<boolean> - true if transaction is already executed
     */
    isExecuted(txHash: string): Promise<boolean>;
    /**
     * Check if given transaction is already confirmed.
     * @param txHash string - transaction hash
     * @returns Promise<boolean> - true if transaction is already confirmed
     */
    isConfirmed(txHash: string): Promise<boolean>;
    /**
     * Calculate the gas fee in native token for executing a transaction at the destination chain using the source chain's gas price.
     * @param txHash string - transaction hash
     * @param sourceChain EVMChain - source chain
     * @param destinationChain EVMChain - destination chain
     * @param gasTokenSymbol string - gas token symbol
     * @param options QueryGasFeeOptions - options
     * @returns Promise<string> - The gas fee to be paid at source chain
     */
    calculateNativeGasFee(txHash: string, sourceChain: string, destinationChain: string, estimatedGasUsed: number, options: QueryGasFeeOptions): Promise<string>;
    /**
     * Calculate the gas fee in an ERC-20 tokens for executing a transaction at the destination chain using the source chain's gas price.
     * @param txHash string - transaction hash
     * @param sourceChain EVMChain - source chain
     * @param destinationChain EVMChain - destination chain
     * @param gasTokenSymbol string - gas token symbol
     * @param options QueryGasFeeOptions - options
     * @returns Promise<string> - The gas fee to be paid at source chain
     */
    calculateGasFee(sourceChain: EvmChain, destinationChain: EvmChain, estimatedGasUsed: number, options: QueryGasFeeOptions): Promise<string>;
    getEventIndex(chain: string, txHash: string, evmWalletDetails?: EvmWalletDetails): Promise<Nullable<number>>;
    addGasToSuiChain(params: AddGasSuiParams): Promise<Transaction>;
    /**
     * Builds an XDR transaction to add gas payment to the Axelar Gas Service contract.
     *
     * This function creates a Stellar transaction that adds gas payment to the Axelar Gas Service.
     * The payment is made in native XLM token by default and is used to cover the execution costs of
     * cross-chain messages.
     *
     * @example
     * ```typescript
     * const xdr = await sdk.addGasToStellarChain{
     *     senderAddress: 'GCXXX...', // The address that sent the cross-chain message via the `axelar_gateway`
     *     messageId: 'tx-123',
     *     amount: '10000000', // the token amount to pay for the gas fee
     *     spender: 'GXXX...' // The spender pays for the gas fee.
     * });
     *
     * // Sign with Freighter wallet
     * const signedXDR = await window.freighter.signTransaction(xdr);
     * ```
     *
     * @param {AddGasStellarParams} params - The parameters for the add gas transaction
     * @returns {Promise<string>} The transaction encoded as an XDR string, ready for signing
     */
    addGasToStellarChain(params: AddGasStellarParams): Promise<string>;
    addGasToCosmosChain({ gasLimit, autocalculateGasOptions, sendOptions, ...params }: AddGasParams): Promise<AddGasResponse>;
    /**
     * Pay native token as gas fee for the given transaction hash.
     * If the transaction details is not valid, it will return an error with reason.
     * @param chain - source chain
     * @param txHash - transaction hash
     * @param estimatedGasUsed - estimated gas used
     * @param options - options
     * @returns
     */
    addNativeGas(chain: EvmChain | string, txHash: string, estimatedGasUsed: number, options?: AddGasOptions): Promise<TxResult>;
    /**
     * Pay ERC20 token as gas fee for the given transaction hash.
     * If the transaction details or `gasTokenAddress` is not valid, it will return an error with reason.
     *
     * @param chain EvmChain - The source chain of the transaction hash.
     * @param txHash string - The transaction hash.
     * @param gasTokenAddress string - The address of the ERC20 token to pay as gas fee.
     * @param options AddGasOptions - The options to pay gas fee.
     * @returns
     */
    addGas(chain: EvmChain, txHash: string, gasTokenAddress: string, estimatedGasUsed: number, options?: AddGasOptions): Promise<TxResult>;
    /**
     * Execute a transaction on the destination chain associated with given `srcTxHash`.
     * @param srcTxHash - The transaction hash on the source chain.
     * @param srcTxLogIndex - The log index of the transaction on the source chain.
     * @param evmWalletDetails - The wallet details to use for executing the transaction.
     * @returns The result of executing the transaction.
     */
    execute(srcTxHash: string, srcTxLogIndex?: number, evmWalletDetails?: EvmWalletDetails): Promise<TxResult>;
    private subtractGasFee;
    private _getLogIndexAndDestinationChain;
    private getSigner;
    getStaticInfo(): Promise<Record<string, any>>;
}
export {};
//# sourceMappingURL=AxelarGMPRecoveryAPI.d.ts.map