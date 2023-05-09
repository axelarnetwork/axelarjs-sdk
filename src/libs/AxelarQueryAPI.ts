import { AssetConfig } from "../assets/types";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { loadAssets } from "../assets";
import { EnvironmentConfigs, getConfigs } from "../constants";
import { RestService } from "../services";
import { AxelarQueryAPIConfig, BaseFeeResponse, Environment, EvmChain, GasToken } from "./types";
import { DEFAULT_ESTIMATED_GAS } from "./TransactionRecoveryApi/constants/contract";
import { AxelarQueryClient, AxelarQueryClientType } from "./AxelarQueryClient";
import fetch from "cross-fetch";
import {
  ChainStatus,
  FeeInfoResponse,
  TransferFeeResponse,
} from "@axelar-network/axelarjs-types/axelar/nexus/v1beta1/query";
import { throwIfInvalidChainIds } from "../utils";
import { loadChains } from "../chains";
import s3 from "./TransactionRecoveryApi/constants/s3";
import { BigNumber } from "ethers";

interface TranslatedTransferRateLimitResponse {
  incoming: string;
  outgoing: string;
  limit: string;
}
interface GMPParams {
  showDetailedFees: boolean;
  transferAmount?: number; // In terms of symbol, not unit denom, e.g. use 1 for 1 axlUSDC, not 1000000
  transferAmountInUnits?: string; // In terms of unit denom, not symbol, e.g. use 1000000 for 1 axlUSDC, not 1
  destinationContractAddress: string;
  sourceContractAddress: string;
  tokenSymbol: string;
}
export interface AxelarQueryAPIFeeResponse {
  expressFee: string;
  baseFee: string;
  executionFee: string;
  executionFeeWithMultiplier: string;
  gasMultiplier: number;
  gasLimit: number;
  minGasPrice: string;
  apiResponse: any;
  isExpressSupported: boolean;
}
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

    return this.axelarQueryClient.nexus.FeeInfo({
      chain: chainId,
      asset: await this._convertAssetDenom(assetDenom),
    });
  }

  public async getEVMEvent(sourceChainId: string, srcTxHash: string, srcEventId: number) {
    await throwIfInvalidChainIds([sourceChainId], this.environment);
    await this.initQueryClientIfNeeded();
    return this.axelarQueryClient.evm
      .Event({
        chain: sourceChainId,
        eventId: `${srcTxHash}-${srcEventId}`,
      })
      .catch(() => undefined);
  }

  public async getConfirmationHeight(chain: string) {
    await throwIfInvalidChainIds([chain], this.environment);
    await this.initQueryClientIfNeeded();
    return this.axelarQueryClient.evm.ConfirmationHeight({ chain });
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
      amount: `${amountInDenom.toString()}${await this._convertAssetDenom(assetDenom)}`,
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
    sourceTokenSymbol?: GasToken,
    symbol?: string,
    destinationContractAddress?: string,
    sourceContractAddress?: string,
    amount?: number,
    amountInUnits?: BigNumber | string
  ): Promise<BaseFeeResponse> {
    await throwIfInvalidChainIds([sourceChainId, destinationChainId], this.environment);
    await this.throwIfInactiveChains([sourceChainId, destinationChainId]);

    const params: {
      method: string;
      destinationChain: EvmChain | string;
      sourceChain: EvmChain | string;
      sourceTokenSymbol?: string;
      symbol?: string;
      amount?: number;
      amountInUnits?: BigNumber | string;
      destinationContractAddress?: string;
      sourceContractAddress?: string;
    } = {
      method: "getFees",
      destinationChain: destinationChainId,
      sourceChain: sourceChainId,
    };
    if (sourceTokenSymbol) params.sourceTokenSymbol = sourceTokenSymbol;
    if (symbol) params.symbol = symbol;
    if (destinationContractAddress) params.destinationContractAddress = destinationContractAddress;
    if (sourceContractAddress) params.sourceContractAddress = sourceContractAddress;
    if (amount) {
      params.amount = amount;
    } else if (amountInUnits) {
      params.amountInUnits = amountInUnits;
    }

    return this.axelarGMPServiceApi.post("", params).then((response) => {
      const {
        source_base_fee_string,
        source_token,
        destination_native_token,
        express_fee_string,
        express_supported,
      } = response.result;
      const { decimals: sourceTokenDecimals } = source_token;
      const baseFee = parseUnits(source_base_fee_string, sourceTokenDecimals).toString();
      const expressFee = express_fee_string
        ? parseUnits(express_fee_string, sourceTokenDecimals).toString()
        : "0";
      return {
        baseFee,
        expressFee,
        sourceToken: source_token,
        destToken: {
          gas_price: destination_native_token.gas_price,
          gas_price_gwei: parseInt(destination_native_token.gas_price_gwei).toString(),
          decimals: destination_native_token.decimals,
        },
        apiResponse: response,
        success: true,
        expressSupported: express_supported,
      };
    });
  }

  /**
   * Calculate estimated gas amount to pay for the gas receiver contract.
   * @param sourceChainId Can be of the EvmChain enum or string. If string, should try to generalize to use the CHAINS constants (e.g. CHAINS.MAINNET.ETHEREUM)
   * @param destinationChainId Can be of the EvmChain enum or string. If string, should try to generalize to use the CHAINS constants (e.g. CHAINS.MAINNET.ETHEREUM)
   * @param sourceChainTokenSymbol
   * @param gasLimit (Optional) An estimated gas amount required to execute `executeWithToken` function. The default value is 700000 which should be sufficient for most transactions.
   * @param gasMultiplier (Optional) A multiplier used to create a buffer above the calculated gas fee, to account for potential slippage throughout tx execution, e.g. 1.1 = 10% buffer. supports up to 3 decimal places
   * @param minGasPrice (Optional) A minimum value, in wei, for the gas price on the destination chain that is used to override the estimated gas price if it falls below this specified value.
   * @param gmpParams (Optional) Additional parameters for GMP transactions, including the ability to see a detailed view of the fee response
   * @returns
   */
  public async estimateGasFee(
    sourceChainId: EvmChain | string,
    destinationChainId: EvmChain | string,
    sourceChainTokenSymbol: GasToken | string,
    gasLimit: number = DEFAULT_ESTIMATED_GAS,
    gasMultiplier = 1.1,
    minGasPrice = "0",
    gmpParams?: GMPParams
  ): Promise<string | AxelarQueryAPIFeeResponse> {
    await throwIfInvalidChainIds([sourceChainId, destinationChainId], this.environment);

    const response = await this.getNativeGasBaseFee(
      sourceChainId,
      destinationChainId,
      sourceChainTokenSymbol as GasToken,
      gmpParams?.tokenSymbol,
      gmpParams?.destinationContractAddress,
      gmpParams?.sourceContractAddress,
      gmpParams?.transferAmount,
      gmpParams?.transferAmountInUnits
    );

    const { baseFee, expressFee, sourceToken, destToken, apiResponse, success, expressSupported } =
      response;

    if (!success || !baseFee || !sourceToken) {
      throw new Error("Failed to estimate gas fee");
    }

    const destGasFeeWei = parseUnits(
      (gasLimit * Number(destToken.gas_price)).toFixed(destToken.decimals),
      destToken.decimals
    );

    const minDestGasFeeWei = BigNumber.from(gasLimit).mul(minGasPrice); //minGasPrice already provided by the user in wei
    const srcGasFeeWei = parseUnits(
      (gasLimit * Number(sourceToken.gas_price)).toFixed(sourceToken.decimals),
      sourceToken.decimals
    );

    const executionFee = destGasFeeWei.gt(minDestGasFeeWei)
      ? srcGasFeeWei
      : srcGasFeeWei.mul(minDestGasFeeWei).div(destGasFeeWei);
    const executionFeeWithMultiplier =
      gasMultiplier > 1 ? executionFee.mul(gasMultiplier * 10000).div(10000) : executionFee;

    return gmpParams?.showDetailedFees
      ? {
          baseFee,
          expressFee,
          executionFee: executionFee.toString(),
          executionFeeWithMultiplier: executionFeeWithMultiplier.toString(),
          gasLimit,
          gasMultiplier,
          minGasPrice: minGasPrice === "0" ? "NA" : minGasPrice,
          apiResponse,
          isExpressSupported: expressSupported,
        }
      : executionFeeWithMultiplier.add(baseFee).toString();
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
      (ac) =>
        ac.chain_aliases[chainName]?.assetSymbol?.toLowerCase() === symbol?.toLowerCase() &&
        !ac.is_gas_token
    );
    if (!assetConfig) return null;
    return assetConfig.common_key[this.environment];
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
      (ac) => ac.common_key[this.environment] === denom && !ac.is_gas_token
    );
    if (!assetConfig) return null;
    return assetConfig.chain_aliases[chainName].assetSymbol;
  }

  /**
   * Get the asset config for an asset on a given chain given its denom
   * @param denom
   * @param chainName
   * @returns asset config
   */
  public async getAssetConfigFromDenom(denom: string, chainName: string) {
    if (!this.allAssets) await this._initializeAssets();
    const assetConfig: AssetConfig | undefined = this.allAssets.find(
      (ac) => ac.common_key[this.environment] === denom && !ac.is_gas_token
    );
    if (!assetConfig) return null;
    const result = assetConfig.chain_aliases[chainName];
    if (!result) return null;
    result.decimals = assetConfig.decimals;
    result.common_key = assetConfig.common_key[this.environment];
    return result;
  }

  /**
   * Get the contract address from the chainId and the contractKey
   * @param chainId - the chainId of the chain
   * @param contractKey - the key of the contract in the config file.
   * A valid contractKey can be found here https://github.com/axelarnetwork/chains/blob/790f08350e792e27412ded6721c13ce78267fd72/testnet-config.json#L1951-L1954 e.g. ("gas_service", "deposit_service", "default_refund_collector")
   * @returns the contract address
   */
  public async getContractAddressFromConfig(chainId: string, contractKey: string): Promise<string> {
    const chains = await loadChains({ environment: this.environment });
    const selectedChain = chains.find((chain) => chain.id.toLowerCase() === chainId.toLowerCase());
    if (!selectedChain) throw `getContractAddressFromConfig() ${chainId} not found`;
    return await fetch(s3[this.environment])
      .then((res) => res.json())
      .then((body) => body.assets.network[chainId.toLowerCase()][contractKey])
      .catch(() => undefined);
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

  /**
   * Check if a chain is active.
   * @param fromChainId source chain id
   * @param toChainId destination chain id
   * @param denom denom of asset (e.g. for USDC, uusdc)
   * @param proportionOfTotalLimitPerTransfer (optional) proportion of total limit you would like to limit users, e.g. for 25% of total, use 4
   * @returns true if the chain is active, false otherwise
   */
  public async getTransferLimit({
    fromChainId,
    toChainId,
    denom,
    proportionOfTotalLimitPerTransfer = 4,
  }: {
    fromChainId: string;
    toChainId: string;
    denom: string;
    proportionOfTotalLimitPerTransfer?: number;
  }): Promise<string> {
    const fromChainNexusResponse = await this.getTransferLimitNexusQuery({
      chainId: fromChainId,
      denom,
    });
    const toChainNexusResponse = await this.getTransferLimitNexusQuery({
      chainId: toChainId,
      denom,
    });

    try {
      const { limit: fromChainLimit } = fromChainNexusResponse;
      const { limit: toChainLimit } = toChainNexusResponse;

      if (!fromChainLimit && !toChainLimit)
        throw new Error(
          `could not fetch transfer limit for transfer from ${fromChainId} to ${toChainId} for ${denom}`
        );

      let min;
      if (fromChainLimit && toChainLimit) {
        const fromBigNum = BigNumber.from(fromChainLimit);
        const toBigNum = BigNumber.from(toChainLimit);
        min = fromBigNum.lt(toBigNum) ? fromBigNum : toBigNum;
      } else {
        min = BigNumber.from(fromChainLimit || toChainLimit);
      }
      return min.div(proportionOfTotalLimitPerTransfer).toString();
    } catch (e: any) {
      return "";
    }
  }

  async getTransferLimitNexusQuery({
    chainId,
    denom,
  }: {
    denom: string;
    chainId: string;
  }): Promise<TranslatedTransferRateLimitResponse> {
    // verify chain params
    await throwIfInvalidChainIds([chainId], this.environment);
    const chains = await loadChains({ environment: this.environment });
    const chain = chains.find((c) => c.id === chainId);
    if (!chain) throw `Chain ${chainId} not found`;

    const api: AxelarQueryClientType = await AxelarQueryClient.initOrGetAxelarQueryClient({
      environment: this.environment,
    });

    const asset = await this._convertAssetDenom(denom);

    try {
      // the "limit" response to the TransferRateLimit RPC query is of type Uint8Array, so need to decode it
      const res = await api.nexus.TransferRateLimit({ chain: chainId, asset });
      const { transferRateLimit } = res;
      if (
        !transferRateLimit ||
        !transferRateLimit.limit ||
        !transferRateLimit.incoming ||
        !transferRateLimit.outgoing
      )
        throw new Error(`did not receive a valid response to ${chainId} / ${denom} transfer query`);
      const { limit, incoming, outgoing } = transferRateLimit;
      return {
        limit: new TextDecoder("utf-8").decode(new Uint8Array(limit)),
        outgoing: new TextDecoder("utf-8").decode(new Uint8Array(outgoing)),
        incoming: new TextDecoder("utf-8").decode(new Uint8Array(incoming)),
      };
    } catch (e: any) {
      return { limit: "", outgoing: "", incoming: "" };
    }
  }

  private async _convertAssetDenom(denom: string): Promise<string> {
    if (!this.allAssets) await this._initializeAssets();
    const assetConfig = this.allAssets.find(
      (asset) => asset.common_key[this.environment] === denom.toLowerCase()
    );
    if (!assetConfig) throw `Asset ${denom} not found`;
    return assetConfig.wrapped_erc20 ? assetConfig.wrapped_erc20 : denom;
  }
}
