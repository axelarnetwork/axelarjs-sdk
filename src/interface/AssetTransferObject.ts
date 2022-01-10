import {AssetInfo, ChainInfo, SourceOrDestination} from "./index";

export interface AssetTransferObject {
	sourceChainInfo: ChainInfo;
	destinationChainInfo: ChainInfo;
	selectedSourceAsset: AssetInfo;
	selectedDestinationAsset: AssetInfo;
	recaptchaToken?: any;
	useLegacyRecaptcha?: boolean;
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
	BITCOIN = "/bitcoin.v1beta1.LinkRequest",
	EVM = "/evm.v1beta1.LinkRequest",
	COS = "/axelarnet.v1beta1.LinkRequest"
}

export interface LinkRequestBody {
	"@type": LinkType;
	"recipient_addr": string;
	"recipient_chain": string;
}

export interface BTCLinkRequestBody extends LinkRequestBody {
}

export interface EVMLinkRequestBody extends LinkRequestBody {
	"chain": string; //source chain
	"asset": string;
}

export interface COSLinkRequestBody extends LinkRequestBody {
	"asset": string;
}

// for connections from ui >> bridge server
export enum SocketListenerTypes {
	/*axelarnet listener for deposit event*/
	WAIT_FOR_DEPOSIT = "WAIT_FOR_DEPOSIT",
	DEPOSIT_CONFIRMED = "DEPOSIT_CONFIRMED",
}

export interface SocketListenerTopic {
	topic: SocketListenerTypes
}