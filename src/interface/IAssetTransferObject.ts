import {IAssetInfo, IChainInfo} from "./index";

export interface IAssetTransferObject {
	sourceChainInfo: IChainInfo;
	destinationChainInfo: IChainInfo;
	selectedSourceAsset: IAssetInfo;
	selectedDestinationAsset: IAssetInfo;
	recaptchaToken?: any;
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

	/*wait for deposit in axelarnet, i.e. for Cosmos >> <DEST_CHAIN> transfers*/
	WAIT_FOR_AXL_DEPOSIT = "WAIT_FOR_AXL_DEPOSIT",
	AXL_DEPOSIT_CONFIRMED = "AXL_DEPOSIT_CONFIRMED",

	/*wait for deposit in evm, i.e. for ETH >> <DEST_CHAIN> transfers*/
	WAIT_FOR_EVM_DEPOSIT = "WAIT_FOR_EVM_DEPOSIT",
	EVM_DEPOSIT_CONFIRMED = "EVM_DEPOSIT_CONFIRMED"
}

export interface ISocketListenerTopic {
	topic: ISocketListenerTypes
}