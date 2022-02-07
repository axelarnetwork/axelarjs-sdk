import {AssetInfoResponse, AssetTransferObject, AssetInfoWithTrace} from "../interface/AssetTransferObject";
import {
	AssetAndChainInfo, BlockchainWaitingService, CallbackStatus, CLIENT_API_POST_TRANSFER_ASSET, SourceOrDestination,
	StatusResponse
}                                                                   from "../interface";
import {RestServices}                                                from "../services/RestServices";
import getWaitingService                                             from "./status";
import {SocketServices}                                              from "../services/SocketServices";
import {validateDestinationAddress}                                  from "../utils";
import {EnvironmentConfigs, getConfigs}                              from "../constants";

export class TransferAssetBridge {

	private restServices: RestServices;
	private clientSocketConnect: SocketServices;
	private environment: string;

	constructor(environment: string) {
		console.log("TransferAssetBridge initiated");
		this.environment = environment;
		const configs: EnvironmentConfigs = getConfigs(environment);
		const resourceUrl: string = configs.resourceUrl;
		this.restServices = new RestServices(resourceUrl);
		this.clientSocketConnect = new SocketServices(resourceUrl);
	}

	public async transferAssets(message: AssetTransferObject,
	                            sourceCbs: CallbackStatus,
	                            destCbs: CallbackStatus,
	                            showAlerts: boolean = true
	): Promise<AssetInfoWithTrace> {

		const {selectedDestinationAsset, sourceChainInfo, destinationChainInfo} = message;

		if (!validateDestinationAddress(destinationChainInfo?.chainSymbol as string, selectedDestinationAsset))
			throw new Error(`invalid destination address in ${selectedDestinationAsset?.assetSymbol}`);

		const depositAddressWithTraceId: AssetInfoWithTrace = await this.getDepositAddress(message, showAlerts);
		const traceId: string = depositAddressWithTraceId.traceId;

		const srcAssetForDepositConfirmation: AssetInfoResponse = {
			...(depositAddressWithTraceId.assetInfo),
			traceId: depositAddressWithTraceId.traceId,
			sourceOrDestChain: "source"
		};
		const destAssetForTransferEvent: AssetInfoResponse = {
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

	public async getOneTimeCode(): Promise<AssetInfoWithTrace> {

		try {
			// return await AxelarAPI.axelarJsSDK.getOneTimeCode();
			return await (new Promise((resolve) => resolve({} as AssetInfoWithTrace)));
		}
		 catch (e: any) {
			throw e;
		}

	}

	public async getDepositAddress(message: AssetTransferObject, showAlerts: boolean): Promise<AssetInfoWithTrace> {
		try {
			return await this.restServices.post(CLIENT_API_POST_TRANSFER_ASSET, message as AssetTransferObject) as AssetInfoWithTrace;
		} catch (e: any) {
			if (showAlerts && e?.message && !e?.uncaught) {
				alert("There was a problem in attempting to generate a deposit address. Details: " + JSON.stringify(e));
			}
			throw e;
		}
	}

	private async confirmDeposit(assetAndChainInfo: AssetAndChainInfo,
	                             waitCb: StatusResponse,
	                             errCb: any,
	                             sOrDChain: SourceOrDestination
	) {

		const {assetInfo, sourceChainInfo} = assetAndChainInfo;
		const waitingService: BlockchainWaitingService = await getWaitingService(
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

	private async detectTransferOnDestinationChain(assetAndChainInfo: AssetAndChainInfo,
	                                               waitCb: StatusResponse,
	                                               errCb: any,
	                                               sOrDChain: SourceOrDestination
	) {

		const {assetInfo, destinationChainInfo} = assetAndChainInfo;
		const waitingService: BlockchainWaitingService = await getWaitingService(
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