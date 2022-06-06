import { SigningStargateClientOptions } from "@cosmjs/stargate";

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

export type AxelarSigningClientConfig = {
  axelarRpcUrl?: string;
  environment: Environment;
  mnemonic: string;
  options: SigningStargateClientOptions;
};

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
  }
}

export interface TransferFeeResponse {
  fee: {
    denom: string;
    amount: string;
  }
}