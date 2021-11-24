import {IAssetInfoResponse, IAssetInfoWithTrace, IAssetTransferObject} from "../interface/IAssetTransferObject";
import {
	CLIENT_API_POST_TRANSFER_ASSET,
	IBlockchainWaitingService,
	ICallbackStatus,
	IChainInfo,
	SourceOrDestination,
	StatusResponse
}                                                                      from "../interface";
import {RestServices}                                                  from "../services/RestServices";
import getWaitingService                                               from "./status";
import {SocketServices}                                                from "../services/SocketServices";
import {validateDestinationAddress}                                    from "../utils";
import {getConfigs, IEnvironmentConfigs}                               from "../constants";

export class TransferAssetBridge {

	private restServices: RestServices;
	private clientSocketConnect: SocketServices;
	private environment: string;

	constructor(environment: string) {
		console.log("TransferAssetBridge initiated");
		this.environment = environment;
		const configs: IEnvironmentConfigs = getConfigs(environment);
		const resourceUrl: string = configs.resourceUrl;
		this.restServices = new RestServices(resourceUrl);
		this.clientSocketConnect = new SocketServices(resourceUrl);
	}

	public async transferAssets(message: IAssetTransferObject,
	                            sourceCbs: ICallbackStatus,
	                            destCbs: ICallbackStatus,
	                            showAlerts: boolean = true
	): Promise<IAssetInfoWithTrace> {

		if (!validateDestinationAddress(message?.destinationChainInfo?.chainSymbol, message?.selectedDestinationAsset))
			throw new Error(`invalid destination address in ${message?.selectedDestinationAsset?.assetSymbol}`);

		const depositAddressWithTraceId: IAssetInfoWithTrace = await this.getDepositAddress(message, showAlerts);
		const traceId: string = depositAddressWithTraceId.traceId;

		const sourceAssetInfoForWaitService: IAssetInfoResponse = {
			...depositAddressWithTraceId.assetInfo,
			traceId: depositAddressWithTraceId.traceId,
			sourceOrDestChain: "source"
		};
		const destinationAssetInfoForWaitService: IAssetInfoResponse = {
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

		return depositAddressWithTraceId;
	}

	private async getDepositAddress(message: IAssetTransferObject, showAlerts: boolean): Promise<IAssetInfoWithTrace> {
		try {
			return await this.restServices.post(CLIENT_API_POST_TRANSFER_ASSET, message) as IAssetInfoWithTrace;
		} catch (e: any) {
			if (showAlerts && e?.message && !e?.uncaught) {
				alert("There was a problem in attempting to generate a deposit address. Details: " + JSON.stringify(e));
			}
			throw e;
		}
	}

	private async listenForTransactionStatus(addressInformation: IAssetInfoResponse,
	                                         chainInfo: IChainInfo,
	                                         waitCb: StatusResponse,
	                                         errCb: any,
	                                         sOrDChain: SourceOrDestination
	) {

		const waitingService: IBlockchainWaitingService = await getWaitingService(
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