import { Network } from "@ethersproject/networks";
import { DeliverTxResponse, SigningStargateClientOptions } from "@cosmjs/stargate";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { LogDescription } from "ethers/lib/utils";
import { ContractReceipt, ethers } from "ethers";
import { GasToken } from "../../constants/GasToken";
import { EvmChain } from "../../constants/EvmChain";
export declare enum Environment {
    DEVNET = "devnet-amplifier",
    TESTNET = "testnet",
    MAINNET = "mainnet"
}
export declare enum CosmosChain {
    AXELAR = "axelar",
    COSMOSHUB = "cosmoshub",
    JUNO = "juno",
    OSMOSIS = "osmosis",
    TERRA = "terra"
}
export interface SendTokenArgs {
    destinationChain: EvmChain | CosmosChain;
    destinationAddress: string;
    symbol: string;
    amount: string;
}
export interface ApproveTxArgs {
    tokenAddress: string;
    amount?: string;
}
export interface CallContractTxArgs {
    destinationChain: EvmChain | CosmosChain;
    destinationContractAddress: string;
    payload: string;
}
export interface CallContractWithTokenTxArgs extends CallContractTxArgs {
    symbol: string;
    amount: string;
}
export interface TxOption {
    gasLimit?: string;
    gasPrice?: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
}
export type AxelarAssetTransferConfig = {
    environment: Environment;
    auth?: "local" | "metamask";
    overwriteResourceUrl?: string;
};
export interface AxelarQueryAPIConfig {
    axelarRpcUrl?: string;
    axelarLcdUrl?: string;
    environment: Environment;
    debug?: boolean;
}
export type FeeToken = {
    gas_price: string;
    decimals: number;
    name: string;
    l1_gas_oracle_address?: string;
    l1_gas_price_in_units?: TokenUnit;
    symbol: string;
    token_price: {
        usd: number;
    };
};
export interface BaseFeeResponse {
    success: boolean;
    apiResponse?: any;
    error?: string;
    baseFee: string;
    expressFee: string;
    executeGasMultiplier: number;
    sourceToken: FeeToken;
    destToken: FeeToken;
    l2_type: "op" | "arb" | "mantle" | undefined;
    ethereumToken: {
        name: string;
        symbol: string;
        decimals: number;
        token_price: {
            usd: number;
        };
    };
    expressSupported: boolean;
}
export type CosmosBasedWalletDetails = {
    mnemonic?: string;
    offlineSigner?: OfflineSigner;
};
export type EvmWalletDetails = {
    privateKey?: string;
    useWindowEthereum?: boolean;
    provider?: ethers.providers.JsonRpcProvider;
    rpcUrl?: string;
    gasLimitBuffer?: number;
};
export interface AxelarQueryClientConfig {
    axelarRpcUrl?: string;
    environment: Environment;
}
export interface EVMClientConfig {
    rpcUrl: string;
    networkOptions?: Network;
    evmWalletDetails: EvmWalletDetails;
}
export interface AxelarSigningClientConfig extends AxelarQueryClientConfig {
    cosmosBasedWalletDetails: CosmosBasedWalletDetails;
    options: SigningStargateClientOptions;
}
export type AxelarRecoveryAPIConfig = AxelarQueryAPIConfig;
export type AxelarTransferAPIConfig = {
    environment: Environment;
};
export interface AddGasOptions {
    amount?: string;
    refundAddress?: string;
    gasMultipler?: number;
    logIndex?: number;
    destChain?: string;
    evmWalletDetails?: EvmWalletDetails;
}
export interface EventLog {
    signature: string;
    eventLog: LogDescription;
    logIndex: number;
    eventIndex: number;
}
export interface ExecuteArgs {
    commandId: string;
    sourceChain: string;
    sourceAddress: string;
    payload: string;
    symbol?: string;
    amount?: string;
}
export interface TxResult {
    success: boolean;
    transaction?: ContractReceipt;
    error?: string;
    data?: {
        functionName: string;
        args: ExecuteArgs;
    };
}
export interface QueryGasFeeOptions {
    provider?: ethers.providers.JsonRpcProvider;
    gasTokenSymbol?: GasToken | string;
    gasMultipler?: number;
    shouldSubtractBaseFee?: boolean;
}
export interface QueryTransferOptions {
    depositAddress?: string;
    recipientAddress?: string;
}
export declare enum QueryTransferStatus {
    DEPOSIT_CONFIRMED = "deposit_confirmed",
    ASSET_SENT = "asset_sent",
    VOTED = "voted",
    BATCH_SIGNED = "batch_signed",
    IBC_SENT = "ibc_sent",
    EXECUTED = "executed"
}
export interface QueryTransferResponse {
    success: boolean;
    error?: string;
    data?: {
        id: string;
        status: QueryTransferStatus;
        type: string;
        amount: number;
        fee: number;
        denom: string;
        senderChain: string;
        senderAddress: string;
        recipientChain: string;
        recipientAddress: string;
        blockExplorerUrl: string;
        blockHeight: number;
    };
}
export interface AxelarTxResponse extends DeliverTxResponse {
    rawLog: any;
}
export declare enum ApproveGatewayError {
    ALREADY_APPROVED = "already approved",
    ALREADY_EXECUTED = "already executed",
    SIGN_COMMAND_FAILED = "cannot sign command",
    CONFIRM_COMMAND_FAILED = "cannot confirm command",
    FETCHING_STATUS_FAILED = "cannot fetching status from axelarscan api",
    ERROR_BATCHED_COMMAND = "cannot find batch command",
    ERROR_GET_EVM_EVENT = "cannot get evm event",
    ERROR_BROADCAST_EVENT = "cannot broadcast event to destination chain",
    ERROR_UNKNOWN = "unknown error",
    ERROR_ACCOUNT_SEQUENCE_MISMATCH = "account sequence mismatch"
}
export interface GMPRecoveryResponse {
    success: boolean;
    error?: ApproveGatewayError | string;
    confirmTx?: AxelarTxResponse;
    signCommandTx?: AxelarTxResponse;
    routeMessageTx?: AxelarTxResponse;
    approveTx?: any;
    infoLogs?: string[];
}
export declare const isNativeToken: (chain: string, selectedToken: GasToken, environment: Environment) => boolean;
export type TokenUnit = {
    value: string;
    decimals: number;
};
export type EstimateL1FeeParams = {
    executeData: string;
    l1GasPrice: TokenUnit;
    destChain: string;
    l1GasOracleAddress?: string | undefined;
    l2Type?: "op" | "arb" | "mantle" | undefined;
};
//# sourceMappingURL=index.d.ts.map