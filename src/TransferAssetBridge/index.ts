import {ClientSocketConnect}                                                  from "./ClientSocketConnect";
import {IAssetTransferObject}                                                 from "../interface/IAssetTransferObject";
import {CLIENT_API_POST_TRANSFER_ASSET, IBlockCypherResponse, ITokenAddress,} from "../interface";
import {ClientRest}                                                           from "./ClientRest";
import getWaitingService                                                      from "./status";

export type StatusResponse = IBlockCypherResponse
	| (() => void);

export class TransferAssetBridge {

	private clientRest: ClientRest;

	constructor(resourceUrl: string) {
		console.log("TransferAssetBridge initiated");
		this.clientRest = new ClientRest(resourceUrl);
	}

	public async transferAssets(message: IAssetTransferObject, successCb: StatusResponse, errCb: any): Promise<ITokenAddress> {
		const depositAddress: ITokenAddress = await this.getDepositAddress(message);
		this.listenForTransactionStatus(depositAddress, successCb, errCb).then(() => {
			this.listenForTransactionStatus(message.destinationTokenInfo as ITokenAddress, successCb, errCb);
		})

		return depositAddress;
	}

	private async getDepositAddress(message: IAssetTransferObject): Promise<ITokenAddress> {
		return await this.clientRest.post(CLIENT_API_POST_TRANSFER_ASSET, message);
	}

	private async listenForTransactionStatus(addressInformation: ITokenAddress, waitCb: StatusResponse, errCb: any) {
		const waitingService = addressInformation?.tokenSymbol && getWaitingService(addressInformation.tokenSymbol);
		try {
			await waitingService.wait(addressInformation, waitCb);
		} catch (e) {
			errCb(e);
		}
	}

}