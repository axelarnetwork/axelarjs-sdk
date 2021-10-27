import {IAssetInfo, IBlockchainWaitingService, IChainInfo, ISocketListenerTypes, StatusResponse} from "../../interface";
import {BaseWaitingService}                                                                      from "../models/BaseWaitingService";
import {ClientSocketConnect}                                                                     from "../../TransferAssetBridge/ClientSocketConnect";

export default class WaitingService extends BaseWaitingService implements IBlockchainWaitingService {

	constructor(chainInfo: IChainInfo, assetInfo: IAssetInfo) {
		super(1, assetInfo.assetAddress as string);
	}

	public async wait(depositAddress: IAssetInfo, interimStatusCb: StatusResponse, clientSocketConnect: ClientSocketConnect) {

		const data: any = await clientSocketConnect.emitMessageAndWaitForReply(
			ISocketListenerTypes.WAIT_FOR_AXL_DEPOSIT,
			depositAddress,
			ISocketListenerTypes.AXL_DEPOSIT_CONFIRMED,
			((data: any) => {
				data.axelarRequiredNumConfirmations = this.numConfirmations;
				interimStatusCb(data);
			}).bind(this)
		);
		return data;

	}
}