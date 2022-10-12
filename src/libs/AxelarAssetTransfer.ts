import { v4 as uuidv4 } from "uuid";
import fetch from "cross-fetch";
import { CLIENT_API_GET_OTC, CLIENT_API_POST_TRANSFER_ASSET, OTC } from "../services/types";

import { RestService, SocketService } from "../services";
import { createWallet, validateDestinationAddressByChainName } from "../utils";

import { getConfigs } from "../constants";
import { AxelarAssetTransferConfig, Environment, EvmChain } from "./types";
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
import DepositReceiver from "../artifacts/contracts/deposit-service/DepositReceiver.sol/DepositReceiver.json";
import ReceiverImplementation from "../artifacts/contracts/deposit-service/ReceiverImplementation.sol/ReceiverImplementation.json";
import s3 from "./TransactionRecoveryApi/constants/s3";

export class AxelarAssetTransfer {
  readonly environment: Environment;
  readonly resourceUrl: string;

  readonly api: RestService;
  readonly depositServiceApi: RestService;
  private gasReceiverContract: Record<string, string> = {};
  private depositServiceContract: Record<string, string> = {};
  private evmDenomMap: Record<string, string> = {};
  private staticInfo: Record<string, any>;

  constructor(config: AxelarAssetTransferConfig) {
    const configs = getConfigs(config.environment);

    this.environment = config.environment as Environment;
    this.resourceUrl = configs.resourceUrl;

    // handle resource url overwrite (for tests)
    if (config.overwriteResourceUrl) this.resourceUrl = config.overwriteResourceUrl;

    this.api = new RestService(this.resourceUrl);
    this.depositServiceApi = new RestService(configs.depositServiceUrl);
  }

  async getDepositAddressForNativeWrap(
    fromChain: EvmChain,
    toChain: EvmChain,
    destinationAddress: string,
    refundAddress: string,
    salt?: number
  ): Promise<string> {
    const hexSalt = hexZeroPad(hexlify(salt || 0), 32);
    console.log({
      refundAddress,
    });
    refundAddress = refundAddress || (await this.getGasReceiverContractAddress(fromChain));
    console.log({
      refundAddress,
    });
    const { address } = await this.getDepositAddressFromRemote(
      "wrap",
      fromChain,
      toChain,
      destinationAddress,
      refundAddress,
      hexSalt
    );

    const expectedAddress = await this.validateOfflineDepositAddress(
      "wrap",
      fromChain,
      toChain,
      destinationAddress,
      refundAddress,
      hexSalt
    );

    if (address !== expectedAddress) return "";

    return address;
  }

  async getDepositAddressForNativeUnwrap(
    fromChain: EvmChain,
    toChain: EvmChain,
    destinationAddress: string,
    refundAddress: string,
    salt?: number
  ): Promise<string> {
    const hexSalt = hexZeroPad(hexlify(salt || 0), 32);
    refundAddress = refundAddress || (await this.getGasReceiverContractAddress(fromChain));
    const { address: unwrapAddress } = await this.getDepositAddressFromRemote(
      "unwrap",
      undefined,
      toChain,
      destinationAddress,
      refundAddress,
      hexSalt
    );

    const expectedAddress = await this.validateOfflineDepositAddress(
      "unwrap",
      fromChain,
      toChain,
      destinationAddress,
      refundAddress,
      hexSalt
    );

    if (unwrapAddress !== expectedAddress) return "";

    const realDepositAddress = await this.getDepositAddress(
      fromChain,
      toChain,
      unwrapAddress,
      await this.getERC20Denom(toChain)
    );

    return realDepositAddress;
  }

  async getDepositAddressFromRemote(
    wrapOrUnWrap: "wrap" | "unwrap",
    fromChain: EvmChain | undefined,
    toChain: EvmChain,
    destinationAddress: string,
    refundAddress: string,
    hexSalt: string
  ): Promise<{ address: string }> {
    const endpoint = wrapOrUnWrap === "wrap" ? "/deposit/wrap" : "/deposit/unwrap";
    return await this.depositServiceApi
      .post(endpoint, {
        salt: hexSalt,
        source_chain: fromChain,
        destination_chain: toChain,
        destination_address: destinationAddress,
        refund_address: refundAddress,
      })
      .then((res) => ({ address: res.address.toLowerCase() }))
      .catch(() => ({ address: "" }));
  }

  async validateOfflineDepositAddress(
    wrapOrUnWrap: "wrap" | "unwrap",
    fromChain: EvmChain,
    toChain: EvmChain,
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
      await this.getDepositServiceContractAddress(fromChain),
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
    return address.toLowerCase();
  }

  public async getDepositAddress(
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
    const isDestinationAddressValid = await validateDestinationAddressByChainName(
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

  private async getOneTimeCode(signerAddress: string, traceId: string): Promise<OTC> {
    const otc: OTC = await this.api
      .get(`${CLIENT_API_GET_OTC}?publicAddress=${signerAddress}`, traceId)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });

    return otc;
  }

  private async getInitRoomId(
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

  private async getLinkEvent(
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
    return new SocketService(this.resourceUrl, this.environment);
  }

  private extractDepositAddress(roomId: string) {
    return JSON.parse(roomId)?.depositAddress;
  }

  public async getGasReceiverContractAddress(chainName: EvmChain): Promise<string> {
    if (!this.gasReceiverContract[chainName]) {
      this.gasReceiverContract[chainName] = await this.getStaticInfo()
        .then((body) => {
          console.log({
            network: body.assets.network,
          });
          return body.assets.network[chainName.toLowerCase()]?.gas_service;
        })
        .catch((e) => undefined);
    }
    return this.gasReceiverContract[chainName];
  }

  public async getERC20Denom(chainName: EvmChain): Promise<string> {
    if (!this.evmDenomMap[chainName.toLowerCase()]) {
      const staticInfo = await this.getStaticInfo();
      console.log("staticInfo", staticInfo);
      const denom = staticInfo.chains[chainName.toLowerCase()]?.nativeAsset[0];
      console.log("denom", denom);
      if (denom) {
        this.evmDenomMap[chainName.toLowerCase()] = denom;
      }
      return denom;
    }
    return this.evmDenomMap[chainName.toLowerCase()];
  }

  public async getDepositServiceContractAddress(chainName: EvmChain): Promise<string> {
    if (!this.depositServiceContract[chainName]) {
      this.depositServiceContract[chainName] = await this.getStaticInfo()
        .then((body) => {
          return body.assets.network[chainName.toLowerCase()]?.deposit_service;
        })
        .catch((e) => undefined);
    }
    return this.depositServiceContract[chainName];
  }

  public async getStaticInfo(): Promise<Record<string, any>> {
    if (!this.staticInfo) {
      this.staticInfo = await fetch(s3[this.environment])
        .then((res) => res.json())
        .catch((e) => undefined);
    }
    return this.staticInfo;
  }
}
