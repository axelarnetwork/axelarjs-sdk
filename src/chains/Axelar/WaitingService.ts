import {
	IAssetAndChainInfo,
	IAssetInfo,
	IBlockchainWaitingService,
	IChainInfo,
	ISocketListenerTypes,
	StatusResponse
} from "../../interface";
import {BaseWaitingService}                                                                      from "../models/BaseWaitingService";
import {SocketServices}                                                                          from "../../services/SocketServices";

export default class WaitingService extends BaseWaitingService implements IBlockchainWaitingService {

	constructor(chainInfo: IChainInfo, assetInfo: IAssetInfo) {
		super(1, assetInfo.assetAddress as string);
	}

	public async waitForDepositConfirmation(assetAndChainInfo: IAssetAndChainInfo, interimStatusCb: StatusResponse, clientSocketConnect: SocketServices) {
		return this.wait(assetAndChainInfo, interimStatusCb, clientSocketConnect);
	}

	public async waitForTransferEvent(assetAndChainInfo: IAssetAndChainInfo, interimStatusCb: StatusResponse, clientSocketConnect: SocketServices) {
		return this.wait(assetAndChainInfo, interimStatusCb, clientSocketConnect);
	}
}