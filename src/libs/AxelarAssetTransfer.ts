import { v4 as uuidv4 } from "uuid";
import fetch from "cross-fetch";
import {
  defaultAbiCoder,
  getCreate2Address,
  Interface,
  keccak256,
  solidityPack,
} from "ethers/lib/utils";

import { CLIENT_API_GET_OTC, CLIENT_API_POST_TRANSFER_ASSET, OTC } from "../services/types";
import { RestService, SocketService } from "../services";
import {
  createWallet,
  validateAndReturn,
  validateChainIdentifier,
  validateDestinationAddressByChainName,
} from "../utils";
import { getConfigs } from "../constants";
import { AxelarAssetTransferConfig, Environment } from "./types";
import DepositReceiver from "../../artifacts/contracts/deposit-service/DepositReceiver.sol/DepositReceiver.json";
import ReceiverImplementation from "../../artifacts/contracts/deposit-service/ReceiverImplementation.sol/ReceiverImplementation.json";
import s3 from "./TransactionRecoveryApi/constants/s3";

import { constants } from "ethers";
const { HashZero } = constants;

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
    fromChain: string,
    toChain: string,
    destinationAddress: string,
    refundAddress?: string
  ): Promise<string> {

    await validateAndReturn(fromChain, this.environment);
    await validateAndReturn(toChain, this.environment);
    
    refundAddress = refundAddress || (await this.getGasReceiverContractAddress(fromChain));
    const { address } = await this.getDepositAddressFromRemote(
      "wrap",
      fromChain,
      toChain,
      destinationAddress,
      refundAddress,
      HashZero
    );

    const expectedAddress = await this.validateOfflineDepositAddress(
      "wrap",
      fromChain,
      toChain,
      destinationAddress,
      refundAddress,
      HashZero
    );

    if (address !== expectedAddress) throw new Error("Deposit address mismatch");

    return address;
  }

  async getDepositAddressForNativeUnwrap(
    fromChain: string,
    toChain: string,
    destinationAddress: string,
    refundAddress?: string
  ): Promise<string> {

    await validateAndReturn(fromChain, this.environment);
    await validateAndReturn(toChain, this.environment);

    refundAddress = refundAddress || (await this.getGasReceiverContractAddress(fromChain));

    const { address: unwrapAddress } = await this.getDepositAddressFromRemote(
      "unwrap",
      undefined,
      toChain,
      destinationAddress,
      refundAddress,
      HashZero
    );

    const expectedAddress = await this.validateOfflineDepositAddress(
      "unwrap",
      fromChain,
      toChain,
      destinationAddress,
      refundAddress,
      HashZero
    );

    if (unwrapAddress !== expectedAddress) throw new Error("Deposit address mismatch");

    const denom = await this.getERC20Denom(toChain);
    const finalDepositAddress = await this.getDepositAddress(
      fromChain,
      toChain,
      unwrapAddress,
      denom
    );

    return finalDepositAddress;
  }

  async getDepositAddressFromRemote(
    wrapOrUnWrap: "wrap" | "unwrap",
    fromChain: string | undefined,
    toChain: string | undefined,
    destinationAddress: string,
    refundAddress: string,
    hexSalt: string
  ): Promise<{ address: string }> {

    const endpoint = wrapOrUnWrap === "wrap" ? "/deposit/wrap" : "/deposit/unwrap";

    if (fromChain) await validateAndReturn(fromChain, this.environment);
    if (toChain) await validateAndReturn(toChain, this.environment);

    return this.depositServiceApi
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
    fromChain: string,
    toChain: string,
    destinationAddress: string,
    refundAddress: string,
    hexSalt: string
  ) {
    await validateAndReturn(fromChain, this.environment);
    await validateAndReturn(toChain, this.environment);
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

  /**
   *
   * @param fromChain Source chain identifier eg: avalanche, moonbeam ethereum-2, terra-2 ...
   * @param toChain Destination chain identifier eg: avalanche, moonbeam ethereum-2, terra-2 ...
   * @param destinationAddress Address where the asset should be transferred to on the destination chain
   * @param asset Asset denomination eg: uausdc, uaxl ...
   * @param options
   * @returns
   */
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

    // validate chain identifiers
    await this.validateChainIdentifiers(fromChain, toChain);

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

  async getOneTimeCode(signerAddress: string, traceId: string): Promise<OTC> {
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

    await validateAndReturn(fromChain, this.environment);
    await validateAndReturn(toChain, this.environment);

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
    await validateAndReturn(sourceChain, this.environment);
    await validateAndReturn(destinationChain, this.environment);
    const { newRoomId } = await this.getSocketService()
      .joinRoomAndWaitForEvent(roomId, sourceChain, destinationChain, destinationAddress)
      .catch((error) => {
        throw error;
      });

    return newRoomId;
  }

  getSocketService() {
    return new SocketService(this.resourceUrl, this.environment);
  }

  extractDepositAddress(roomId: string) {
    return JSON.parse(roomId)?.depositAddress;
  }

  async getGasReceiverContractAddress(chainName: string): Promise<string> {
    if (!this.gasReceiverContract[chainName]) {
      this.gasReceiverContract[chainName] = await this.getStaticInfo()
        .then((body) => {
          return body.assets.network[chainName.toLowerCase()]?.gas_service;
        })
        .catch(() => undefined);
    }
    return this.gasReceiverContract[chainName];
  }

  async getERC20Denom(chainName: string): Promise<string> {
    if (!this.evmDenomMap[chainName.toLowerCase()]) {
      const staticInfo = await this.getStaticInfo();
      const denom = staticInfo.chains[chainName.toLowerCase()]?.nativeAsset[0];
      if (denom) {
        this.evmDenomMap[chainName.toLowerCase()] = denom;
      }
      return denom;
    }
    return this.evmDenomMap[chainName.toLowerCase()];
  }

  async getDepositServiceContractAddress(chainName: string): Promise<string> {
    if (!this.depositServiceContract[chainName]) {
      this.depositServiceContract[chainName] = await this.getStaticInfo()
        .then((body) => {
          return body.assets.network[chainName.toLowerCase()]?.deposit_service;
        })
        .catch(() => undefined);
    }
    return this.depositServiceContract[chainName];
  }

  async getStaticInfo(): Promise<Record<string, any>> {
    if (!this.staticInfo) {
      this.staticInfo = await fetch(s3[this.environment])
        .then((res) => res.json())
        .catch(() => undefined);
    }
    return this.staticInfo;
  }

  async validateChainIdentifiers(fromChain: string, toChain: string) {
    const [fromChainValid, toChainValid] = await Promise.all([
      validateChainIdentifier(fromChain, this.environment),
      validateChainIdentifier(toChain, this.environment),
    ]);
    if (!fromChainValid.foundChain)
      throw new Error(
        `Invalid chain identifier for ${fromChain}. Did you mean ${fromChainValid.bestMatch}?`
      );
    if (!toChainValid.foundChain)
      throw new Error(
        `Invalid chain identifier for ${toChain}. Did you mean ${toChainValid.bestMatch}?`
      );

    return true;
  }
}
