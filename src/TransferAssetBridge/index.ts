import {IAssetTransferObject}            from "../interface/IAssetTransferObject";
import {
	CLIENT_API_POST_TRANSFER_ASSET,
	IAssetInfo,
	IBlockchainWaitingService,
	ICallbackStatus,
	IChainInfo,
	SourceOrDestination,
	StatusResponse
}                                        from "../interface";
import {ClientRest}                      from "./ClientRest";
import getWaitingService                 from "./status";
import {ClientSocketConnect}             from "./ClientSocketConnect";
import {validateDestinationAddress}      from "../utils";
import {getConfigs, IEnvironmentConfigs} from "../constants";

export class TransferAssetBridge {

	private clientRest: ClientRest;
	private clientSocketConnect: ClientSocketConnect;

	constructor(environment: string) {
		console.log("TransferAssetBridge initiated");
		const configs: IEnvironmentConfigs = getConfigs(environment);
		const resourceUrl: string = configs.resourceUrl;
		this.clientRest = new ClientRest(resourceUrl);
		this.clientSocketConnect = new ClientSocketConnect(resourceUrl);
	}

	public async transferAssets(message: IAssetTransferObject,
	                            sourceCbs: ICallbackStatus,
	                            destCbs: ICallbackStatus
	): Promise<IAssetInfo> {

		if (!validateDestinationAddress(message?.destinationChainInfo?.chainSymbol, message?.selectedDestinationAsset))
			throw new Error(`invalid destination address in ${message?.selectedDestinationAsset?.assetSymbol}`);

		const depositAddress: IAssetInfo = await this.getDepositAddress(message);

		this.listenForTransactionStatus(depositAddress,
			message.sourceChainInfo,
			sourceCbs.successCb,
			sourceCbs.failCb,
			"source"
		).then(() => {
			this.listenForTransactionStatus(message.selectedDestinationAsset as IAssetInfo,
				message.destinationChainInfo,
				destCbs.successCb,
				destCbs.failCb,
				"destination"
			);
		})

		return depositAddress;
	}

	private async getDepositAddress(message: IAssetTransferObject): Promise<IAssetInfo> {
		try {
			return await this.clientRest.post(CLIENT_API_POST_TRANSFER_ASSET, message);
		} catch (e: any) {
			if (e?.message) {
				alert(e + ". Gotta protect our bridge server.");
			}
			throw e;
		}
	}

	private async listenForTransactionStatus(addressInformation: IAssetInfo,
	                                         chainInfo: IChainInfo,
	                                         waitCb: StatusResponse,
	                                         errCb: any,
	                                         sOrDChain: SourceOrDestination
	) {

		const waitingService: IBlockchainWaitingService = getWaitingService(chainInfo.chainSymbol, chainInfo, addressInformation, sOrDChain);

		try {
			await waitingService.wait(addressInformation, waitCb, this.clientSocketConnect);
		} catch (e) {
			errCb(e);
		}

	}

}