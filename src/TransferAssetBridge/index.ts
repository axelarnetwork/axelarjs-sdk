import {IAssetTransferObject}       from "../interface/IAssetTransferObject";
import {
	CLIENT_API_POST_TRANSFER_ASSET,
	IAssetInfo,
	IBlockchainWaitingService,
	ICallbackStatus,
	IChainInfo,
	StatusResponse
}                                   from "../interface";
import {ClientRest}                 from "./ClientRest";
import getWaitingService            from "./status";
import {ClientSocketConnect}        from "./ClientSocketConnect";
import {validateDestinationAddress} from "../utils";

export class TransferAssetBridge {

	private clientRest: ClientRest;
	private clientSocketConnect: ClientSocketConnect;

	constructor(resourceUrl: string) {
		console.log("TransferAssetBridge initiated");
		this.clientRest = new ClientRest(resourceUrl);
		this.clientSocketConnect = new ClientSocketConnect(resourceUrl);
		// this.clientSocketConnect.connect();

	}

	public async transferAssets(message: IAssetTransferObject,
	                            sourceCbs: ICallbackStatus,
	                            destCbs: ICallbackStatus
	): Promise<IAssetInfo> {

		if (!validateDestinationAddress(message?.selectedDestinationAsset))
			throw new Error(`invalid destination address in ${message?.selectedDestinationAsset?.assetSymbol}`);

		const depositAddress: IAssetInfo = await this.getDepositAddress(message);

		this.listenForTransactionStatus(depositAddress,
			message.sourceChainInfo,
			sourceCbs.successCb,
			sourceCbs.failCb
		).then(() => {
			this.listenForTransactionStatus(message.selectedDestinationAsset as IAssetInfo,
				message.destinationChainInfo,
				destCbs.successCb,
				destCbs.failCb
			);
		})

		return depositAddress;
	}

	private async getDepositAddress(message: IAssetTransferObject): Promise<IAssetInfo> {
		return await this.clientRest.post(CLIENT_API_POST_TRANSFER_ASSET, message);
	}

	private async listenForTransactionStatus(addressInformation: IAssetInfo,
	                                         chainInfo: IChainInfo,
	                                         waitCb: StatusResponse,
	                                         errCb: any
	) {

		const waitingService: IBlockchainWaitingService = getWaitingService(chainInfo.chainSymbol, chainInfo, addressInformation);

		try {
			await waitingService.wait(addressInformation, waitCb, this.clientSocketConnect);
		} catch (e) {
			errCb(e);
		}

	}

}