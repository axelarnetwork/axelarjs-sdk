import { Network } from "@ethersproject/networks";

import { SigningStargateClientOptions } from "@cosmjs/stargate";
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

export type AxelarQueryAPIConfig = {
  axelarRpcUrl?: string;
  axelarLcdUrl?: string;
  environment: Environment;
};

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

export type AxelarRecoveryAPIConfig = {
  environment: Environment;
};

export interface FeeInfoResponse {
  fee_info: {
    chain: string;
    asset: string;
    fee_rate: string;
    min_fee: string;
    max_fee: string;
  };
}

export interface TransferFeeResponse {
  fee: {
    denom: string;
    amount: string;
  };
}

// Includes all native tokens and stablecoins
export enum GasToken {
  ETH = "ETH",
  AVAX = "AVAX",
  GLMR = "GLMR",
  FTM = "FTM",
  MATIC = "MATIC",
  UST = "UST",
  USDC = "USDC",
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

export interface TxResult {
  success: boolean;
  transaction?: ContractReceipt;
  error?: string;
}

export interface QueryGasFeeOptions {
  provider?: ethers.providers.JsonRpcProvider;
  estimatedGas?: number;
}

export enum AxelarGMPRecoveryProcessorResponse {
  TRIGGERED_RELAY = "triggered relay",
  APPROVED_BUT_NOT_EXECUTED = "approved but not executed",
  ALREADY_EXECUTED = "already executed",
  ERROR_FETCHING_STATUS = "error fetching status",
  ERROR_INVOKING_RECOVERY = "error invoking recovery",
  ACCOUNT_SEQUENCE_MISMATCH = "account sequence mismatch",
}
