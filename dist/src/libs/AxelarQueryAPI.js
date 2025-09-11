"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxelarQueryAPI = void 0;
const utils_1 = require("ethers/lib/utils");
const assets_1 = require("../assets");
const constants_1 = require("../constants");
const services_1 = require("../services");
const AxelarQueryClient_1 = require("./AxelarQueryClient");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const query_1 = require("@axelar-network/axelarjs-types/axelar/nexus/v1beta1/query");
const utils_2 = require("../utils");
const chains_1 = require("../chains");
const s3_1 = __importDefault(require("./TransactionRecoveryApi/constants/s3"));
const ethers_1 = require("ethers");
const BigNumberUtils_1 = require("./BigNumberUtils");
const testnet_1 = require("./TransactionRecoveryApi/constants/chain/testnet");
const mainnet_1 = require("./TransactionRecoveryApi/constants/chain/mainnet");
const getL1Fee_1 = require("./fee/getL1Fee");
class AxelarQueryAPI {
    constructor(config) {
        this.chainsList = [];
        /**
         * Initialize the query client if it hasn't been initialized yet
         */
        this.initQueryClientIfNeeded = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.axelarQueryClient) {
                this.axelarQueryClient = yield AxelarQueryClient_1.AxelarQueryClient.initOrGetAxelarQueryClient({
                    environment: this.environment,
                    axelarRpcUrl: this.axelarRpcUrl,
                });
            }
        });
        const { axelarLcdUrl, axelarRpcUrl, environment } = config;
        const links = (0, constants_1.getConfigs)(environment);
        this.axelarRpcUrl = axelarRpcUrl || links.axelarRpcUrl;
        this.axelarLcdUrl = axelarLcdUrl || links.axelarLcdUrl;
        this.axelarGMPServiceUrl = links.axelarGMPApiUrl;
        this.axelarscanBaseApiUrl = links.axelarscanBaseApiUrl;
        this.environment = environment;
        this.lcdApi = new services_1.RestService(this.axelarLcdUrl);
        this.rpcApi = new services_1.RestService(this.axelarRpcUrl);
        this.axelarGMPServiceApi = new services_1.RestService(this.axelarGMPServiceUrl);
        this.axelarscanApi = new services_1.RestService(this.axelarscanBaseApiUrl);
        this._initializeAssets();
    }
    _initializeAssets() {
        return __awaiter(this, void 0, void 0, function* () {
            this.allAssets = yield (0, assets_1.loadAssets)({ environment: this.environment });
        });
    }
    /**
     * Gets the fee for a chain and asset
     * example testnet query: https://axelartest-lcd.quickapi.com/axelar/nexus/v1beta1/fee?chain=ethereum&asset=uusd
     * @param chainId
     * @param assetDenom
     * @returns
     */
    getFeeForChainAndAsset(chainId, assetDenom) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, utils_2.throwIfInvalidChainIds)([chainId], this.environment);
            yield this.initQueryClientIfNeeded();
            return this.axelarQueryClient.nexus.FeeInfo({
                chain: chainId,
                asset: yield this._convertAssetDenom(assetDenom),
            });
        });
    }
    getEVMEvent(sourceChainId, srcTxHash, srcEventId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, utils_2.throwIfInvalidChainIds)([sourceChainId], this.environment);
            yield this.initQueryClientIfNeeded();
            return this.axelarQueryClient.evm
                .Event({
                chain: sourceChainId,
                eventId: `${srcTxHash}-${srcEventId}`,
            })
                .catch(() => undefined);
        });
    }
    getConfirmationHeight(chain) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, utils_2.throwIfInvalidChainIds)([chain], this.environment);
            yield this.initQueryClientIfNeeded();
            const chainInfo = yield this.getChainInfo(chain);
            return (chainInfo === null || chainInfo === void 0 ? void 0 : chainInfo.confirmLevel) || 0;
        });
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
    getTransferFee(sourceChainId, destinationChainId, assetDenom, amountInDenom) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, utils_2.throwIfInvalidChainIds)([sourceChainId, destinationChainId], this.environment);
            yield this.initQueryClientIfNeeded();
            return this.axelarQueryClient.nexus.TransferFee({
                sourceChain: sourceChainId,
                destinationChain: destinationChainId,
                amount: `${amountInDenom.toString()}${yield this._convertAssetDenom(assetDenom)}`,
            });
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
    getGasInfo(sourceChainId, destinationChainId, sourceChainTokenSymbol) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, utils_2.throwIfInvalidChainIds)([sourceChainId, destinationChainId], this.environment);
            const params = new URLSearchParams({
                method: "getGasPrice",
                destinationChain: destinationChainId,
                sourceChain: sourceChainId,
                sourceTokenSymbol: sourceChainTokenSymbol,
            });
            return this.axelarGMPServiceApi.get(`?${params}`).then((resp) => resp.result);
        });
    }
    /**
     * Gets the base fee in native token wei for a given source and destination chain combination
     * @param sourceChainName
     * @param destinationChainName
     * @param sourceTokenSymbol (optional)
     * @returns base fee in native token in wei, translated into the native gas token of choice
     */
    getNativeGasBaseFee(sourceChainId, destinationChainId, sourceTokenSymbol, symbol, destinationContractAddress, sourceContractAddress, amount, amountInUnits) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, utils_2.throwIfInvalidChainIds)([sourceChainId, destinationChainId], this.environment);
            const params = {
                method: "getFees",
                destinationChain: destinationChainId,
                sourceChain: sourceChainId,
            };
            if (sourceTokenSymbol)
                params.sourceTokenSymbol = sourceTokenSymbol;
            if (symbol)
                params.symbol = symbol;
            if (destinationContractAddress)
                params.destinationContractAddress = destinationContractAddress;
            if (sourceContractAddress)
                params.sourceContractAddress = sourceContractAddress;
            if (amount) {
                params.amount = amount;
            }
            else if (amountInUnits) {
                params.amountInUnits = amountInUnits;
            }
            return this.axelarGMPServiceApi.post("", params).then((response) => {
                const { source_base_fee_string, source_token, ethereum_token, destination_native_token, express_fee_string, express_supported, l2_type, } = response.result;
                const execute_gas_multiplier = response.result.execute_gas_multiplier;
                const { decimals: sourceTokenDecimals } = source_token;
                const baseFee = (0, utils_1.parseUnits)(source_base_fee_string, sourceTokenDecimals).toString();
                const expressFee = express_fee_string
                    ? (0, utils_1.parseUnits)(express_fee_string, sourceTokenDecimals).toString()
                    : "0";
                return {
                    baseFee,
                    expressFee,
                    sourceToken: source_token,
                    executeGasMultiplier: parseFloat(execute_gas_multiplier.toFixed(2)),
                    destToken: {
                        gas_price: destination_native_token.gas_price,
                        decimals: destination_native_token.decimals,
                        token_price: destination_native_token.token_price,
                        name: destination_native_token.name,
                        symbol: destination_native_token.symbol,
                        l1_gas_oracle_address: destination_native_token.l1_gas_oracle_address,
                        l1_gas_price_in_units: destination_native_token.l1_gas_price_in_units,
                    },
                    l2_type,
                    ethereumToken: ethereum_token,
                    apiResponse: response,
                    success: true,
                    expressSupported: express_supported,
                };
            });
        });
    }
    estimateL1GasFee(destChainId, l1FeeParams) {
        return __awaiter(this, void 0, void 0, function* () {
            // Retrieve the RPC URL for the source chain to calculate L1 fee
            const rpcMap = this.environment === "mainnet" ? mainnet_1.rpcMap : testnet_1.rpcMap;
            // Throw an error if the RPC URL is not found
            if (!rpcMap[destChainId]) {
                throw new Error(`RPC URL not found for chain ${destChainId}`);
            }
            const provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcMap[destChainId]);
            return (0, getL1Fee_1.getL1FeeForL2)(provider, l1FeeParams);
        });
    }
    calculateL1FeeForDestL2(destChainId, destToken, executeData, sourceToken, ethereumToken, actualGasMultiplier, l2Type) {
        return __awaiter(this, void 0, void 0, function* () {
            let l1ExecutionFee = ethers_1.BigNumber.from(0);
            let l1ExecutionFeeWithMultiplier = ethers_1.BigNumber.from(0);
            if (destToken.l1_gas_price_in_units) {
                if (!executeData) {
                    console.warn(`Since you did not provide executeData, this API will not accurately calculate the
          total required fee as we will not be able to capture the L1 inclusion fee for this L2 chain.`);
                }
                // Calculate the L1 execution fee. This value is in ETH wei.
                l1ExecutionFee = yield this.estimateL1GasFee(destChainId, {
                    executeData: executeData || constants_1.DEFAULT_L1_EXECUTE_DATA,
                    l1GasPrice: destToken.l1_gas_price_in_units,
                    l1GasOracleAddress: destToken.l1_gas_oracle_address,
                    destChain: destChainId,
                    l2Type,
                });
                // Convert the L1 execution fee to the source token
                const srcTokenPrice = Number(sourceToken.token_price.usd);
                const ethTokenPrice = Number(ethereumToken.token_price.usd);
                const ethToSrcTokenPriceRatio = ethTokenPrice / srcTokenPrice;
                let actualL1ExecutionFee = l1ExecutionFee
                    .mul(Math.ceil(ethToSrcTokenPriceRatio * 1000))
                    .div(1000);
                if (sourceToken.decimals !== destToken.decimals) {
                    actualL1ExecutionFee = BigNumberUtils_1.BigNumberUtils.convertTokenAmount(actualL1ExecutionFee, destToken.decimals, sourceToken.decimals);
                }
                l1ExecutionFee = ethers_1.BigNumber.from(actualL1ExecutionFee.toString());
                // Calculate the L1 execution fee with the gas multiplier
                l1ExecutionFeeWithMultiplier = l1ExecutionFee.mul(actualGasMultiplier * 10000).div(10000);
            }
            return [l1ExecutionFee, l1ExecutionFeeWithMultiplier];
        });
    }
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
    estimateGasFee(sourceChainId_1, destinationChainId_1, gasLimit_1) {
        return __awaiter(this, arguments, void 0, function* (sourceChainId, destinationChainId, gasLimit, gasMultiplier = "auto", sourceChainTokenSymbol, minGasPrice = "0", executeData, gmpParams) {
            yield (0, utils_2.throwIfInvalidChainIds)([sourceChainId, destinationChainId], this.environment);
            if (!ethers_1.BigNumber.from(gasLimit).gt(0)) {
                throw new Error("Gas limit must be provided");
            }
            const { baseFee, expressFee, sourceToken, ethereumToken, executeGasMultiplier, destToken, apiResponse, l2_type, success, expressSupported, } = yield this.getNativeGasBaseFee(sourceChainId, destinationChainId, sourceChainTokenSymbol, gmpParams === null || gmpParams === void 0 ? void 0 : gmpParams.tokenSymbol, gmpParams === null || gmpParams === void 0 ? void 0 : gmpParams.destinationContractAddress, gmpParams === null || gmpParams === void 0 ? void 0 : gmpParams.sourceContractAddress, gmpParams === null || gmpParams === void 0 ? void 0 : gmpParams.transferAmount, gmpParams === null || gmpParams === void 0 ? void 0 : gmpParams.transferAmountInUnits);
            if (!success || !baseFee || !sourceToken) {
                throw new Error("Failed to estimate gas fee");
            }
            const destGasFeeWei = BigNumberUtils_1.BigNumberUtils.multiplyToGetWei(ethers_1.BigNumber.from(gasLimit), destToken.gas_price, destToken.decimals);
            const minDestGasFeeWei = ethers_1.BigNumber.from(gasLimit).mul(minGasPrice); //minGasPrice already provided by the user in wei
            const srcGasFeeWei = BigNumberUtils_1.BigNumberUtils.multiplyToGetWei(ethers_1.BigNumber.from(gasLimit), sourceToken.gas_price, sourceToken.decimals);
            const executionFee = destGasFeeWei.gt(minDestGasFeeWei)
                ? srcGasFeeWei
                : srcGasFeeWei.mul(minDestGasFeeWei).div(destGasFeeWei);
            const actualGasMultiplier = gasMultiplier === "auto" ? executeGasMultiplier : gasMultiplier;
            const executionFeeWithMultiplier = actualGasMultiplier > 1
                ? executionFee.mul(actualGasMultiplier * 10000).div(10000)
                : executionFee;
            const [l1ExecutionFee, l1ExecutionFeeWithMultiplier] = yield this.calculateL1FeeForDestL2(destinationChainId, destToken, executeData, sourceToken, ethereumToken, actualGasMultiplier, l2_type);
            return (gmpParams === null || gmpParams === void 0 ? void 0 : gmpParams.showDetailedFees)
                ? {
                    baseFee,
                    expressFee,
                    executionFee: executionFee.toString(),
                    executionFeeWithMultiplier: executionFeeWithMultiplier.toString(),
                    l1ExecutionFeeWithMultiplier: l1ExecutionFeeWithMultiplier.toString(),
                    l1ExecutionFee: l1ExecutionFee.toString(),
                    gasLimit,
                    gasMultiplier: actualGasMultiplier,
                    minGasPrice: minGasPrice === "0" ? "NA" : minGasPrice,
                    apiResponse,
                    isExpressSupported: expressSupported,
                }
                : l1ExecutionFeeWithMultiplier.add(executionFeeWithMultiplier).add(baseFee).toString();
        });
    }
    /**
     * Estimates the total gas fee for a multi-hop GMP transfer via Axelar
     * @param hops Array of hop parameters defining each step of the transfer path
     * @param options Optional parameters for fee estimation
     * @throws {Error} If no hops are provided or chain validation fails
     * @returns Promise containing the estimated fees if the showDetailedFees option is not provided, or an object containing the detailed fees if showDetailedFees is true
     */
    estimateMultihopFee(hops, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (hops.length === 0) {
                throw new Error("At least one hop parameter must be provided");
            }
            const chainsToValidate = Array.from(new Set([...hops.map((hop) => hop.destinationChain), ...hops.map((hop) => hop.sourceChain)]));
            yield (0, utils_2.throwIfInvalidChainIds)(chainsToValidate, this.environment);
            try {
                const response = yield this.axelarscanApi.post("/gmp/estimateGasFeeForNHops", {
                    params: hops,
                    showDetailedFees: (_a = options === null || options === void 0 ? void 0 : options.showDetailedFees) !== null && _a !== void 0 ? _a : false,
                });
                if (options === null || options === void 0 ? void 0 : options.showDetailedFees) {
                    return this.mapToDetailedFeeResponse(response);
                }
                return response;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to estimate multi-hop gas fee: ${error.message}`);
                }
                throw error;
            }
        });
    }
    /**
     * Get the denom for an asset given its symbol on a chain
     * @param symbol
     * @param chainName
     * @returns
     */
    getDenomFromSymbol(symbol, chainName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.allAssets)
                yield this._initializeAssets();
            const assetConfig = this.allAssets.find((ac) => {
                var _a, _b;
                return ((_b = (_a = ac.chain_aliases[chainName]) === null || _a === void 0 ? void 0 : _a.assetSymbol) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === (symbol === null || symbol === void 0 ? void 0 : symbol.toLowerCase()) &&
                    !ac.is_gas_token;
            });
            if (!assetConfig)
                return null;
            return assetConfig.common_key[this.environment];
        });
    }
    /**
     * Get the symbol for an asset on a given chain given its denom
     * @param denom
     * @param chainName
     * @returns
     */
    getSymbolFromDenom(denom, chainName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.allAssets)
                yield this._initializeAssets();
            const assetConfig = this.allAssets.find((ac) => ac.common_key[this.environment] === denom && !ac.is_gas_token);
            if (!assetConfig)
                return null;
            return assetConfig.chain_aliases[chainName].assetSymbol;
        });
    }
    /**
     * Get the asset config for an asset on a given chain given its denom
     * @param denom
     * @param chainName
     * @returns asset config
     */
    getAssetConfigFromDenom(denom, chainName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.allAssets)
                yield this._initializeAssets();
            const assetConfig = this.allAssets.find((ac) => ac.common_key[this.environment] === denom && !ac.is_gas_token);
            if (!assetConfig)
                return null;
            const result = assetConfig.chain_aliases[chainName];
            if (!result)
                return null;
            result.decimals = assetConfig.decimals;
            result.common_key = assetConfig.common_key[this.environment];
            return result;
        });
    }
    /**
     * Get the contract address from the chainId and the contractKey
     * @param chainId - the chainId of the chain
     * @param contractKey - the key of the contract in the config file.
     * A valid contractKey can be found here https://github.com/axelarnetwork/chains/blob/790f08350e792e27412ded6721c13ce78267fd72/testnet-config.json#L1951-L1954 e.g. ("gas_service", "deposit_service", "default_refund_collector")
     * @returns the contract address
     */
    getContractAddressFromConfig(chainId, contractKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedChain = yield this.getChainInfo(chainId);
            if (!selectedChain)
                throw `getContractAddressFromConfig() ${chainId} not found`;
            return yield (0, cross_fetch_1.default)(s3_1.default[this.environment])
                .then((res) => res.json())
                .then((body) => body.assets.network[chainId.toLowerCase()][contractKey])
                .catch(() => undefined);
        });
    }
    /**
     * Get a list of active chains.
     * @returns an array of active chains
     */
    getActiveChains() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initQueryClientIfNeeded();
            return this.axelarQueryClient.nexus
                .Chains({ status: query_1.ChainStatus.CHAIN_STATUS_ACTIVATED })
                .then((resp) => resp.chains);
        });
    }
    /**
     * Check if a chain is active.
     * @param chainId the chain id to check
     * @returns true if the chain is active, false otherwise
     */
    isChainActive(chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getActiveChains()
                .then((chains) => chains.map((chain) => chain.toLowerCase()))
                .then((chains) => chains.includes(chainId.toLowerCase()));
        });
    }
    /**
     * Throw an error if any chain in the list is inactive.
     * @param chainIds A list of chainIds to check
     */
    throwIfInactiveChains(chainIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield Promise.all(chainIds.map((chainId) => this.isChainActive(chainId)));
            for (let i = 0; i < chainIds.length; i++) {
                if (!results[i]) {
                    throw new Error(`Chain ${chainIds[i]} is not active. Please check the list of active chains using the getActiveChains() method.`);
                }
            }
        });
    }
    /**
     * Check if a chain is active.
     * @param fromChainId source chain id
     * @param toChainId destination chain id
     * @param denom denom of asset (e.g. for USDC, uusdc)
     * @param proportionOfTotalLimitPerTransfer (optional) proportion of total limit you would like to limit users, e.g. for 25% of total, use 4
     * @returns true if the chain is active, false otherwise
     */
    getTransferLimit(_a) {
        return __awaiter(this, arguments, void 0, function* ({ fromChainId, toChainId, denom, proportionOfTotalLimitPerTransfer = 4, }) {
            const fromChainNexusResponse = yield this.getTransferLimitNexusQuery({
                chainId: fromChainId,
                denom,
            });
            const toChainNexusResponse = yield this.getTransferLimitNexusQuery({
                chainId: toChainId,
                denom,
            });
            try {
                const { limit: fromChainLimit } = fromChainNexusResponse;
                const { limit: toChainLimit } = toChainNexusResponse;
                if (!fromChainLimit && !toChainLimit)
                    throw new Error(`could not fetch transfer limit for transfer from ${fromChainId} to ${toChainId} for ${denom}`);
                let min;
                if (fromChainLimit && toChainLimit) {
                    const fromBigNum = ethers_1.BigNumber.from(fromChainLimit);
                    const toBigNum = ethers_1.BigNumber.from(toChainLimit);
                    min = fromBigNum.lt(toBigNum) ? fromBigNum : toBigNum;
                }
                else {
                    min = ethers_1.BigNumber.from(fromChainLimit || toChainLimit);
                }
                return min.div(proportionOfTotalLimitPerTransfer).toString();
            }
            catch (e) {
                return "";
            }
        });
    }
    getTransferLimitNexusQuery(_a) {
        return __awaiter(this, arguments, void 0, function* ({ chainId, denom, }) {
            // verify chain params
            yield (0, utils_2.throwIfInvalidChainIds)([chainId], this.environment);
            const chain = this.getChainInfo(chainId);
            if (!chain)
                throw `Chain ${chainId} not found`;
            const api = yield AxelarQueryClient_1.AxelarQueryClient.initOrGetAxelarQueryClient({
                environment: this.environment,
            });
            const asset = yield this._convertAssetDenom(denom);
            try {
                // the "limit" response to the TransferRateLimit RPC query is of type Uint8Array, so need to decode it
                const res = yield api.nexus.TransferRateLimit({ chain: chainId, asset });
                const { transferRateLimit } = res;
                if (!transferRateLimit ||
                    !transferRateLimit.limit ||
                    !transferRateLimit.incoming ||
                    !transferRateLimit.outgoing)
                    throw new Error(`did not receive a valid response to ${chainId} / ${denom} transfer query`);
                const { limit, incoming, outgoing } = transferRateLimit;
                return {
                    limit: new TextDecoder("utf-8").decode(new Uint8Array(limit)),
                    outgoing: new TextDecoder("utf-8").decode(new Uint8Array(outgoing)),
                    incoming: new TextDecoder("utf-8").decode(new Uint8Array(incoming)),
                };
            }
            catch (e) {
                return { limit: "", outgoing: "", incoming: "" };
            }
        });
    }
    getChainInfo(chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.chainsList.length === 0) {
                this.chainsList = yield (0, chains_1.loadChains)({
                    environment: this.environment,
                });
            }
            const chainInfo = this.chainsList.find((chainInfo) => chainInfo.id.toLowerCase() === chainId.toLowerCase());
            return chainInfo;
        });
    }
    _convertAssetDenom(denom) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.allAssets)
                yield this._initializeAssets();
            const assetConfig = this.allAssets.find((asset) => asset.common_key[this.environment] === denom.toLowerCase());
            if (!assetConfig)
                throw `Asset ${denom} not found`;
            return assetConfig.wrapped_erc20 ? assetConfig.wrapped_erc20 : denom;
        });
    }
    /**
     * Maps raw API response to simplified hop fee details
     */
    mapToHopFeeDetails(rawHopDetails) {
        return {
            isExpressSupported: rawHopDetails.isExpressSupported,
            baseFee: rawHopDetails.baseFee,
            expressFee: rawHopDetails.expressFee,
            executionFee: rawHopDetails.executionFee,
            executionFeeWithMultiplier: rawHopDetails.executionFeeWithMultiplier,
            totalFee: rawHopDetails.totalFee,
            gasLimit: rawHopDetails.gasLimit,
            gasLimitWithL1Fee: rawHopDetails.gasLimitWithL1Fee,
            gasMultiplier: rawHopDetails.gasMultiplier,
            minGasPrice: rawHopDetails.minGasPrice,
        };
    }
    /**
     * Maps raw API response to simplified detailed fee response
     */
    mapToDetailedFeeResponse(rawResponse) {
        var _a;
        return {
            isExpressSupported: rawResponse.isExpressSupported,
            baseFee: rawResponse.baseFee,
            expressFee: rawResponse.expressFee,
            executionFee: rawResponse.executionFee,
            executionFeeWithMultiplier: rawResponse.executionFeeWithMultiplier,
            totalFee: rawResponse.totalFee,
            details: (_a = rawResponse.details) === null || _a === void 0 ? void 0 : _a.map(this.mapToHopFeeDetails),
        };
    }
}
exports.AxelarQueryAPI = AxelarQueryAPI;
//# sourceMappingURL=AxelarQueryAPI.js.map