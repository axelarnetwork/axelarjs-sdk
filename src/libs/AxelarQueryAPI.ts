import { RestService } from "src/services";
import { CLIENT_API_GET_FEE } from "src/services/types";
import { AxelarQueryAPIConfig } from "./types";

export class AxelarQueryAPI {
  readonly api: RestService;
  readonly axelarRpcUrl: string;
  readonly axelarLcdUrl: string;

  public constructor(config: AxelarQueryAPIConfig) {
    const { axelarLcdUrl, axelarRpcUrl, environment } = config;

    if (environment) {
    }
  }

  public async getFeeForChainAndAsset(
    chain: string,
    asset: string
  ): Promise<any> {
    return this.api
      .get(`${CLIENT_API_GET_FEE}?chainName=${chain}&assetCommonKey=${asset}`)
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
        Number(sourceChainFeeInfo?.fee_info?.min_fee) +
        Number(destinationChainFeeInfo?.fee_info?.min_fee)
      );
    } catch (e: any) {
      throw e;
    }
  }

  public async getGasPrice(
    source: any,
    destination: any,
    tokenAddress: string,
    tokenSymbol: string
  ) {
    const api_url = "https://devnet.api.gmp.axelarscan.io";

    const requester = axios.create({ baseURL: api_url });
    const params = {
      method: "getGasPrice",
      destinationChain: destination.name,
      sourceChain: source.name,
      sourceTokenAddress: tokenAddress,
      sourceTokenSymbol: tokenSymbol,
    };

    // send request
    const response = await requester.get("/", { params }).catch((error) => {
      return { data: { error } };
    });
    const result = response.data.result;
    const dest = result.destination_native_token;
    const destPrice = 1e18 * dest.gas_price * dest.token_price.usd;
    return destPrice / result.source_token.token_price.usd;
  }

  public getDenomFromSymbol(symbol: string) {}

  public getSymbolFromDenom(denom: string) {}
}
