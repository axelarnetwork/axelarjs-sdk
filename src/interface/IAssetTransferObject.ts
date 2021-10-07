import {ITokenAddress} from "./IMiscTopics";

export interface IAssetTransferObject {
	sourceTokenInfo: ITokenAddress;
	destinationTokenInfo: ITokenAddress;
}