import {WaitingService}              from "./WaitingService";
import {IAsset, ISupportedChainType} from "../../constants";
import {ClientSocketConnect}                  from "../ClientSocketConnect";
import {ISocketListenerTypes, StatusResponse} from "../../interface";

export default class TendermintService extends WaitingService {

	constructor(chainInfo: ISupportedChainType, assetInfo: IAsset) {
		super(1, assetInfo.assetAddress as string);
	}

	public async wait(depositAddress: IAsset, interimStatusCb: StatusResponse, clientSocketConnect: ClientSocketConnect) {

		await clientSocketConnect.connect();

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