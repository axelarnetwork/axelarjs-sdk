// TODO: maybe we can delete this?
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

	public async wait(assetAndChainInfo: IAssetAndChainInfo, interimStatusCb: any, clientSocketConnect: SocketServices) {

		const data: any = await clientSocketConnect.emitMessageAndWaitForReply(
			ISocketListenerTypes.WAIT_FOR_IBC_TRANSFER,
			assetAndChainInfo,
			ISocketListenerTypes.IBC_TRANSFER_CONFIRMED,
			((data: any) => {
				data.axelarRequiredNumConfirmations = this.numConfirmations;
				interimStatusCb(data);
			}).bind(this)
		);
		return data;

	}
}