import { AssetConfig } from "../assets/types";
import { loadAssets } from "../assets";
import { EnvironmentConfigs, getConfigs } from "../constants";
import { RestService } from "../services";
import {
  AxelarQueryAPIConfig,
  Environment,
  FeeInfoResponse,
  TransferFeeResponse,
} from "./types";

export class AxelarQueryAPI {
  readonly environment: Environment;
  readonly lcdApi: RestService;
  readonly rpcApi: RestService;
  readonly axelarCachingServiceApi: RestService;
  readonly axelarRpcUrl: string;
  readonly axelarLcdUrl: string;
  readonly axelarCachingServiceUrl: string;

  public constructor(config: AxelarQueryAPIConfig) {
    const { axelarLcdUrl, axelarRpcUrl, environment } = config;
    const links: EnvironmentConfigs = getConfigs(environment);

    this.axelarRpcUrl = axelarRpcUrl || links.axelarRpcUrl;
    this.axelarLcdUrl = axelarLcdUrl || links.axelarLcdUrl;
    this.axelarCachingServiceUrl = links.axelarCachingServiceUrl;
    this.environment = environment;

    this.lcdApi = new RestService(this.axelarLcdUrl);
    this.rpcApi = new RestService(this.axelarRpcUrl);
    this.axelarCachingServiceApi = new RestService(
      this.axelarCachingServiceUrl
    );
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
      let queryEndpoint = `/axelar/nexus/v1beta1/fee`;
      queryEndpoint += `?chain=${chainName?.toLowerCase()}`;
      queryEndpoint += `&asset=${assetDenom}`;
      return (await this.lcdApi.get(queryEndpoint)) as FeeInfoResponse;
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
      let queryEndpoint = `/axelar/nexus/v1beta1/transfer_fee`;
      queryEndpoint += `?source_chain=${sourceChainName?.toLowerCase()}`;
      queryEndpoint += `&destination_chain=${destinationChainName?.toLowerCase()}`;
      queryEndpoint += `&amount=${amountInDenom?.toString()}${assetDenom}`;
      return (await this.lcdApi.get(queryEndpoint)) as TransferFeeResponse;
    } catch (e: any) {
      throw e;
    }
  }

  /** 
   * Gets the gas price for a destination chain to be paid to the gas receiver on a source chain
   * example testnet query: https://testnet.api.gmp.axelarscan.io/?method=getGasPrice&destinationChain=ethereum&sourceChain=avalanche&sourceTokenAddress=0x43F4600b552089655645f8c16D86A5a9Fa296bc3&sourceTokenSymbol=UST
   * @param sourceChainName
   * @param destinationChainName
   * @param sourceChainTokenAddress
   * @param sourceChainTokenSymbol
   * @returns
   */
  public async getGasPrice(
    sourceChainName: string,
    destinationChainName: string,
    sourceChainTokenAddress: string,
    sourceChainTokenSymbol: string
  ): Promise<number> {
    try {
      let queryEndpoint = "";
      queryEndpoint += "?method=getGasPrice";
      queryEndpoint += `&destinationChain=${destinationChainName}`;
      queryEndpoint += `&sourceChain=${sourceChainName}`;
      queryEndpoint += `&sourceTokenAddress=${sourceChainTokenAddress}`;
      queryEndpoint += `&sourceTokenSymbol=${sourceChainTokenSymbol}`;

      const response = await this.axelarCachingServiceApi.get(queryEndpoint);

      const result = response.result;
      const dest = result.destination_native_token;
      const exponent = 1e18;
      const destPrice = exponent * dest.gas_price * dest.token_price.usd;
      return destPrice / result.source_token.token_price.usd;
    } catch (e: any) {
      throw e;
    }
  }

  /**
   * Get the denom for an asset given its symbol on a chain
   * @param symbol 
   * @param chainName 
   * @returns 
   */
  public getDenomFromSymbol(symbol: string, chainName: string) {
    const allAssets = loadAssets({ environment: this.environment });
    const assetConfig: AssetConfig | undefined = allAssets.find(assetConfig => assetConfig.chain_aliases[chainName]?.assetSymbol === symbol);
    if (!assetConfig) return null;
    return assetConfig?.common_key[this.environment];
  }

  /**
   * Get the symbol for an asset on a given chain given its denom
   * @param denom 
   * @param chainName 
   * @returns 
   */
  public getSymbolFromDenom(denom: string, chainName: string) {
    const allAssets = loadAssets({ environment: this.environment });
    const assetConfig: AssetConfig | undefined = allAssets.find(
      (assetConfig) => assetConfig.common_key[this.environment] === denom
    );
    if (!assetConfig) return null;
    return assetConfig.chain_aliases[chainName].assetSymbol;
  }
}
