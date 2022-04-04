import { v4 as uuidv4 } from "uuid";
import {
  CallbackStatus,
  CLIENT_API_GET_FEE,
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

import { RestService, SocketService } from "../services";
import {
  createWallet,
  getWaitingService,
  validateDestinationAddressByChainName,
} from "../utils";
import { validateDestinationAddressByChainSymbol } from "../utils";
import { getConfigs } from "../constants";
import {
  GetDepositAddressDto,
  GetDepositAddressPayload,
  TransferAssetBridgeConfig,
} from "./types";

export class TransferAssetBridge {
  readonly environment: string;
  readonly resourceUrl: string;

  readonly api: RestService;
  readonly socket: SocketService;

  constructor(config: TransferAssetBridgeConfig) {
    const configs = getConfigs(config.environment);

    this.environment = config.environment;
    this.resourceUrl = configs.resourceUrl;
    this.api = new RestService(this.resourceUrl);
    this.socket = new SocketService(this.resourceUrl);
  }

  public async getFeeForChainAndAsset(
    chain: string,
    asset: string
  ): Promise<any> {
    return this.api
      .get_v2(
        `${CLIENT_API_GET_FEE}?chainName=${chain}&assetCommonKey=${asset}`
      )
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
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

  public async getOneTimeCode(
    signerAddress: string,
    traceId: string
  ): Promise<OTC> {
    const otc: OTC = await this.api
      .get_v2(`${CLIENT_API_GET_OTC}?publicAddress=${signerAddress}`, traceId)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });

    return otc;
  }

  async getInitRoomId(
    payload: GetDepositAddressPayload & { signature: string },
    traceId: string
  ): Promise<string> {
    type RoomIdResponse = Record<"data", Record<"roomId", string>>;

    const response: RoomIdResponse = await this.api
      .post_v2(CLIENT_API_POST_TRANSFER_ASSET, payload, traceId)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });

    const roomId = response?.data?.roomId;
    return roomId;
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

    const roomId = await this.getInitRoomId(payload, traceId);
    const newRoomId = await this.getLinkEvent(roomId);
    const depositAddress = this.extractDepositAddress(newRoomId);

    console.log("deposit address!", depositAddress);

    return depositAddress;
  }

  async getLinkEvent(roomId: string): Promise<string> {
    const newRoomId = await this.socket
      .joinRoomAndWaitForEvent(roomId)
      .catch((error) => {
        throw error;
      });

    return newRoomId;
  }

  private extractDepositAddress(roomId: string) {
    // eg: {"depositAddress":"axelar1hwfjznc7zqfdfexczsec9rrz7cetyu3jlg358ugsxfvj8gjlcfzqjynltz","sourceModule":"axelarnet","type":"deposit-confirmation"}
    return JSON.parse(roomId)?.depositAddress;
  }
}
