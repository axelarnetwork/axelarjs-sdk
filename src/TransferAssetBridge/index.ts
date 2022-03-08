import { v4 as uuidv4 } from "uuid";
import {
  AssetInfoResponse,
  AssetTransferObject,
  AssetInfoWithTrace,
} from "../interface/AssetTransferObject";
import {
  AssetAndChainInfo,
  AssetInfo,
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
import { getConfigs } from "../constants";
import { OTC } from "../types";

export class TransferAssetBridge {
  private restServices: RestServices;
  private clientSocketConnect: SocketServices;
  private environment: string;

  constructor(environment: string) {
    console.log("TransferAssetBridge initiated");
    this.environment = environment;
    const configs = getConfigs(environment);
    const resourceUrl = configs.resourceUrl;
    this.restServices = new RestServices(resourceUrl);
    this.clientSocketConnect = new SocketServices(resourceUrl);
  }

  /**
   * @deprecated The method should not be used and will soon be removed
   */
  public async transferAssets(
    message: AssetTransferObject,
    sourceCbs: CallbackStatus,
    destCbs: CallbackStatus,
    showAlerts = true
  ): Promise<AssetInfoWithTrace> {
    const {
      selectedDestinationAsset,
      sourceChainInfo,
      destinationChainInfo,
      selectedSourceAsset,
    } = message;

    const isAddressValid = validateDestinationAddress(
      destinationChainInfo?.chainSymbol,
      selectedDestinationAsset
    );
    if (!isAddressValid)
      throw new Error(
        `invalid destination address in ${selectedDestinationAsset?.assetSymbol}`
      );

    const traceId = uuidv4();

    // get room id from rest server to initiate socket connection
    const { roomId } = await this.getDepositAddress(
      message,
      showAlerts,
      traceId
    );

    let srcAssetForDepositConfirmation: AssetInfoResponse = {
      assetAddress: "0x",
      traceId,
      sourceOrDestChain: "source",
    };

    const linkData: any = await this.getLinkEvent(
      roomId,
      {
        assetInfo: srcAssetForDepositConfirmation,
        sourceChainInfo,
        destinationChainInfo,
      },
      (success) => console.log(success),
      (error: any) => console.log(error),
      "source"
    );

    console.log({
      linkData,
    });

    const assetInfo: AssetInfo = {
      assetAddress: linkData?.Attributes?.depositAddress,
      assetSymbol: selectedSourceAsset?.assetSymbol,
      common_key: selectedSourceAsset?.common_key,
    };

    srcAssetForDepositConfirmation = Object.assign(
      srcAssetForDepositConfirmation,
      assetInfo
    );

    const destAssetForTransferEvent: AssetInfoResponse = {
      ...selectedDestinationAsset,
      traceId,
      sourceOrDestChain: "destination",
    };

    this.confirmDeposit(
      linkData?.newRoomId,
      {
        assetInfo: srcAssetForDepositConfirmation,
        sourceChainInfo,
        destinationChainInfo,
      },
      sourceCbs.successCb,
      sourceCbs.failCb,
      "source"
    ).then(() => {
      return this.detectTransferOnDestinationChain(
        `link-module=evm-destinationAddress=${selectedDestinationAsset.assetAddress}`,
        {
          assetInfo: destAssetForTransferEvent,
          sourceChainInfo,
          destinationChainInfo,
        },
        destCbs.successCb,
        destCbs.failCb,
        "destination"
      );
    });

    console.log({
      assetInfo,
      traceId,
    });

    return {
      assetInfo,
      traceId,
    } as AssetInfoWithTrace;
  }

  public async getOneTimeCode(
    signerAddress: string,
    traceId: string
  ): Promise<OTC> {
    try {
      const response = await this.restServices.get(
        CLIENT_API_GET_OTC + `?publicAddress=${signerAddress}`
      );
      return response;
    } catch (e: any) {
      throw e;
    }
  }

  /**
   * TODO: rename to initAssetTransfer
   */
  public async getDepositAddress(
    payload: AssetTransferObject,
    showAlerts: boolean,
    traceId: string
  ): Promise<{ roomId: string }> {
    try {
      const response = await this.restServices.post(
        CLIENT_API_POST_TRANSFER_ASSET,
        payload,
        {
          "x-trace-id": traceId,
        }
      );
      return response.data;
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

  /**
   * @deprecated The method should not be used and will soon be removed
   */
  async getLinkEvent(
    roomId: string,
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
      const response = await waitingService.waitForLinkEvent(
        roomId,
        waitCb,
        this.clientSocketConnect
      );
      return response;
    } catch (e) {
      errCb(e);
    }
  }

  private async confirmDeposit(
    roomId: string,
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
      const response = await waitingService.waitForDepositConfirmation(
        roomId,
        waitCb,
        this.clientSocketConnect
      );
      return response;
    } catch (e) {
      errCb(e);
    }
  }

  /**
   * @deprecated The method should not be used and will soon be removed
   */
  private async detectTransferOnDestinationChain(
    roomId: string,
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
      if (assetAndChainInfo.sourceChainInfo.module === "evm") {
        // evm -> cosmos transfer
        await waitingService.waitForTransferEvent(
          assetAndChainInfo,
          waitCb,
          this.clientSocketConnect,
          roomId
        );
      } else {
        // cosmos -> evm transfer
        await waitingService.waitForTransferEvent(
          assetAndChainInfo,
          waitCb,
          this.clientSocketConnect,
          roomId
        );
      }
    } catch (e) {
      errCb(e);
    }
  }
}
