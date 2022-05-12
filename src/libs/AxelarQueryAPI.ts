import { EnvironmentConfigs, getConfigs } from "../constants";
import { RestService } from "../services";
import { CLIENT_API_GET_FEE } from "../services/types";
import { AxelarQueryAPIConfig, FeeInfoResponse, TransferFeeResponse } from "./types";

export class AxelarQueryAPI {
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

    this.lcdApi = new RestService(this.axelarLcdUrl);
    this.rpcApi = new RestService(this.axelarRpcUrl);
    this.axelarCachingServiceApi = new RestService(
      this.axelarCachingServiceUrl
    );
  }

  /**
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
      return await this.lcdApi.get(queryEndpoint) as FeeInfoResponse;
    } catch (e: any) {
      throw e;
    }
  }

  /**
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
      return await this.lcdApi.get(queryEndpoint) as TransferFeeResponse;
    } catch (e: any) {
      throw e;
    }
  }

  // https://testnet.api.gmp.axelarscan.io/?method=getGasPrice&destinationChain=ethereum&sourceChain=avalanche&sourceTokenAddress=0x43F4600b552089655645f8c16D86A5a9Fa296bc3&sourceTokenSymbol=UST
  public async getGasPrice(
    sourceChainName: any,
    destinationChainName: any,
    sourceChainTokenAddress: string,
    sourceChainTokenSymbol: string
  ) {

    let queryEndpoint = "?";
    queryEndpoint += "method=getGasPrice";
    queryEndpoint += `&destinationChain=${destinationChainName}`;
    queryEndpoint += `&sourceChain=${sourceChainName}`;
    queryEndpoint += `&sourceTokenAddress=${sourceChainTokenAddress}`;
    queryEndpoint += `&sourceTokenSymbol=${sourceChainTokenSymbol}`;

    const response = await this.axelarCachingServiceApi.get(queryEndpoint);

    const result = response.result;
    const dest = result.destination_native_token;
    const exponent = 1e18;
    const destPrice = exponent * dest.gas_price * dest.token_price.usd;
    console.log("result",result);
    console.log("dest",dest);
    console.log("destPrice",destPrice);
    return destPrice / result.source_token.token_price.usd;
  }

  public getDenomFromSymbol(symbol: string) {}

  public getSymbolFromDenom(denom: string) {}
}
