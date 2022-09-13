import { v4 as uuidv4 } from "uuid";
import { CLIENT_API_GET_OTC, CLIENT_API_POST_TRANSFER_ASSET, OTC } from "../services/types";

import { RestService, SocketService } from "../services";
import { createWallet, validateDestinationAddressByChainName } from "../utils";

import { getConfigs } from "../constants";
import { AxelarAssetTransferConfig, Environment } from "./types";
import {
  defaultAbiCoder,
  formatBytes32String,
  getCreate2Address,
  hexlify,
  hexZeroPad,
  Interface,
  keccak256,
  solidityPack,
  toUtf8Bytes,
} from "ethers/lib/utils";
import DepositReceiver from "./abi/deposit-service/DepositReceiver.json";
import DepositReceiverABI from "@axelar-network/axelar-cgp-solidity/interfaces/IAxelarDepositService.sol/IAxelarDepositService.json"
import ReceiverImplementation from "./abi/deposit-service/ReceiverImplementation.json";

export class AxelarAssetTransfer {
  readonly environment: Environment;
  readonly resourceUrl: string;

  readonly api: RestService;
  readonly depositServiceApi: RestService;

  constructor(config: AxelarAssetTransferConfig) {
    const configs = getConfigs(config.environment);

    this.environment = config.environment;
    this.resourceUrl = configs.resourceUrl;

    // handle resource url overwrite (for tests)
    if (config.overwriteResourceUrl) this.resourceUrl = config.overwriteResourceUrl;

    this.api = new RestService(this.resourceUrl);
    this.depositServiceApi = new RestService(configs.depositServiceUrl);
  }

  async getDepositAddressForNativeWrap(
    fromChain: string,
    toChain: string,
    destinationAddress: string,
    refundAddress: string,
    salt?: number
  ): Promise<string> {
    const hexSalt = hexZeroPad(hexlify((salt || salt === 0) ? salt : new Date().toString()), 32);
    const { address } = await this.getDepositAddressFromRemote(
      "wrap",
      fromChain,
      toChain,
      destinationAddress,
      refundAddress,
      hexSalt
    );

    const expectedAddress = this.validateOfflineDepositAddress(
      "wrap",
      toChain,
      destinationAddress,
      refundAddress,
      hexSalt
    );

    if (address !== expectedAddress) return "";

    return address;
  }

  async getDepositAddressForNativeUnwrap(
    fromChain: string,
    toChain: string,
    destinationAddress: string,
    refundAddress: string,
    salt?: number
  ): Promise<string> {
    const hexSalt = hexZeroPad(hexlify((salt || salt === 0) ? salt : new Date().toString()), 32);
    const { address: interimAddress } = await this.getDepositAddressFromRemote(
      "unwrap",
      "",
      toChain,
      destinationAddress,
      refundAddress,
      hexSalt
    );

    const expectedAddress = this.validateOfflineDepositAddress(
      "unwrap",
      "",
      destinationAddress,
      refundAddress,
      hexSalt
    );

    if (interimAddress !== expectedAddress) return "";

    const realDepositAddress = await this.getDepositAddress(fromChain, toChain, interimAddress, "uaxl");

    return realDepositAddress;
  }

  async getDepositAddressFromRemote(
    wrapOrUnWrap: "wrap" | "unwrap",
    fromChain: string,
    toChain: string,
    destinationAddress: string,
    refundAddress: string,
    hexSalt: string
  ): Promise<{ address: string }> {

    console.log("calling this");
    const endpoint = wrapOrUnWrap === "wrap" ? "/deposit/wrap" : "/deposit/unwrap";
    return await this.depositServiceApi
      .post(endpoint, {
        salt: hexSalt,
        source_chain: fromChain,
        destination_chain: toChain,
        destination_address: destinationAddress,
        refund_address: refundAddress,
      })
      .catch(() => ({ address: "" }));
  }

  public validateOfflineDepositAddress(
    wrapOrUnWrap: "wrap" | "unwrap",
    toChain: string,
    destinationAddress: string,
    refundAddress: string,
    hexSalt: string
  ) {
    const receiverInterface = new Interface(ReceiverImplementation.abi);
    const functionData =
      wrapOrUnWrap === "wrap"
        ? receiverInterface.encodeFunctionData("receiveAndSendNative", [
            refundAddress,
            toChain,
            destinationAddress,
          ])
        : receiverInterface.encodeFunctionData("receiveAndUnwrapNative", [
            refundAddress,
            destinationAddress,
          ]);

    const address = getCreate2Address(
      "0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955", //confirmed deposit service address on testnet
      hexSalt,
      keccak256(
        solidityPack(
          ["bytes", "bytes"],
          [
            DepositReceiver.bytecode,
            defaultAbiCoder.encode(["bytes", "address"], [functionData, refundAddress]),
          ]
        )
      )
    );
    return address;
  }

  async getDepositAddress(
    fromChain: string,
    toChain: string,
    destinationAddress: string,
    asset: string,
    options?: {
      _traceId: string;
    }
  ): Promise<string> {
    // use trace ID sent in by invoking user, or otherwise generate a new one
    const traceId = options?._traceId || uuidv4();

    // verify destination address format
    const isDestinationAddressValid = validateDestinationAddressByChainName(
      toChain,
      destinationAddress,
      this.environment
    );
    if (!isDestinationAddressValid)
      throw new Error(`Invalid destination address for chain ${toChain}`);

    // auth/rate limiting
    const wallet = createWallet();

    // sign validation message
    const { validationMsg } = await this.getOneTimeCode(wallet.address, traceId);
    const signature = await wallet.signMessage(validationMsg);

    // get room id to listen for deposit address (to be extracted from link event)
    const roomId = await this.getInitRoomId(
      fromChain,
      toChain,
      destinationAddress,
      asset,
      wallet.address,
      signature,
      traceId
    );

    // extract deposit address from link event
    const newRoomId = await this.getLinkEvent(roomId, fromChain, toChain, destinationAddress);
    const depositAddress = this.extractDepositAddress(newRoomId);

    return depositAddress;
  }

  public async getOneTimeCode(signerAddress: string, traceId: string): Promise<OTC> {
    const otc: OTC = await this.api
      .get(`${CLIENT_API_GET_OTC}?publicAddress=${signerAddress}`, traceId)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });

    return otc;
  }

  async getInitRoomId(
    fromChain: string,
    toChain: string,
    destinationAddress: string,
    asset: string,
    publicAddress: string,
    signature: string,
    traceId: string
  ): Promise<string> {
    type RoomIdResponse = Record<"data", Record<"roomId", string>>;

    const payload = {
      fromChain,
      toChain,
      destinationAddress,
      asset,
      publicAddress,
      signature,
    };

    const response: RoomIdResponse = await this.api
      .post(CLIENT_API_POST_TRANSFER_ASSET, payload, traceId)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });

    const roomId = response?.data?.roomId;
    return roomId;
  }

  async getLinkEvent(
    roomId: string,
    sourceChain: string,
    destinationChain: string,
    destinationAddress: string
  ): Promise<string> {
    const { newRoomId } = await this.getSocketService()
      .joinRoomAndWaitForEvent(roomId, sourceChain, destinationChain, destinationAddress)
      .catch((error) => {
        throw error;
      });

    return newRoomId;
  }

  private getSocketService() {
    return new SocketService(this.resourceUrl);
  }

  private extractDepositAddress(roomId: string) {
    return JSON.parse(roomId)?.depositAddress;
  }
}
