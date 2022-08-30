import { AssetConfig } from "../assets/types";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { loadAssets } from "../assets";
import { EnvironmentConfigs, getConfigs } from "../constants";
import { RestService } from "../services";
import {
  AxelarQueryAPIConfig,
  BaseFeeResponse,
  Environment,
  EvmChain,
  GasToken,
  isNativeToken,
} from "./types";
import { ethers } from "ethers";
import { DEFAULT_ESTIMATED_GAS } from "./TransactionRecoveryApi/constants/contract";
import { AxelarQueryClient, AxelarQueryClientType } from "./AxelarQueryClient";
import {
  FeeInfoResponse,
  TransferFeeResponse,
} from "@axelar-network/axelarjs-types/axelar/nexus/v1beta1/query";

export class AxelarQueryAPI {
  readonly environment: Environment;
  readonly lcdApi: RestService;
  readonly rpcApi: RestService;
  readonly axelarCachingServiceApi: RestService;
  readonly axelarRpcUrl: string;
  readonly axelarLcdUrl: string;
  readonly axelarCachingServiceUrl: string;
  private allAssets: AssetConfig[];
  private axelarQueryClient: AxelarQueryClientType;

  public constructor(config: AxelarQueryAPIConfig) {
    const { axelarLcdUrl, axelarRpcUrl, environment } = config;
    const links: EnvironmentConfigs = getConfigs(environment);

    this.axelarRpcUrl = axelarRpcUrl || links.axelarRpcUrl;
    this.axelarLcdUrl = axelarLcdUrl || links.axelarLcdUrl;
    this.axelarCachingServiceUrl = links.axelarCachingServiceUrl;
    this.environment = environment;

    this.lcdApi = new RestService(this.axelarLcdUrl);
    this.rpcApi = new RestService(this.axelarRpcUrl);
    this.axelarCachingServiceApi = new RestService(this.axelarCachingServiceUrl);

    this._initializeAssets();
  }

  private async _initializeAssets() {
    this.allAssets = await loadAssets({ environment: this.environment });
  }

  /**
   * Gets the fee for a chain and asset
   * example testnet query: https://axelartest-lcd.quickapi.com/axelar/nexus/v1beta1/fee?chain=ethereum&asset=uusd
   * @param chainName
   * @param assetDenom
   * @returns
   */
  public async getFeeForChainAndAsset(
    chainName: string,
    assetDenom: string
  ): Promise<FeeInfoResponse> {
    try {
      if (!this.axelarQueryClient)
        this.axelarQueryClient = await AxelarQueryClient.initOrGetAxelarQueryClient({
          environment: this.environment,
          axelarRpcUrl: this.axelarRpcUrl,
        });
      return await this.axelarQueryClient.nexus.FeeInfo({ chain: chainName, asset: assetDenom });
    } catch (e: any) {
      throw e;
    }
  }

  /**
   * Gest the transfer fee for a given transaction
   * example testnet query: "https://axelartest-lcd.quickapi.com/axelar/nexus/v1beta1/transfer_fee?source_chain=ethereum&destination_chain=terra&amount=100000000uusd"
   * @param sourceChainName
   * @param destinationChainName
   * @param assetDenom
   * @param amountInDenom
   * @returns
   */
  public async getTransferFee(
    sourceChainName: string,
    destinationChainName: string,
    assetDenom: string,
    amountInDenom: number
  ): Promise<TransferFeeResponse> {
    try {
      if (!this.axelarQueryClient)
        this.axelarQueryClient = await AxelarQueryClient.initOrGetAxelarQueryClient({
          environment: this.environment,
          axelarRpcUrl: this.axelarRpcUrl,
        });
      return await this.axelarQueryClient.nexus.TransferFee({
        sourceChain: sourceChainName,
        destinationChain: destinationChainName,
        amount: `${amountInDenom.toString()}${assetDenom}`,
      });
    } catch (e: any) {
      throw e;
    }
  }

  /**
   * Gets the base fee in native token wei for a given source and destination chain combination
   * @param sourceChainName
   * @param destinationChainName
   * @returns base fee in native token in wei
   */
  public async getNativeGasBaseFee(
    sourceChainName: EvmChain,
    destinationChainName: EvmChain
  ): Promise<BaseFeeResponse> {
    return this.axelarCachingServiceApi
      .post("", {
        method: "getFees",
        destinationChain: destinationChainName,
        sourceChain: sourceChainName,
      })
      .then((response) => {
        const { base_fee, destination_native_token } = response.result;
        const { decimals } = destination_native_token;
        const baseFee = parseUnits(base_fee.toString(), decimals).toString();
        return { baseFee, success: true };
      })
      .catch((error) => ({ success: false, error: error.message }));
  }

  /**
   * Gets the gas price for a destination chain to be paid to the gas receiver on a source chain
   * example testnet query: https://testnet.api.gmp.axelarscan.io/?method=getGasPrice&destinationChain=ethereum&sourceChain=avalanche&sourceTokenAddress=0x43F4600b552089655645f8c16D86A5a9Fa296bc3&sourceTokenSymbol=UST
   * @param sourceChainName
   * @param destinationChainName
   * @param sourceChainTokenSymbol
   * @param estimatedGasUsed
   * @returns
   */
  public async getGasInfo(
    sourceChainName: EvmChain,
    destinationChainName: EvmChain,
    sourceChainTokenSymbol: GasToken | string
  ): Promise<any> {
    const params = new URLSearchParams({
      method: "getGasPrice",
      destinationChain: destinationChainName,
      sourceChain: sourceChainName,
      sourceTokenSymbol: sourceChainTokenSymbol,
    });

    return this.axelarCachingServiceApi.get(`?${params}`).then((resp) => resp.result);
  }

  /**
   * Calculate estimated gas amount to pay for the gas receiver contract.
   *
   * @param sourceChainName
   * @param destinationChainName
   * @param sourceChainTokenSymbol
   * @param estimatedGasUsed (Optional) An estimated gas amount required to execute `executeWithToken` function. The default value is 700000 which sufficients for most transaction.
   * @returns
   */
  public async estimateGasFee(
    sourceChainName: EvmChain,
    destinationChainName: EvmChain,
    sourceChainTokenSymbol: GasToken | string,
    estimatedGasUsed = DEFAULT_ESTIMATED_GAS
  ): Promise<string> {
    const response = await this.getGasInfo(
      sourceChainName,
      destinationChainName,
      sourceChainTokenSymbol
    ).catch(() => undefined);
    // If the gas price is not available, return 0
    if (!response) return "0";

    const { gas_price: gasPrice } = response.source_token;
    const destTxFee = parseEther(gasPrice).mul(estimatedGasUsed);
    if (isNativeToken(sourceChainName, sourceChainTokenSymbol as GasToken)) {
      const { success, baseFee } = await this.getNativeGasBaseFee(
        sourceChainName,
        destinationChainName
      );
      if (success && baseFee) {
        // If the base fee is available, add it to the destTxFee, and return the result
        return destTxFee.add(baseFee).toString();
      }
      // If the base fee is not available, return 0
      return "0";
    }
    return destTxFee.toString();
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
}
