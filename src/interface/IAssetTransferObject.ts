import {IAssetInfo, IChainInfo, SourceOrDestination} from "./index";

export interface IAssetTransferObject {
	sourceChainInfo: IChainInfo;
	destinationChainInfo: IChainInfo;
	selectedSourceAsset: IAssetInfo;
	selectedDestinationAsset: IAssetInfo;
	recaptchaToken?: any;
	transactionTraceId?: string;
}

export interface IAssetInfoWithTrace extends IAssetInfo {
	traceId: string;
	assetInfo: IAssetInfo;
}

export interface IAssetInfoResponse extends IAssetInfo {
	sourceOrDestChain: SourceOrDestination;
	traceId: string;
}

export enum LinkType {
	BITCOIN = "/bitcoin.v1beta1.LinkRequest",
	EVM = "/evm.v1beta1.LinkRequest",
	COS = "/axelarnet.v1beta1.LinkRequest"
}

export interface ILinkRequestBody {
	"@type": LinkType;
	"sender": string;
	"recipient_addr": string;
	"recipient_chain": string;
}

export interface IBTCLinkRequestBody extends ILinkRequestBody {
}

export interface IEVMLinkRequestBody extends ILinkRequestBody {
	"chain": string; //source chain
	"asset": string;
}

export interface ICOSLinkRequestBody extends ILinkRequestBody {
	"asset": string;
}

// for connections from ui >> bridge server
export enum ISocketListenerTypes {

	/*wait for deposit in axelarnet*/
	WAIT_FOR_DEPOSIT = "WAIT_FOR_DEPOSIT",
	DEPOSIT_CONFIRMED = "DEPOSIT_CONFIRMED",

}

export interface ISocketListenerTopic {
	topic: ISocketListenerTypes
}