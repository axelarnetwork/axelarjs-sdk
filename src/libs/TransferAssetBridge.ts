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
import {
  createWallet,
  getWaitingService,
  validateDestinationAddressByChainName,
} from "../utils";
import { validateDestinationAddressByChainSymbol } from "../utils";
import { getConfigs } from "../constants";
import { GetDepositAddressDto, GetDepositAddressPayload } from "./types";

export class TransferAssetBridge {
  private restServices: RestServices;
  private clientSocketConnect: SocketServices;
  private environment: string;
  private resourceUrl: string;

  constructor(environment: string) {
    this.environment = environment;
    const configs = getConfigs(environment);
    this.resourceUrl = configs.resourceUrl;
    this.restServices = new RestServices(this.resourceUrl);
    this.clientSocketConnect = new SocketServices(this.resourceUrl);
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
    const isAddressValid = validateDestinationAddressByChainSymbol(
      destinationChainInfo?.chainSymbol,
      selectedDestinationAsset.assetAddress as string,
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

  public async getTransferFee(
    sourceChain: string,
    destinationChain: string,
    asset: string
  ): Promise<number> {
    try {
      const sourceChainFeeInfo = await this.getFeeForChainAndAsset(
        sourceChain,
        asset
      );
      const destinationChainFeeInfo = await this.getFeeForChainAndAsset(
        destinationChain,
        asset
      );
      return (
        +sourceChainFeeInfo?.fee_info?.min_fee +
        +destinationChainFeeInfo?.fee_info?.min_fee
      );
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

  async getInitRoomId_v2(
    payload: GetDepositAddressPayload & { signature: string },
    traceId: string
  ) {
    return this.restServices
      .post_v2(CLIENT_API_POST_TRANSFER_ASSET, payload, traceId)
      .then((response) => response.data)
      .catch((error) => {
        throw error;
      });
  }

  async getDepositAddress(dto: GetDepositAddressDto): Promise<string> {
    // generate trace id
    const traceId = uuidv4();

    const isDestinationAddressValid = validateDestinationAddressByChainName(
      dto.payload.toChain,
      dto.payload.destinationAddress,
      this.environment
    );
    if (!isDestinationAddressValid)
      throw new Error(
        `Invalid destination address for chain ${dto.payload.toChain}`
      );

    // use auth
    const wallet = createWallet();
    const { validationMsg } = await this.getOneTimeCode(
      wallet.address,
      traceId
    );
    const sig = await wallet.signMessage(validationMsg);

    const payload: GetDepositAddressPayload & {
      signature: string;
      publicAddress: string;
    } = {
      ...dto.payload,
      signature: sig,
      publicAddress: wallet.address,
    };

    const { roomId } = await this.getInitRoomId_v2(payload, traceId);
    const newRoomId = await this.getLinkEvent_v2(roomId);
    const depositAddress = this.extractDepositAddress(newRoomId);

    return depositAddress;
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

  async getLinkEvent_v2(roomId: string): Promise<string> {
    const sockets = new SocketServices(this.resourceUrl);

    return new Promise((resolve) => {
      sockets.joinRoomAndWaitForEvent(roomId, (data: any) => {
        resolve(data.newRoomId);
      });
    });
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
