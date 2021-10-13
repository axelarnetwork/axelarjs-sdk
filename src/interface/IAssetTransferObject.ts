import {ITokenAddress} from "./IMiscTopics";
import {IAsset}        from "../constants";

export interface IAssetTransferObject {
	sourceTokenInfo: ITokenAddress;
	sourceAsset: IAsset;
	destinationTokenInfo: ITokenAddress;
}

export enum LinkType {
	BITCOIN = "/bitcoin.v1beta1.LinkRequest",
	EVM = "/evm.v1beta1.LinkRequest"
}

export interface ILinkRequestBody {
	"@type": LinkType;
	"sender": string;
	"recipient_addr": string;
	"recipient_chain": string;
}

export interface IBTCLinkRequestBody extends ILinkRequestBody {}
export interface IEVMLinkRequestBody extends ILinkRequestBody {
	"chain": string; //source chain
	"asset": string;
}