import {ClientSocketConnect}                                                 from "./ClientSocketConnect";
import {IAssetTransferObject}                                                from "../interface/IAssetTransferObject";
import {CLIENT_API_POST_TRANSFER_ASSET, TRANSFER_RESULT, TransferAssetTypes} from "../interface";
import {ClientRest}                                                          from "./ClientRest";

export class TransferAssetBridge {

	private clientSocketConnect: ClientSocketConnect;
	private clientRest: ClientRest;

	constructor(resourceUrl: string) {
		console.log("TransferAssetBridge initiated");
		this.clientSocketConnect = new ClientSocketConnect(resourceUrl);
		this.clientRest = new ClientRest(resourceUrl);
	}

	public async transferAssets(message: IAssetTransferObject, waitCb: any): Promise<string> {
		this.listenForTransactionStatus(TransferAssetTypes.BTC_TO_EVM, message, waitCb);
		return this.getDepositAddress(message);
	}

	private async getDepositAddress(message: IAssetTransferObject): Promise<string> {
		return await this.clientRest.post(CLIENT_API_POST_TRANSFER_ASSET, message);
	}

	private listenForTransactionStatus(topic: TransferAssetTypes, message: IAssetTransferObject, waitCb: any): void {
		this.clientSocketConnect.emitMessageAndWaitForReply(topic, {message}, TRANSFER_RESULT, waitCb)
	}

}