import {
  AssetInfoResponse,
  AssetTransferObject,
  AssetInfoWithTrace,
} from "../interface/AssetTransferObject";
import {
  AssetAndChainInfo,
  CallbackStatus,
  CLIENT_API_GET_OTC,
  CLIENT_API_POST_TRANSFER_ASSET,
  SourceOrDestination,
  StatusResponse,
} from "../interface";
import { RestServices } from "../services/RestServices";
import getWaitingService from "./status";
import { SocketServices } from "../services/SocketServices";
import { validateDestinationAddress } from "../utils";
import { EnvironmentConfigs, getConfigs } from "../constants";
import { OTC } from "../types";

export class TransferAssetBridge {
  private restServices: RestServices;
  private clientSocketConnect: SocketServices;
  private environment: string;

  constructor(environment: string) {
    console.log("TransferAssetBridge initiated");
    this.environment = environment;
    const configs: EnvironmentConfigs = getConfigs(environment);
    const resourceUrl = configs.resourceUrl;
    this.restServices = new RestServices(resourceUrl);
    this.clientSocketConnect = new SocketServices(resourceUrl);
  }

  public async transferAssets(
    message: AssetTransferObject,
    sourceCbs: CallbackStatus,
    destCbs: CallbackStatus,
    showAlerts = true
  ): Promise<AssetInfoWithTrace> {
    const { selectedDestinationAsset, sourceChainInfo, destinationChainInfo } =
      message;

    const isAddressValid = validateDestinationAddress(
      destinationChainInfo?.chainSymbol,
      selectedDestinationAsset
    );
    if (!isAddressValid)
      throw new Error(
        `invalid destination address in ${selectedDestinationAsset?.assetSymbol}`
      );

    const depositAddressWithTraceId = await this.getDepositAddress(
      message,
      showAlerts
    );
    const traceId = depositAddressWithTraceId.traceId;

    const srcAssetForDepositConfirmation: AssetInfoResponse = {
      ...depositAddressWithTraceId.assetInfo,
      traceId: depositAddressWithTraceId.traceId,
      sourceOrDestChain: "source",
    };
    const destAssetForTransferEvent: AssetInfoResponse = {
      ...selectedDestinationAsset,
      traceId,
      sourceOrDestChain: "destination",
    };

    await this.confirmDeposit(
      {
        assetInfo: srcAssetForDepositConfirmation,
        sourceChainInfo,
        destinationChainInfo,
      },
      sourceCbs.successCb,
      sourceCbs.failCb,
      "source"
    );
    await this.detectTransferOnDestinationChain(
      {
        assetInfo: destAssetForTransferEvent,
        sourceChainInfo,
        destinationChainInfo,
      },
      destCbs.successCb,
      destCbs.failCb,
      "destination"
    );

    return depositAddressWithTraceId;
  }

  public async getOneTimeCode(signerAddress: string): Promise<OTC> {
    try {
      const response = await this.restServices.get(
        CLIENT_API_GET_OTC + `?publicAddress=${signerAddress}`
      );
      return response;
    } catch (e: any) {
      throw e;
    }
  }

  public async getDepositAddress(
    message: AssetTransferObject,
    showAlerts: boolean
  ): Promise<AssetInfoWithTrace> {
    try {
      const response = await this.restServices.post(
        CLIENT_API_POST_TRANSFER_ASSET,
        message
      );
      return response;
    } catch (e: any) {
      if (showAlerts && e?.message && !e?.uncaught) {
        alert(
          "There was a problem in attempting to generate a deposit address. Details: " +
            JSON.stringify(e)
        );
      }
      throw e;
    }
  }

  private async confirmDeposit(
    assetAndChainInfo: AssetAndChainInfo,
    waitCb: StatusResponse,
    errCb: any,
    sOrDChain: SourceOrDestination
  ) {
    const { assetInfo, sourceChainInfo } = assetAndChainInfo;
    const waitingService = await getWaitingService(
      sourceChainInfo,
      assetInfo,
      sOrDChain,
      this.environment
    );

    try {
      await waitingService.waitForDepositConfirmation(
        assetAndChainInfo,
        waitCb,
        this.clientSocketConnect
      );
    } catch (e) {
      errCb(e);
    }
  }

  private async detectTransferOnDestinationChain(
    assetAndChainInfo: AssetAndChainInfo,
    waitCb: StatusResponse,
    errCb: any,
    sOrDChain: SourceOrDestination
  ) {
    const { assetInfo, destinationChainInfo } = assetAndChainInfo;
    const waitingService = await getWaitingService(
      destinationChainInfo,
      assetInfo,
      sOrDChain,
      this.environment
    );
    try {
      await waitingService.waitForTransferEvent(
        assetAndChainInfo,
        waitCb,
        this.clientSocketConnect
      );
    } catch (e) {
      errCb(e);
    }
  }
}
