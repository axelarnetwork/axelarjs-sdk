import { v4 as uuidv4 } from "uuid";
import {
  CallbackStatus,
  CLIENT_API_GET_OTC,
  CLIENT_API_POST_TRANSFER_ASSET,
  OTC,
  SourceOrDestination,
  StatusResponse,
} from "../services/types";
import { AssetInfo } from "../assets/types";
import {
  AssetTransferObject,
  AssetInfoWithTrace,
  AssetInfoResponse,
  AssetAndChainInfo,
} from "../chains/types";

import { RestServices, SocketServices } from "../services";
import { createWallet, getWaitingService } from "../utils";
import { validateDestinationAddress } from "../utils";
import { getConfigs } from "../constants";
import { GetDepositAddressDto } from "./types";

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

    // validate destination address
    const isAddressValid = validateDestinationAddress(
      destinationChainInfo?.chainSymbol,
      selectedDestinationAsset,
      this.environment
    );
    if (!isAddressValid)
      throw new Error(
        `invalid destination address in ${selectedDestinationAsset?.assetSymbol}`
      );

    // generate uuid to trace the whole flow
    const traceId = uuidv4();

    // get room id from rest server to initiate socket connection
    const { roomId } = await this.getInitRoomId(message, showAlerts, traceId);

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

  public async getFeeForChainAndAsset(
    chain: string,
    asset: string
  ): Promise<any> {
    try {
      return (await this.restServices.get(
        "/getFeeForChain" + `?chainName=${chain}&assetCommonKey=${asset}`
      )) as any;
    } catch (e: any) {
      throw e;
    }
  }

  public async getInitRoomId(
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

  async getDepositAddress(dto: GetDepositAddressDto): Promise<string> {
    // generate trace id
    const traceId = uuidv4();

    // use auth
    const wallet = createWallet();
    const { validationMsg } = await this.getOneTimeCode(
      wallet.address,
      traceId
    );
    const sig = await wallet.signMessage(validationMsg);

    const payload: AssetTransferObject = {
      ...dto.payload,
      signature: sig,
      publicAddr: wallet.address,
    };

    const { roomId } = await this.getInitRoomId(payload, false, traceId);
    if (!roomId) {
      throw new Error("Get deposit address could not be fetched");
    }

    // listen for link event to extract deposit address
    return new Promise(async (resolve, reject) => {
      await this.getLinkEvent(
        roomId,
        {
          assetInfo: {
            assetAddress: payload.selectedDestinationAsset.assetSymbol,
            traceId: traceId,
            sourceOrDestChain: "source",
          },
          sourceChainInfo: payload.sourceChainInfo,
          destinationChainInfo: payload.destinationChainInfo,
        },
        (success) => {
          const roomId = success.newRoomId;
          if (!roomId) reject("Could not extract deposit address");

          const depositAddress = this.extractDepositAddress(roomId);
          resolve(depositAddress);
        },
        (error: any) => reject(error),
        "source"
      );
    });
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

  private extractDepositAddress(roomId: string) {
    // eg: link-module=axelarnet-depositAddress=axelar1vcwr7x7dhq2ux5682c6am62uns9cy62cm6ktgwjqwjuj65yclajqhepd72
    const splitByHyphen = roomId.split("-");
    const depositAddressKV = splitByHyphen.filter((str) =>
      str.includes("depositAddress")
    )[0];
    const depositAddress = depositAddressKV.replace("depositAddress=", "");
    return depositAddress;
  }
}
