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
  POLYGON_ZKEVM = "polygon-zkevm",
  MOONBEAM = "moonbeam",
  AURORA = "aurora",
  BINANCE = "binance",
  BNBCHAIN = "binance",
  ARBITRUM = "arbitrum",
  CELO = "celo",
  KAVA = "kava",
  BASE = "base",
  FILECOIN = "filecoin",
  OPTIMISM = "optimism",
  LINEA = "linea",
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
  debug?: boolean;
}

export interface BaseFeeResponse {
  success: boolean;
  apiResponse?: any;
  error?: string;
  baseFee: string;
  expressFee: string;
  sourceToken: {
    gas_price: string;
    decimals: number;
    name: string;
    symbol: string;
  };
  destToken: {
    gas_price: string;
    gas_price_gwei: string;
    decimals: number;
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

// Includes all supported native tokens and stablecoins (i.e. for fees)
export enum GasToken {
  ETH = "ETH",
  AVAX = "AVAX",
  GLMR = "GLMR",
  FTM = "FTM",
  MATIC = "MATIC",
  USDC = "USDC",
  aUSDC = "aUSDC", //testnet only
  axlUSDC = "axlUSDC",
  AURORA = "aETH",
  BINANCE = "BNB",
  BNBCHAIN = "BNB",
  CELO = "CELO",
  KAVA = "KAVA",
  BASE = "ETH",
  FILECOIN = "FIL",
  OSMO = "OSMO",
  AXL = "AXL",
  POLYGON_ZKEVM = "ETH",
}

export interface AddGasOptions {
  amount?: string;
  refundAddress?: string;
  estimatedGasUsed?: number;
  gasMultipler?: number;
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
  estimatedGas?: number;
  gasMultipler?: number;
  shouldSubtractBaseFee?: boolean;
}

export interface QueryTransferOptions {
  depositAddress?: string;
  recipientAddress?: string;
}

export enum QueryTransferStatus {
  DEPOSIT_CONFIRMED = "deposit_confirmed",
  ASSET_SENT = "asset_sent",
  VOTED = "voted",
  BATCH_SIGNED = "batch_signed",
  IBC_SENT = "ibc_sent",
  EXECUTED = "executed",
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

export enum ApproveGatewayError {
  ALREADY_APPROVED = "already approved",
  ALREADY_EXECUTED = "already executed",
  SIGN_COMMAND_FAILED = "cannot sign command",
  CONFIRM_COMMAND_FAILED = "cannot confirm command",
  FETCHING_STATUS_FAILED = "cannot fetching status from axelarscan api",
  ERROR_BATCHED_COMMAND = "cannot find batch command",
  ERROR_GET_EVM_EVENT = "cannot get evm event",
  ERROR_BROADCAST_EVENT = "cannot broadcast event to destination chain",
  ERROR_UNKNOWN = "unknown error",
  ERROR_ACCOUNT_SEQUENCE_MISMATCH = "account sequence mismatch",
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

export const isNativeToken = (chain: string, selectedToken: GasToken): boolean => {
  const nativeTokenMap: Record<string, GasToken> = {
    ethereum: GasToken.ETH,
    avalanche: GasToken.AVAX,
    fantom: GasToken.FTM,
    polygon: GasToken.MATIC,
    moonbeam: GasToken.GLMR,
    aurora: GasToken.AURORA,
    binance: GasToken.BINANCE,
    bnbchain: GasToken.BINANCE,
    celo: GasToken.CELO,
    kava: GasToken.KAVA,
    base: GasToken.BASE,
    filecoin: GasToken.FILECOIN,
    linea: GasToken.ETH,
  };
  return nativeTokenMap[chain]?.toLowerCase() === selectedToken?.toLowerCase();
};
