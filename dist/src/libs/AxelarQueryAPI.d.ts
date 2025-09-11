import { RestService } from "../services";
import { AxelarQueryAPIConfig, BaseFeeResponse, Environment, EstimateL1FeeParams, FeeToken } from "./types";
import { EvmChain } from "../constants/EvmChain";
import { GasToken } from "../constants/GasToken";
import { FeeInfoResponse, TransferFeeResponse } from "@axelar-network/axelarjs-types/axelar/nexus/v1beta1/query";
import { BigNumber, BigNumberish } from "ethers";
interface TranslatedTransferRateLimitResponse {
    incoming: string;
    outgoing: string;
    limit: string;
}
interface GMPParams {
    showDetailedFees: boolean;
    transferAmount?: number;
    transferAmountInUnits?: string;
    destinationContractAddress: string;
    sourceContractAddress: string;
    tokenSymbol: string;
}
export interface AxelarQueryAPIFeeResponse {
    expressFee: string;
    baseFee: string;
    executionFee: string;
    executionFeeWithMultiplier: string;
    l1ExecutionFeeWithMultiplier: string;
    l1ExecutionFee: string;
    gasMultiplier: number;
    gasLimit: BigNumberish;
    minGasPrice: string;
    apiResponse: any;
    isExpressSupported: boolean;
}
interface HopParams {
    /** The destination chain for the GMP transaction */
    destinationChain: string;
    /** The source chain for the GMP transaction */
    sourceChain: string;
    /**
     * The gasLimit needed for execution on the destination chain.
     * For OP Stack chains (Optimism, Base, Scroll, Fraxtal, Blast, Mantle, etc.),
     * only specify the gasLimit for L2 (L2GasLimit).
     * The endpoint estimates and bundles the gas needed for L1 (L1GasLimit) automatically.
     */
    gasLimit: string;
    /**
     * The multiplier of gas to be used on execution
     * @default 'auto' (multiplier used by relayer)
     */
    gasMultiplier?: number | "auto";
    /**
     * Minimum destination gas price
     * @default minimum gas price used by relayer
     */
    minGasPrice?: string;
    /** The token symbol on the source chain */
    sourceTokenSymbol?: string;
    /**
     * The token address on the source chain
     * @default "ZeroAddress" for native token
     */
    sourceTokenAddress?: string;
    /** Source address for checking if express is supported */
    sourceContractAddress?: string;
    /** The payload that will be used on destination */
    executeData?: string;
    /** Destination contract address for checking if express is supported */
    destinationContractAddress?: string;
    /** Symbol that is used in callContractWithToken for checking if express is supported */
    symbol?: string;
    /**
     * Token amount (in units) that is used in callContractWithToken for checking if express is supported
     */
    amountInUnits?: string;
}
/**
 * Represents detailed fee information for a single hop
 */
interface HopFeeDetails {
    isExpressSupported: boolean;
    baseFee: string;
    expressFee: string;
    executionFee: string;
    executionFeeWithMultiplier: string;
    totalFee: string;
    gasLimit: string;
    gasLimitWithL1Fee: string;
    gasMultiplier: number;
    minGasPrice: string;
}
/**
 * Response for fee estimation with detailed breakdown
 */
export interface DetailedFeeResponse {
    isExpressSupported: boolean;
    baseFee: string;
    expressFee: string;
    executionFee: string;
    executionFeeWithMultiplier: string;
    totalFee: string;
    details?: HopFeeDetails[];
}
interface EstimateMultihopFeeOptions {
    showDetailedFees?: boolean;
}
export declare class AxelarQueryAPI {
    readonly environment: Environment;
    readonly lcdApi: RestService;
    readonly rpcApi: RestService;
    readonly axelarGMPServiceApi: RestService;
    readonly axelarscanApi: RestService;
    readonly axelarRpcUrl: string;
    readonly axelarLcdUrl: string;
    readonly axelarGMPServiceUrl: string;
    readonly axelarscanBaseApiUrl: string;
    private allAssets;
    private axelarQueryClient;
    private chainsList;
    constructor(config: AxelarQueryAPIConfig);
    private _initializeAssets;
    /**
     * Gets the fee for a chain and asset
     * example testnet query: https://axelartest-lcd.quickapi.com/axelar/nexus/v1beta1/fee?chain=ethereum&asset=uusd
     * @param chainId
     * @param assetDenom
     * @returns
     */
    getFeeForChainAndAsset(chainId: string, assetDenom: string): Promise<FeeInfoResponse>;
    getEVMEvent(sourceChainId: string, srcTxHash: string, srcEventId: number): Promise<import("@axelar-network/axelarjs-types/axelar/evm/v1beta1/query").EventResponse | undefined>;
    getConfirmationHeight(chain: string): Promise<number>;
    /**
     * Gest the transfer fee for a given transaction
     * example testnet query: "https://axelartest-lcd.quickapi.com/axelar/nexus/v1beta1/transfer_fee?source_chain=ethereum&destination_chain=terra&amount=100000000uusd"
     * @param sourceChainId
     * @param destinationChainId
     * @param assetDenom
     * @param amountInDenom
     * @returns
     */
    getTransferFee(sourceChainId: string, destinationChainId: string, assetDenom: string, amountInDenom: number): Promise<TransferFeeResponse>;
    /**
     * Gets the gas price for a destination chain to be paid to the gas receiver on a source chain
     * example testnet query: https://testnet.api.gmp.axelarscan.io/?method=getGasPrice&destinationChain=ethereum&sourceChain=avalanche&sourceTokenAddress=0x43F4600b552089655645f8c16D86A5a9Fa296bc3&sourceTokenSymbol=UST
     * @param sourceChainId
     * @param destinationChainId
     * @param sourceChainTokenSymbol
     * @returns
     */
    getGasInfo(sourceChainId: EvmChain | string, destinationChainId: EvmChain | string, sourceChainTokenSymbol: GasToken | string): Promise<any>;
    /**
     * Gets the base fee in native token wei for a given source and destination chain combination
     * @param sourceChainName
     * @param destinationChainName
     * @param sourceTokenSymbol (optional)
     * @returns base fee in native token in wei, translated into the native gas token of choice
     */
    getNativeGasBaseFee(sourceChainId: EvmChain | string, destinationChainId: EvmChain | string, sourceTokenSymbol?: GasToken, symbol?: string, destinationContractAddress?: string, sourceContractAddress?: string, amount?: number, amountInUnits?: BigNumber | string): Promise<BaseFeeResponse>;
    estimateL1GasFee(destChainId: EvmChain | string, l1FeeParams: EstimateL1FeeParams): Promise<BigNumber>;
    calculateL1FeeForDestL2(destChainId: EvmChain | string, destToken: FeeToken, executeData: string | undefined, sourceToken: FeeToken, ethereumToken: BaseFeeResponse["ethereumToken"], actualGasMultiplier: number, l2Type: BaseFeeResponse["l2_type"]): Promise<[BigNumber, BigNumber]>;
    /**
     * Calculate estimated gas amount to pay for the gas receiver contract.
     * @param sourceChainId Can be of the EvmChain enum or string. If string, should try to generalize to use the CHAINS constants (e.g. CHAINS.MAINNET.ETHEREUM)
     * @param destinationChainId Can be of the EvmChain enum or string. If string, should try to generalize to use the CHAINS constants (e.g. CHAINS.MAINNET.ETHEREUM)
     * @param gasLimit An estimated gas amount required to execute the transaction at the destination chain. For destinations on OP Stack chains (Optimism, Base, Scroll, Fraxtal, Blast, etc.), set only the L2 gas limit. The endpoint will automatically handle L1 gas estimation and bundling.
     * @param gasMultiplier (Optional) A multiplier used to create a buffer above the calculated gas fee, to account for potential slippage throughout tx execution, e.g. 1.1 = 10% buffer. supports up to 3 decimal places
     * The default value is "auto", which uses the gas multiplier from the fee response
     * @param sourceChainTokenSymbol (Optional) the gas token symbol on the source chain.
     * @param minGasPrice (Optional) A minimum value, in wei, for the gas price on the destination chain that is used to override the estimated gas price if it falls below this specified value.
     * @param executeData (Optional) The data to be executed on the destination chain. It's recommended to specify it if the destination chain is an L2 chain to calculate more accurate gas fee.
     * @param gmpParams (Optional) Additional parameters for GMP transactions, including the ability to see a detailed view of the fee response
     * @returns
     */
    estimateGasFee(sourceChainId: EvmChain | string, destinationChainId: EvmChain | string, gasLimit: BigNumberish, gasMultiplier?: number | "auto", sourceChainTokenSymbol?: GasToken | string, minGasPrice?: string, executeData?: string, gmpParams?: GMPParams): Promise<string | AxelarQueryAPIFeeResponse>;
    /**
     * Estimates the total gas fee for a multi-hop GMP transfer via Axelar
     * @param hops Array of hop parameters defining each step of the transfer path
     * @param options Optional parameters for fee estimation
     * @throws {Error} If no hops are provided or chain validation fails
     * @returns Promise containing the estimated fees if the showDetailedFees option is not provided, or an object containing the detailed fees if showDetailedFees is true
     */
    estimateMultihopFee(hops: HopParams[], options?: EstimateMultihopFeeOptions): Promise<string | DetailedFeeResponse>;
    /**
     * Get the denom for an asset given its symbol on a chain
     * @param symbol
     * @param chainName
     * @returns
     */
    getDenomFromSymbol(symbol: string, chainName: string): Promise<string | null>;
    /**
     * Get the symbol for an asset on a given chain given its denom
     * @param denom
     * @param chainName
     * @returns
     */
    getSymbolFromDenom(denom: string, chainName: string): Promise<string | null | undefined>;
    /**
     * Get the asset config for an asset on a given chain given its denom
     * @param denom
     * @param chainName
     * @returns asset config
     */
    getAssetConfigFromDenom(denom: string, chainName: string): Promise<import("../assets/types").AssetInfoForChain | null>;
    /**
     * Get the contract address from the chainId and the contractKey
     * @param chainId - the chainId of the chain
     * @param contractKey - the key of the contract in the config file.
     * A valid contractKey can be found here https://github.com/axelarnetwork/chains/blob/790f08350e792e27412ded6721c13ce78267fd72/testnet-config.json#L1951-L1954 e.g. ("gas_service", "deposit_service", "default_refund_collector")
     * @returns the contract address
     */
    getContractAddressFromConfig(chainId: string, contractKey: string): Promise<string>;
    /**
     * Get a list of active chains.
     * @returns an array of active chains
     */
    getActiveChains(): Promise<string[]>;
    /**
     * Check if a chain is active.
     * @param chainId the chain id to check
     * @returns true if the chain is active, false otherwise
     */
    isChainActive(chainId: EvmChain | string): Promise<boolean>;
    /**
     * Throw an error if any chain in the list is inactive.
     * @param chainIds A list of chainIds to check
     */
    throwIfInactiveChains(chainIds: EvmChain[] | string[]): Promise<void>;
    /**
     * Initialize the query client if it hasn't been initialized yet
     */
    private initQueryClientIfNeeded;
    /**
     * Check if a chain is active.
     * @param fromChainId source chain id
     * @param toChainId destination chain id
     * @param denom denom of asset (e.g. for USDC, uusdc)
     * @param proportionOfTotalLimitPerTransfer (optional) proportion of total limit you would like to limit users, e.g. for 25% of total, use 4
     * @returns true if the chain is active, false otherwise
     */
    getTransferLimit({ fromChainId, toChainId, denom, proportionOfTotalLimitPerTransfer, }: {
        fromChainId: string;
        toChainId: string;
        denom: string;
        proportionOfTotalLimitPerTransfer?: number;
    }): Promise<string>;
    getTransferLimitNexusQuery({ chainId, denom, }: {
        denom: string;
        chainId: string;
    }): Promise<TranslatedTransferRateLimitResponse>;
    private getChainInfo;
    private _convertAssetDenom;
    /**
     * Maps raw API response to simplified hop fee details
     */
    private mapToHopFeeDetails;
    /**
     * Maps raw API response to simplified detailed fee response
     */
    private mapToDetailedFeeResponse;
}
export {};
//# sourceMappingURL=AxelarQueryAPI.d.ts.map