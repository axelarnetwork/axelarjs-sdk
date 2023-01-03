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
  throwIfInvalidChainIds,
  validateDestinationAddressByChainName,
} from "../utils";
import { EnvironmentConfigs, getConfigs } from "../constants";
import { AxelarAssetTransferConfig, Environment, GasToken, isNativeToken } from "./types";
import DepositReceiver from "../../artifacts/contracts/deposit-service/DepositReceiver.sol/DepositReceiver.json";
import ReceiverImplementation from "../../artifacts/contracts/deposit-service/ReceiverImplementation.sol/ReceiverImplementation.json";
import s3 from "./TransactionRecoveryApi/constants/s3";

import { constants } from "ethers";
import { ChainInfo } from "../chains/types";
import { loadChains } from "../chains";
import { AxelarQueryAPI } from "./AxelarQueryAPI";
const { HashZero } = constants;

interface GetDepositAddressParams {
  fromChain: string;
  toChain: string;
  destinationAddress: string;
  asset: string;
  options?: {
    _traceId?: string;
    shouldUnwrapIntoNative: boolean;
    refundAddress: string;
  };
}

export class AxelarAssetTransfer {
  readonly environment: Environment;
  readonly resourceUrl: string;

  readonly api: RestService;
  readonly depositServiceApi: RestService;
  readonly axelarQueryApi: AxelarQueryAPI;
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

    const links: EnvironmentConfigs = getConfigs(config.environment);
    this.axelarQueryApi = new AxelarQueryAPI({
      environment: config.environment,
      axelarRpcUrl: links.axelarRpcUrl,
      axelarLcdUrl: links.axelarLcdUrl,
    });
  }

  async getDepositAddressForNativeWrap(
    fromChain: string,
    toChain: string,
    destinationAddress: string,
    refundAddress?: string
  ): Promise<string> {
    await throwIfInvalidChainIds([fromChain, toChain], this.environment);
    await this.axelarQueryApi.throwIfInactiveChains([fromChain, toChain]);

    refundAddress =
      refundAddress ||
      (await this.axelarQueryApi.getContractAddressFromConfig(
        fromChain,
        "default_refund_collector"
      ));

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
    fromChainModule: "evm" | "axelarnet" = "evm",
    refundAddress?: string
  ): Promise<string> {
    await throwIfInvalidChainIds([fromChain, toChain], this.environment);
    await this.axelarQueryApi.throwIfInactiveChains([fromChain, toChain]);

    refundAddress =
      refundAddress ||
      (await this.axelarQueryApi.getContractAddressFromConfig(
        fromChainModule === "evm" ? fromChain : toChain,
        "default_refund_collector"
      ));

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

    if (fromChain) {
      await throwIfInvalidChainIds([fromChain], this.environment);
      await this.axelarQueryApi.throwIfInactiveChains([fromChain]);
    }

    if (toChain) {
      await throwIfInvalidChainIds([toChain], this.environment);
      await this.axelarQueryApi.throwIfInactiveChains([toChain]);
    }

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
    await throwIfInvalidChainIds([fromChain, toChain], this.environment);
    await this.axelarQueryApi.throwIfInactiveChains([fromChain, toChain]);

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
      await this.axelarQueryApi.getContractAddressFromConfig(
        wrapOrUnWrap === "wrap" ? fromChain : toChain,
        "deposit_service"
      ),
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
   * @param {Object}  requestParams
   * @param {string}  requestParams.fromChain - Source chain identifier eg: avalanche, moonbeam ethereum-2, terra-2 ...
   * @param {string}  requestParams.toChain - Destination chain identifier eg: avalanche, moonbeam ethereum-2, terra-2 ...
   * @param {string}  requestParams.destinationAddress - Address where the asset should be transferred to on the destination chain
   * @param {string}  requestParams.asset - Asset denomination eg: uausdc, uaxl ... If the asset specific is native cxy (e.g. ETH, AVAX, etc), the ERC20 version of the asset will appear on the dest chain
   * @param {Object}  requestParams.options
   * @param {string}  requestParams.options._traceId
   * @param {boolean} requestParams.options.shouldUnwrapIntoNative - when sending wrapped native asset back to its home chain (e.g. WETH back to Ethereum), specify "true" to receive native ETH; otherwise will received ERC20 version
   * @param {string}  requestParams.options.refundAddress - recipient where funds can be refunded if wrong ERC20 asset is deposited; ONLY AVAILABLE FOR WRAP/UNWRAP SERVICE
   */
  public async getDepositAddress(
    requestParamsOrFromChain: GetDepositAddressParams | string,
    _toChain?: string,
    _destinationAddress?: string,
    _asset?: string,
    _options?: any
  ): Promise<string> {
    let fromChain: string, toChain: string, destinationAddress: string, asset: string, options: any;

    if (typeof requestParamsOrFromChain === "string") {
      fromChain = requestParamsOrFromChain;
      toChain = _toChain as string;
      destinationAddress = _destinationAddress as string;
      asset = _asset as string;
      options = _options;
    } else {
      ({ fromChain, toChain, destinationAddress, asset, options } =
        requestParamsOrFromChain as GetDepositAddressParams);
    }

    // use trace ID sent in by invoking user, or otherwise generate a new one
    const traceId = options?._traceId || uuidv4();

    // validate chain identifiers
    await throwIfInvalidChainIds([fromChain, toChain], this.environment);

    // verify destination address format
    const isDestinationAddressValid = await validateDestinationAddressByChainName(
      toChain,
      destinationAddress,
      this.environment
    );
    if (!isDestinationAddressValid)
      throw new Error(`Invalid destination address for chain ${toChain}`);

    const chainList: ChainInfo[] = await loadChains({ environment: this.environment });

    const srcChainInfo = chainList.find(
      (chainInfo) => chainInfo.id === fromChain.toLowerCase()
    ) as ChainInfo;
    if (!srcChainInfo) throw new Error("cannot find chain" + fromChain);
    const destChainInfo = chainList.find(
      (chainInfo) => chainInfo.id === toChain.toLowerCase()
    ) as ChainInfo;
    if (!destChainInfo) throw new Error("cannot find chain" + toChain);

    /**if user has selected native cxy, e.g. ETH, AVAX, etc, assume it is to be wrapped into ERC20 on dest chain */
    if (isNativeToken(srcChainInfo.chainName.toLowerCase(), asset as GasToken)) {
      return this.getDepositAddressForNativeWrap(
        fromChain,
        toChain,
        destinationAddress,
        options?.refundAddress
      );
    }
    /**if user has selected native cxy wrapped asset, e.g. WETH, WAVAX, and selected to unwrap it */
    if (destChainInfo.nativeAsset.includes(asset as string) && options?.shouldUnwrapIntoNative) {
      return this.getDepositAddressForNativeUnwrap(
        fromChain,
        toChain,
        destinationAddress,
        srcChainInfo.module,
        options.refundAddress
      );
    }

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

    await throwIfInvalidChainIds([fromChain, toChain], this.environment);
    await this.axelarQueryApi.throwIfInactiveChains([fromChain, toChain]);

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
    await throwIfInvalidChainIds([sourceChain, destinationChain], this.environment);
    await this.axelarQueryApi.throwIfInactiveChains([sourceChain, destinationChain]);
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

  async getERC20Denom(chainId: string): Promise<string> {
    const chainList: ChainInfo[] = await loadChains({ environment: this.environment });
    const chainName = chainList.find(
      (chainInfo) => chainInfo.id === chainId?.toLowerCase()
    )?.chainName;
    if (!chainName) throw new Error(`Chain id ${chainId} does not fit any supported chain`);

    if (!this.evmDenomMap[chainName.toLowerCase()]) {
      const staticInfo = await this.getStaticInfo();
      const denom = staticInfo.chains[chainName.toLowerCase()]?.nativeAsset[0];
      if (denom) {
        this.evmDenomMap[chainName.toLowerCase()] = denom;
      } else {
        throw new Error(`Asset denom for ${chainId} not found`);
      }
      return denom;
    }
    return this.evmDenomMap[chainName.toLowerCase()];
  }

  async getStaticInfo(): Promise<Record<string, any>> {
    if (!this.staticInfo) {
      this.staticInfo = await fetch(s3[this.environment])
        .then((res) => res.json())
        .catch(() => undefined);
    }
    return this.staticInfo;
  }
}
