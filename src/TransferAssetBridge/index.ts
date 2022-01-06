import {IAssetInfoResponse, IAssetInfoWithTrace, IAssetTransferObject} from "../interface/IAssetTransferObject";
import {
	CLIENT_API_POST_TRANSFER_ASSET, IAssetAndChainInfo, IBlockchainWaitingService, ICallbackStatus, SourceOrDestination,
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

		const {selectedDestinationAsset, sourceChainInfo, destinationChainInfo} = message;

		if (!validateDestinationAddress(destinationChainInfo?.chainSymbol as string, selectedDestinationAsset))
			throw new Error(`invalid destination address in ${selectedDestinationAsset?.assetSymbol}`);

		const depositAddressWithTraceId: IAssetInfoWithTrace = await this.getDepositAddress(message, showAlerts);
		const traceId: string = depositAddressWithTraceId.traceId;

		const srcAssetForDepositConfirmation: IAssetInfoResponse = {
			...(depositAddressWithTraceId.assetInfo),
			traceId: depositAddressWithTraceId.traceId,
			sourceOrDestChain: "source"
		};
		const destAssetForTransferEvent: IAssetInfoResponse = {
			...selectedDestinationAsset,
			traceId,
			sourceOrDestChain: "destination"
		};

		this.confirmDeposit(
			{assetInfo: srcAssetForDepositConfirmation, sourceChainInfo, destinationChainInfo},
			sourceCbs.successCb,
			sourceCbs.failCb,
			"source"
		)
		.then(() => this.detectTransferOnDestinationChain(
			{assetInfo: destAssetForTransferEvent, sourceChainInfo, destinationChainInfo},
			destCbs.successCb,
			destCbs.failCb,
			"destination"
		))

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

	private async confirmDeposit(assetAndChainInfo: IAssetAndChainInfo,
	                             waitCb: StatusResponse,
	                             errCb: any,
	                             sOrDChain: SourceOrDestination
	) {

		const {assetInfo, sourceChainInfo} = assetAndChainInfo;
		const waitingService: IBlockchainWaitingService = await getWaitingService(
			sourceChainInfo,
			assetInfo,
			sOrDChain,
			this.environment
		);

		try {
			await waitingService.waitForDepositConfirmation(assetAndChainInfo, waitCb, this.clientSocketConnect);
		} catch (e) {
			errCb(e);
		}

	}

	private async detectTransferOnDestinationChain(assetAndChainInfo: IAssetAndChainInfo,
	                                               waitCb: StatusResponse,
	                                               errCb: any,
	                                               sOrDChain: SourceOrDestination
	) {

		const {assetInfo, destinationChainInfo} = assetAndChainInfo;
		const waitingService: IBlockchainWaitingService = await getWaitingService(
			destinationChainInfo,
			assetInfo,
			sOrDChain,
			this.environment
		);
		try {
			await waitingService.waitForTransferEvent(assetAndChainInfo, waitCb, this.clientSocketConnect);
		} catch (e) {
			errCb(e);
		}

	}

}