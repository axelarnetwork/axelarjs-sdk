import { Environment } from "../../libs";
import { AssetInfo } from "../../assets/types";

import { SourceOrDestination } from "../../services/types";

export interface Chain {
  chainInfo: ChainInfo;
  validateAddress: (destinationAddress: string) => boolean;
}

export interface AssetAndChainInfo {
  assetInfo: AssetInfoResponse;
  sourceChainInfo: ChainInfo;
  destinationChainInfo: ChainInfo;
}

export interface ChainInfo {
  id: string;
  assets: AssetInfo[];
  chainSymbol: string;
  chainName: string;
  fullySupported: boolean;
  estimatedWaitTime: number;
  txFeeInPercent: number;
  module: "axelarnet" | "evm";
  confirmLevel?: number;
  chainIdentifier: {
    devnet: string;
    testnet: string;
    mainnet: string;
  };
  nativeAsset: string[];
  addressPrefix: string;
}

export interface AssetTransferObject {
  sourceChainInfo: ChainInfo;
  destinationChainInfo: ChainInfo;
  selectedSourceAsset: AssetInfo;
  selectedDestinationAsset: AssetInfo;
  signature: string;
  publicAddr: string;
  transactionTraceId?: string;
}

export interface AssetInfoWithTrace extends AssetInfo {
  traceId: string;
  assetInfo: AssetInfo;
}

export interface AssetInfoResponse extends AssetInfo {
  sourceOrDestChain: SourceOrDestination;
  traceId: string;
}

export enum LinkType {
  EVM = "/axelar.evm.v1beta1.LinkRequest",
  COS = "/axelar.axelarnet.v1beta1.LinkRequest",
}

export interface LinkRequestBody {
  "@type": LinkType;
  recipient_addr: string;
  recipient_chain: string;
}

export interface EVMLinkRequestBody extends LinkRequestBody {
  chain: string; //source chain
  asset: string;
}

export interface COSLinkRequestBody extends LinkRequestBody {
  asset: string;
}

// for connections from ui >> bridge server
export enum SocketListenerTypes {
  /*axelarnet listener for deposit event*/
  LINK = "LINK",
  WAIT_FOR_DEPOSIT = "WAIT_FOR_DEPOSIT",
  DEPOSIT_CONFIRMED = "DEPOSIT_CONFIRMED",
}

export interface SocketListenerTopic {
  topic: SocketListenerTypes;
}

export type LoadChainConfig = {
  environment: Environment;
};
