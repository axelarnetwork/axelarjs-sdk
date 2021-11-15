import {IAssetInfoSocketRequestBody, IAssetTransferObject} from "../interface/IAssetTransferObject";
import {
	CLIENT_API_POST_TRANSFER_ASSET,
	IAssetInfo,
	IBlockchainWaitingService,
	ICallbackStatus,
	IChainInfo,
	SourceOrDestination,
	StatusResponse
}                                                          from "../interface";
import {ClientRest}                      from "./ClientRest";
import getWaitingService                 from "./status";
import {ClientSocketConnect}             from "./ClientSocketConnect";
import {validateDestinationAddress}      from "../utils";
import {getConfigs, IEnvironmentConfigs} from "../constants";

interface IResponseForDepositAddress { traceId: string, assetInfo: IAssetInfo }
export class TransferAssetBridge {

	private clientRest: ClientRest;
	private clientSocketConnect: ClientSocketConnect;
	private environment: string;

	constructor(environment: string) {
		console.log("TransferAssetBridge initiated");
		this.environment = environment;
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

		const postResponse: IResponseForDepositAddress = await this.getDepositAddress(message);
		const traceId: string = postResponse.traceId;
		const sourceAssetInfoForWaitService: IAssetInfoSocketRequestBody = {
			...postResponse.assetInfo,
			traceId,
			sourceOrDestChain: "source"
		};
		const destinationAssetInfoForWaitService: IAssetInfoSocketRequestBody = {
			...message.selectedDestinationAsset,
			traceId,
			sourceOrDestChain: "destination"
		};

		this.listenForTransactionStatus(sourceAssetInfoForWaitService,
			message.sourceChainInfo,
			sourceCbs.successCb,
			sourceCbs.failCb,
			"source"
		).then(() => {
			this.listenForTransactionStatus(destinationAssetInfoForWaitService,
				message.destinationChainInfo,
				destCbs.successCb,
				destCbs.failCb,
				"destination"
			);
		})

		return sourceAssetInfoForWaitService;
	}

	private async getDepositAddress(message: IAssetTransferObject): Promise<IResponseForDepositAddress> {
		try {
			return await this.clientRest.post(CLIENT_API_POST_TRANSFER_ASSET, message) as IResponseForDepositAddress;
		} catch (e: any) {
			if (e?.message && !e?.uncaught) {
				alert("There was a problem in attempting to generate a deposit address. Details: " + JSON.stringify(e));
			}
			throw e;
		}
	}

	private async listenForTransactionStatus(addressInformation: IAssetInfoSocketRequestBody,
	                                         chainInfo: IChainInfo,
	                                         waitCb: StatusResponse,
	                                         errCb: any,
	                                         sOrDChain: SourceOrDestination
	) {

		const waitingService: IBlockchainWaitingService = getWaitingService(
			chainInfo.chainSymbol,
			chainInfo,
			addressInformation,
			sOrDChain,
			this.environment
		);

		try {
			await waitingService.wait(addressInformation, waitCb, this.clientSocketConnect);
		} catch (e) {
			errCb(e);
		}

	}

}