import { Network } from "@ethersproject/networks";

import { DeliverTxResponse, SigningStargateClientOptions } from "@cosmjs/stargate";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { LogDescription } from "ethers/lib/utils";
import { ContractReceipt, ethers } from "ethers";

export enum Environment {
  DEVNET = "devnet",
  TESTNET = "testnet",
  MAINNET = "mainnet",
}

export enum EvmChain {
  ETHEREUM = "ethereum",
  AVALANCHE = "avalanche",
  FANTOM = "fantom",
  POLYGON = "polygon",
  MOONBEAM = "moonbeam",
  AURORA = "aurora",
  BINANCE = "binance",
}

export enum CosmosChain {
  AXELAR = "axelar",
  COSMOSHUB = "cosmoshub",
  JUNO = "juno",
  OSMOSIS = "osmosis",
  TERRA = "terra",
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
};

export interface BaseFeeResponse {
  success: boolean;
  error?: string;
  baseFee?: string;
}

export type CosmosBasedWalletDetails = {
  mnemonic?: string;
  offlineSigner?: OfflineSigner;
};
export type EvmWalletDetails = {
  privateKey?: string;
  useWindowEthereum?: boolean;
  provider?: ethers.providers.JsonRpcProvider;
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

export interface AxelarRecoveryAPIConfig extends AxelarQueryAPIConfig {
};

// Includes all native tokens and stablecoins
export enum GasToken {
  ETH = "ETH",
  AVAX = "AVAX",
  GLMR = "GLMR",
  FTM = "FTM",
  MATIC = "MATIC",
  UST = "UST",
  USDC = "USDC",
  AURORA = "AURORA",
  BINANCE = "BNB",
}

export interface AddGasOptions {
  amount?: string;
  refundAddress?: string;
  estimatedGasUsed?: number;
  evmWalletDetails?: EvmWalletDetails;
}

export interface EventLog {
  signature: string;
  eventLog: LogDescription;
  logIndex: number;
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
  estimatedGas?: number;
}

export interface AxelarTxResponse extends DeliverTxResponse {
  rawLog: any;
}

export enum ApproveGatewayError {
  ALREADY_APPROVED = "already approved",
  ALREADY_EXECUTED = "already executed",
  SIGN_COMMAND_FAILED = "cannot sign command",
  FETCHING_STATUS_FAILED = "cannot fetching status",
  ERROR_BATCHED_COMMAND = "cannot find batch command",
  ERROR_UNKNOWN = "unknown error",
  ERROR_ACCOUNT_SEQUENCE_MISMATCH = "account sequence mismatch",
}

export interface ApproveGatewayResponse {
  success: boolean;
  error?: ApproveGatewayError | string;
  confirmTx?: AxelarTxResponse;
  createPendingTransferTx?: AxelarTxResponse;
  signCommandTx?: AxelarTxResponse;
  approveTx?: any;
}

export const isNativeToken = (chain: EvmChain, selectedToken: GasToken) => {
  const nativeTokenMap = {
    [EvmChain.ETHEREUM]: GasToken.ETH,
    [EvmChain.AVALANCHE]: GasToken.AVAX,
    [EvmChain.FANTOM]: GasToken.FTM,
    [EvmChain.POLYGON]: GasToken.MATIC,
    [EvmChain.MOONBEAM]: GasToken.GLMR,
    [EvmChain.AURORA]: GasToken.AURORA,
    [EvmChain.BINANCE]: GasToken.BINANCE,
  };
  return nativeTokenMap[chain] === selectedToken;
};
