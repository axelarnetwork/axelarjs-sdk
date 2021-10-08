import {ITokenAddress} from "./IMiscTopics";
import {IAsset}        from "../constants";

export interface IAssetTransferObject {
	sourceTokenInfo: ITokenAddress;
	sourceAsset: IAsset;
	destinationTokenInfo: ITokenAddress;
}