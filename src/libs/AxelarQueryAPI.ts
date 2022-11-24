import { AssetConfig } from "../assets/types";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { loadAssets } from "../assets";
import { EnvironmentConfigs, getConfigs } from "../constants";
import { RestService } from "../services";
import { AxelarQueryAPIConfig, BaseFeeResponse, Environment, EvmChain, GasToken } from "./types";
import { DEFAULT_ESTIMATED_GAS } from "./TransactionRecoveryApi/constants/contract";
import { AxelarQueryClient, AxelarQueryClientType } from "./AxelarQueryClient";
import {
  ChainStatus,
  FeeInfoResponse,
  TransferFeeResponse,
} from "@axelar-network/axelarjs-types/axelar/nexus/v1beta1/query";
import { throwIfInvalidChainIds } from "../utils";

export class AxelarQueryAPI {
  readonly environment: Environment;
  readonly lcdApi: RestService;
  readonly rpcApi: RestService;
  readonly axelarGMPServiceApi: RestService;
  readonly axelarRpcUrl: string;
  readonly axelarLcdUrl: string;
  readonly axelarGMPServiceUrl: string;
  private allAssets: AssetConfig[];
  private axelarQueryClient: AxelarQueryClientType;

  public constructor(config: AxelarQueryAPIConfig) {
    const { axelarLcdUrl, axelarRpcUrl, environment } = config;
    const links: EnvironmentConfigs = getConfigs(environment);

    this.axelarRpcUrl = axelarRpcUrl || links.axelarRpcUrl;
    this.axelarLcdUrl = axelarLcdUrl || links.axelarLcdUrl;
    this.axelarGMPServiceUrl = links.axelarGMPApiUrl;
    this.environment = environment;

    this.lcdApi = new RestService(this.axelarLcdUrl);
    this.rpcApi = new RestService(this.axelarRpcUrl);
    this.axelarGMPServiceApi = new RestService(this.axelarGMPServiceUrl);

    this._initializeAssets();
  }

  private async _initializeAssets() {
    this.allAssets = await loadAssets({ environment: this.environment });
  }

  /**
   * Gets the fee for a chain and asset
   * example testnet query: https://axelartest-lcd.quickapi.com/axelar/nexus/v1beta1/fee?chain=ethereum&asset=uusd
   * @param chainId
   * @param assetDenom
   * @returns
   */
  public async getFeeForChainAndAsset(
    chainId: string,
    assetDenom: string
  ): Promise<FeeInfoResponse> {
    await throwIfInvalidChainIds([chainId], this.environment);

    await this.initQueryClientIfNeeded();

    return this.axelarQueryClient.nexus.FeeInfo({ chain: chainId, asset: assetDenom });
  }

  /**
   * Gest the transfer fee for a given transaction
   * example testnet query: "https://axelartest-lcd.quickapi.com/axelar/nexus/v1beta1/transfer_fee?source_chain=ethereum&destination_chain=terra&amount=100000000uusd"
   * @param sourceChainId
   * @param destinationChainId
   * @param assetDenom
   * @param amountInDenom
   * @returns
   */
  public async getTransferFee(
    sourceChainId: string,
    destinationChainId: string,
    assetDenom: string,
    amountInDenom: number
  ): Promise<TransferFeeResponse> {
    await throwIfInvalidChainIds([sourceChainId, destinationChainId], this.environment);

    await this.initQueryClientIfNeeded();

    return this.axelarQueryClient.nexus.TransferFee({
      sourceChain: sourceChainId,
      destinationChain: destinationChainId,
      amount: `${amountInDenom.toString()}${assetDenom}`,
    });
  }

  /**
   * Gets the gas price for a destination chain to be paid to the gas receiver on a source chain
   * example testnet query: https://testnet.api.gmp.axelarscan.io/?method=getGasPrice&destinationChain=ethereum&sourceChain=avalanche&sourceTokenAddress=0x43F4600b552089655645f8c16D86A5a9Fa296bc3&sourceTokenSymbol=UST
   * @param sourceChainId
   * @param destinationChainId
   * @param sourceChainTokenSymbol
   * @returns
   */
  public async getGasInfo(
    sourceChainId: EvmChain | string,
    destinationChainId: EvmChain | string,
    sourceChainTokenSymbol: GasToken | string
  ): Promise<any> {
    await throwIfInvalidChainIds([sourceChainId, destinationChainId], this.environment);

    const params = new URLSearchParams({
      method: "getGasPrice",
      destinationChain: destinationChainId,
      sourceChain: sourceChainId,
      sourceTokenSymbol: sourceChainTokenSymbol,
    });

    return this.axelarGMPServiceApi.get(`?${params}`).then((resp) => resp.result);
  }

  /**
   * Gets the base fee in native token wei for a given source and destination chain combination
   * @param sourceChainName
   * @param destinationChainName
   * @param sourceTokenSymbol (optional)
   * @returns base fee in native token in wei, translated into the native gas token of choice
   */
  public async getNativeGasBaseFee(
    sourceChainId: EvmChain | string,
    destinationChainId: EvmChain | string,
    sourceTokenSymbol?: GasToken
  ): Promise<BaseFeeResponse> {
    await throwIfInvalidChainIds([sourceChainId, destinationChainId], this.environment);
    await this.throwIfInactiveChains([sourceChainId, destinationChainId]);
    return this.axelarGMPServiceApi
      .post("", {
        method: "getFees",
        destinationChain: destinationChainId,
        sourceChain: sourceChainId,
        sourceTokenSymbol,
      })
      .then((response) => {
        const { base_fee, source_token } = response.result;
        const { decimals } = source_token;
        const baseFee = parseUnits(base_fee.toString(), decimals).toString();
        return { baseFee, sourceToken: source_token, success: true };
      })
      .catch((error) => ({ success: false, error: error.message }));
  }

  /**
   * Calculate estimated gas amount to pay for the gas receiver contract.
   * @param sourceChainId
   * @param destinationChainId
   * @param sourceChainTokenSymbol
   * @param gasLimit (Optional) An estimated gas amount required to execute `executeWithToken` function. The default value is 700000 which should be sufficient for most transactions.
   * @param gasMultiplier (Optional) A multiplier used to create a buffer above the calculated gas fee, to account for potential slippage throughout tx execution, e.g. 1.1 = 10% buffer. supports up to 3 decimal places
   * @returns
   */
  public async estimateGasFee(
    sourceChainId: EvmChain | string,
    destinationChainId: EvmChain | string,
    sourceChainTokenSymbol: GasToken | string,
    gasLimit: number = DEFAULT_ESTIMATED_GAS,
    gasMultiplier = 1.1
  ): Promise<string> {
    await throwIfInvalidChainIds([sourceChainId, destinationChainId], this.environment);

    const response = await this.getNativeGasBaseFee(
      sourceChainId,
      destinationChainId,
      sourceChainTokenSymbol as GasToken
    ).catch(() => undefined);

    if (!response) return "0";

    const { baseFee, sourceToken, success } = response;

    if (!success || !baseFee || !sourceToken) return "0";

    const { gas_price } = sourceToken;

    const destTxFee = parseEther(gas_price).mul(gasLimit);

    if (gasMultiplier > 1) {
      return destTxFee
        .add(baseFee)
        .mul(gasMultiplier * 10000)
        .div(10000)
        .toString();
    }

    return destTxFee.add(baseFee).toString();
  }

  /**
   * Get the denom for an asset given its symbol on a chain
   * @param symbol
   * @param chainName
   * @returns
   */
  public async getDenomFromSymbol(symbol: string, chainName: string) {
    if (!this.allAssets) await this._initializeAssets();
    const assetConfig: AssetConfig | undefined = this.allAssets.find(
      (assetConfig) => assetConfig.chain_aliases[chainName]?.assetSymbol === symbol
    );
    if (!assetConfig) return null;
    return assetConfig?.common_key[this.environment];
  }

  /**
   * Get the symbol for an asset on a given chain given its denom
   * @param denom
   * @param chainName
   * @returns
   */
  public async getSymbolFromDenom(denom: string, chainName: string) {
    if (!this.allAssets) await this._initializeAssets();
    const assetConfig: AssetConfig | undefined = this.allAssets.find(
      (assetConfig) => assetConfig.common_key[this.environment] === denom
    );
    if (!assetConfig) return null;
    return assetConfig.chain_aliases[chainName].assetSymbol;
  }

  /**
   * Get the asset config for an asset on a given chain given its denom
   * @param denom
   * @param chainName
   * @returns
   */
  public async getAssetConfigFromDenom(denom: string, chainName: string) {
    if (!this.allAssets) await this._initializeAssets();
    const assetConfig: AssetConfig | undefined = this.allAssets.find(
      (assetConfig) => assetConfig.common_key[this.environment] === denom
    );
    if (!assetConfig) return null;
    const result = assetConfig.chain_aliases[chainName];
    if (!result) return null;
    result.decimals = assetConfig.decimals;
    result.common_key = assetConfig.common_key[this.environment];
    return result;
  }

  /**
   * Get a list of active chains.
   * @returns an array of active chains
   */
  public async getActiveChains(): Promise<string[]> {
    await this.initQueryClientIfNeeded();

    return this.axelarQueryClient.nexus
      .Chains({ status: ChainStatus.CHAIN_STATUS_ACTIVATED })
      .then((resp) => resp.chains);
  }

  /**
   * Check if a chain is active.
   * @param chainId the chain id to check
   * @returns true if the chain is active, false otherwise
   */
  public async isChainActive(chainId: EvmChain | string): Promise<boolean> {
    return this.getActiveChains()
      .then((chains) => chains.map((chain) => chain.toLowerCase()))
      .then((chains) => chains.includes(chainId.toLowerCase()));
  }

  /**
   * Throw an error if any chain in the list is inactive.
   * @param chainIds A list of chainIds to check
   */
  public async throwIfInactiveChains(chainIds: EvmChain[] | string[]) {
    const results = await Promise.all(chainIds.map((chainId) => this.isChainActive(chainId)));

    for (let i = 0; i < chainIds.length; i++) {
      if (!results[i]) {
        throw new Error(
          `Chain ${chainIds[i]} is not active. Please check the list of active chains using the getActiveChains() method.`
        );
      }
    }
  }

  /**
   * Initialize the query client if it hasn't been initialized yet
   */
  private initQueryClientIfNeeded = async () => {
    if (!this.axelarQueryClient) {
      this.axelarQueryClient = await AxelarQueryClient.initOrGetAxelarQueryClient({
        environment: this.environment,
        axelarRpcUrl: this.axelarRpcUrl,
      });
    }
  };
}
