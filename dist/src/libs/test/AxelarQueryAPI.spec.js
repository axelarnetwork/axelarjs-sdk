"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const chains_1 = require("../../chains");
const AxelarQueryAPI_1 = require("../AxelarQueryAPI");
const types_1 = require("../types");
const EvmChain_1 = require("../../constants/EvmChain");
const GasToken_1 = require("../../constants/GasToken");
const stubs_1 = require("./stubs");
const MOCK_EXECUTE_DATA = "0x1a98b2e0e68ba0eb84262d4bcf91955ec2680b37bcedd59a1f48e18d183dac9961bf9d1400000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000d40000000000000000000000000000000000000000000000000000000000deac2c6000000000000000000000000000000000000000000000000000000000000000762696e616e636500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a307863653136463639333735353230616230313337376365374238386635424138433438463844363636000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bc000000000000000000000000000000000000000000000000000000000000000400000000000000000000000004607cad6135d7a119185ebe062d3b369b1b536ef000000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000003600000000000000000000000000000000000000000000000000000000000000580000000000000000000000000000000000000000000000000000000000000070000000000000000000000000000000000000000000000000000000000000009200000000000000000000000000000000000000000000000000000000000000a8000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000eb466342c4d449bc9f53a865d5cb90586f4052150000000000000000000000000000000000000000000000000000000000000001000000000000000000000000eb466342c4d449bc9f53a865d5cb90586f405215000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000044095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000eb466342c4d449bc9f53a865d5cb90586f4052150000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000eb466342c4d449bc9f53a865d5cb90586f405215000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc800000000000000000000000000000000000000000000000000000000000000640000000000000000000000004fd39c9e151e50580779bd04b1f7ecc310079fd3000000000000000000000000000000000000000000000000000000000deac2c6000000000000000000000000000000000000000000000000000000000dc647500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000eb466342c4d449bc9f53a865d5cb90586f40521500000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000001000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000044095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc80000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc800000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab100000000000000000000000000000000000000000000000000000000000000640000000000000000000000004fd39c9e151e50580779bd04b1f7ecc310079fd3000000000000000000000000000000000000000000000000000000000de83dbf000000000000000000000000000000000000000000000000015d8c7908dbe7130000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc80000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000100000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000242e1a7d4d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000004607cad6135d7a119185ebe062d3b369b1b536ef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000761786c5553444300000000000000000000000000000000000000000000000000";
describe("AxelarQueryAPI", () => {
    const api = new AxelarQueryAPI_1.AxelarQueryAPI({
        environment: types_1.Environment.TESTNET,
        axelarRpcUrl: "https://axelar-testnet-rpc.qubelabs.io:443",
    });
    beforeEach(() => {
        vitest.clearAllMocks();
    });
    describe("getFeeForChainAndAsset", () => {
        test("It should generate a fee response", () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const [chain, assetDenom] = ["avalanche", "uausdc"];
            const response = yield api.getFeeForChainAndAsset(chain, assetDenom);
            expect(response.feeInfo).toBeDefined();
            expect((_a = response.feeInfo) === null || _a === void 0 ? void 0 : _a.chain).toEqual(chain);
            expect((_b = response.feeInfo) === null || _b === void 0 ? void 0 : _b.asset).toEqual(assetDenom);
            expect((_c = response.feeInfo) === null || _c === void 0 ? void 0 : _c.feeRate).toBeDefined();
            expect((_d = response.feeInfo) === null || _d === void 0 ? void 0 : _d.minFee).toBeDefined();
            expect((_e = response.feeInfo) === null || _e === void 0 ? void 0 : _e.maxFee).toBeDefined();
        }));
    });
    describe("getTransferFee", () => {
        test("It should generate a transfer fee for a specific transaction", () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const [sourceChainName, destinationChainName, assetDenom, amount] = [
                "avalanche",
                "polygon",
                "uausdc",
                100000000,
            ];
            const response = yield api.getTransferFee(sourceChainName, destinationChainName, assetDenom, amount);
            expect(response).toBeDefined();
            expect(response.fee).toBeDefined();
            expect((_a = response.fee) === null || _a === void 0 ? void 0 : _a.denom).toEqual(assetDenom);
            expect((_b = response.fee) === null || _b === void 0 ? void 0 : _b.amount).toBeDefined();
        }));
        test("it should suggest a chain id when passing chain name", () => __awaiter(void 0, void 0, void 0, function* () {
            const [sourceChainName, destinationChainName, assetDenom, amount] = [
                "osmosis",
                "polygon",
                "uausdc",
                100000000,
            ];
            expect(api.getTransferFee(sourceChainName, destinationChainName, assetDenom, amount)).rejects.toThrow("Invalid chain identifier for osmosis. Did you mean osmosis-7");
        }));
    });
    describe("getGasPrice", () => {
        test("It should get a gas price", () => __awaiter(void 0, void 0, void 0, function* () {
            const [sourceChainName, destinationChainName, sourceChainTokenSymbol] = [
                EvmChain_1.EvmChain.AVALANCHE,
                EvmChain_1.EvmChain.FANTOM,
                GasToken_1.GasToken.AVAX,
            ];
            const response = yield api.getGasInfo(sourceChainName, destinationChainName, sourceChainTokenSymbol);
            expect(response.source_token).toBeDefined();
            expect(response.destination_native_token).toBeDefined();
        }));
    });
    describe("estimateL1GasFee", () => {
        const mainnetApi = new AxelarQueryAPI_1.AxelarQueryAPI({ environment: types_1.Environment.MAINNET });
        test("it should return 0 if the destination chain is not a L2 chain", () => __awaiter(void 0, void 0, void 0, function* () {
            const gasAmount = yield mainnetApi.estimateL1GasFee(EvmChain_1.EvmChain.AVALANCHE, {
                executeData: "0x",
                destChain: EvmChain_1.EvmChain.AVALANCHE,
                l1GasPrice: {
                    decimals: 18,
                    value: "32534506865",
                },
            });
            expect(gasAmount.toString()).toEqual("0");
        }));
        test("it should return the logical L1 gas fee for a destination L2 chain", () => __awaiter(void 0, void 0, void 0, function* () {
            const gasAmount = yield mainnetApi.estimateL1GasFee(EvmChain_1.EvmChain.OPTIMISM, {
                executeData: MOCK_EXECUTE_DATA,
                destChain: EvmChain_1.EvmChain.OPTIMISM,
                l1GasPrice: {
                    decimals: 18,
                    value: "32534506865",
                },
                l2Type: "op",
            });
            expect(gasAmount.lt((0, utils_1.parseEther)("0.005"))).toBeTruthy();
        }));
    });
    describe("estimateMultihopFee", () => {
        let amplifierApi;
        let mockAxelarscanApiPost;
        let mockThrowIfInvalidChainIds;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            amplifierApi = new AxelarQueryAPI_1.AxelarQueryAPI({
                environment: types_1.Environment.DEVNET,
            });
            // Use vi instead of jest
            mockAxelarscanApiPost = vi
                .spyOn(amplifierApi["axelarscanApi"], "post")
                .mockResolvedValue({ test: "response" });
            mockThrowIfInvalidChainIds = vi
                .spyOn(yield Promise.resolve().then(() => __importStar(require("../../utils/validateChain"))), "throwIfInvalidChainIds")
                .mockResolvedValueOnce(undefined);
        }));
        afterEach(() => {
            vi.resetAllMocks();
        });
        test("should call API with correct path and parameters", () => __awaiter(void 0, void 0, void 0, function* () {
            const hops = [
                {
                    destinationChain: "avalanche-fuji",
                    sourceChain: "axelarnet",
                    gasLimit: "700000",
                },
            ];
            yield amplifierApi.estimateMultihopFee(hops);
            expect(mockAxelarscanApiPost).toHaveBeenCalledWith("/gmp/estimateGasFeeForNHops", {
                params: hops,
                showDetailedFees: false,
            });
        }));
        test("should validate chains before making API call", () => __awaiter(void 0, void 0, void 0, function* () {
            const hops = [
                {
                    destinationChain: "avalanche-fuji",
                    sourceChain: "axelarnet",
                    gasLimit: "700000",
                },
            ];
            yield amplifierApi.estimateMultihopFee(hops);
            expect(mockThrowIfInvalidChainIds).toHaveBeenCalledWith(["avalanche-fuji", "axelarnet"], types_1.Environment.DEVNET);
        }));
        test("should deduplicate chains for validation", () => __awaiter(void 0, void 0, void 0, function* () {
            const hops = [
                {
                    destinationChain: "avalanche-fuji",
                    sourceChain: "axelarnet",
                    gasLimit: "700000",
                },
                {
                    destinationChain: "avalanche-fuji",
                    sourceChain: "axelarnet",
                    gasLimit: "700000",
                },
            ];
            yield amplifierApi.estimateMultihopFee(hops);
            expect(mockThrowIfInvalidChainIds).toHaveBeenCalledWith(["avalanche-fuji", "axelarnet"], types_1.Environment.DEVNET);
        }));
        test("should throw error for empty hops array", () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(amplifierApi.estimateMultihopFee([])).rejects.toThrow("At least one hop parameter must be provided");
            expect(mockThrowIfInvalidChainIds).not.toHaveBeenCalled();
            expect(mockAxelarscanApiPost).not.toHaveBeenCalled();
        }));
        test("should pass showDetailedFees option to API", () => __awaiter(void 0, void 0, void 0, function* () {
            const hops = [
                {
                    destinationChain: "avalanche-fuji",
                    sourceChain: "axelarnet",
                    gasLimit: "700000",
                },
            ];
            yield amplifierApi.estimateMultihopFee(hops, { showDetailedFees: true });
            expect(mockAxelarscanApiPost).toHaveBeenCalledWith("/gmp/estimateGasFeeForNHops", {
                params: hops,
                showDetailedFees: true,
            });
        }));
        test("should retain original input array order", () => __awaiter(void 0, void 0, void 0, function* () {
            const hops = [
                {
                    destinationChain: "avalanche-fuji",
                    sourceChain: "axelarnet",
                    gasLimit: "700000",
                },
                {
                    destinationChain: "sui-test2",
                    sourceChain: "polygon-mumbai",
                    gasLimit: "800000",
                },
            ];
            const originalHops = [...hops];
            yield amplifierApi.estimateMultihopFee(hops);
            expect(hops).toEqual(originalHops);
            expect(mockAxelarscanApiPost).toHaveBeenCalledWith("/gmp/estimateGasFeeForNHops", {
                params: originalHops,
                showDetailedFees: false,
            });
        }));
        test("should chain validation fail before API call", () => __awaiter(void 0, void 0, void 0, function* () {
            mockThrowIfInvalidChainIds.mockReset();
            mockThrowIfInvalidChainIds.mockRejectedValueOnce("Invalid chain");
            const hops = [
                {
                    destinationChain: "invalid-chain",
                    sourceChain: "axelarnet",
                    gasLimit: "700000",
                },
            ];
            yield expect(amplifierApi.estimateMultihopFee(hops)).rejects.toThrow("Invalid chain");
            expect(mockAxelarscanApiPost).not.toHaveBeenCalled();
        }));
        test("should return API response directly if showDetailedFees is undefined", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = { test: "response" };
            mockAxelarscanApiPost.mockResolvedValueOnce(mockResponse);
            const hops = [
                {
                    destinationChain: "avalanche-fuji",
                    sourceChain: "axelarnet",
                    gasLimit: "700000",
                },
            ];
            const response = yield amplifierApi.estimateMultihopFee(hops);
            expect(response).toBe(mockResponse);
        }));
        test("should map the response to HopFeeDetails if showDetailedFees is true", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                isExpressSupported: false,
                baseFee: "1",
                expressFee: "2",
                executionFee: "3",
                executionFeeWithMultiplier: "1",
                totalFee: "3",
                details: [
                    {
                        isExpressSupported: false,
                        baseFee: "1",
                        expressFee: "2",
                        executionFee: "3",
                        executionFeeWithMultiplier: "1",
                        totalFee: "3",
                        gasLimit: "700000",
                        gasLimitWithL1Fee: "700000",
                        gasMultiplier: 1,
                        minGasPrice: "1",
                    },
                ],
            };
            mockAxelarscanApiPost.mockResolvedValueOnce(mockResponse);
            const hops = [
                {
                    destinationChain: "avalanche-fuji",
                    sourceChain: "axelarnet",
                    gasLimit: "700000",
                },
            ];
            const response = yield amplifierApi.estimateMultihopFee(hops, { showDetailedFees: true });
            expect(response).toEqual({
                isExpressSupported: false,
                baseFee: "1",
                expressFee: "2",
                executionFee: "3",
                executionFeeWithMultiplier: "1",
                totalFee: "3",
                details: [
                    {
                        isExpressSupported: false,
                        baseFee: "1",
                        expressFee: "2",
                        executionFee: "3",
                        executionFeeWithMultiplier: "1",
                        totalFee: "3",
                        gasLimit: "700000",
                        gasLimitWithL1Fee: "700000",
                        gasMultiplier: 1,
                        minGasPrice: "1",
                    },
                ],
            });
        }));
    });
    describe("estimateGasFee", () => {
        test("It should return estimated gas amount that makes sense for USDC", () => __awaiter(void 0, void 0, void 0, function* () {
            const gasAmount = yield api.estimateGasFee(EvmChain_1.EvmChain.AVALANCHE, "ethereum-sepolia", 700000, 1.1, GasToken_1.GasToken.USDC, "500000", undefined);
            // gasAmount should be less than 10k usd, otherwise we handle decimal conversion incorrectly.
            expect(ethers_1.ethers.utils.parseEther("10000").gt(gasAmount)).toBeTruthy();
        }));
        test("It should include L1 fee for L2 destination chain", () => __awaiter(void 0, void 0, void 0, function* () {
            // Testnet
            const l2Chains = ["fraxtal", "base-sepolia", "optimism-sepolia", "mantle-sepolia"];
            const queries = [];
            for (const l2Chain of l2Chains) {
                const estimateGasFeeQuery = api.estimateGasFee("ethereum-sepolia", l2Chain, 500000, undefined, undefined, undefined, "0x");
                queries.push(estimateGasFeeQuery);
            }
            const responses = yield Promise.all(queries);
            for (const response of responses) {
                expect(response).toBeDefined();
            }
            // Mainnet
            const mainnetL2Chains = ["optimism", "base", "mantle", "scroll", "fraxtal", "blast"];
            const mainnetApi = new AxelarQueryAPI_1.AxelarQueryAPI({ environment: types_1.Environment.MAINNET });
            const mainnetQueries = [];
            for (const mainnetL2Chain of mainnetL2Chains) {
                const query = yield mainnetApi.estimateGasFee(EvmChain_1.EvmChain.ETHEREUM, mainnetL2Chain, 500000, undefined, undefined, undefined, "0x");
                mainnetQueries.push(query);
            }
            const mainnetResponses = yield Promise.all(mainnetQueries);
            mainnetResponses.forEach((response) => {
                expect(response).toBeDefined();
            });
        }));
        test("It should work for scroll since it uses different gas oracle contract address", () => __awaiter(void 0, void 0, void 0, function* () {
            const mainnetApi = new AxelarQueryAPI_1.AxelarQueryAPI({ environment: types_1.Environment.MAINNET });
            const gasAmount = yield mainnetApi.estimateGasFee(EvmChain_1.EvmChain.ETHEREUM, EvmChain_1.EvmChain.SCROLL, 529994, 1, undefined, undefined, MOCK_EXECUTE_DATA);
            expect(gasAmount).toBeDefined();
        }));
        test("it should be able to return the gas fee when the destination chain is L2, but the executeData is undefined ", () => __awaiter(void 0, void 0, void 0, function* () {
            const l2Chains = ["fraxtal", "blast-sepolia", "mantle-sepolia"];
            const queries = [];
            for (const l2Chain of l2Chains) {
                const estimateGasFeeQuery = api.estimateGasFee("ethereum-sepolia", l2Chain, 500000, undefined, undefined, undefined);
                queries.push(estimateGasFeeQuery);
            }
            const responses = yield Promise.all(queries);
            for (const response of responses) {
                expect(response).toBeDefined();
            }
        }));
        test("It should include L1 fee for L2 destination chain for cosmos source chains", () => __awaiter(void 0, void 0, void 0, function* () {
            // Mainnet
            const mainnetL2Chains = ["optimism"];
            const mainnetApi = new AxelarQueryAPI_1.AxelarQueryAPI({ environment: types_1.Environment.MAINNET });
            const mainnetQueries = [];
            for (const mainnetL2Chain of mainnetL2Chains) {
                const query = yield mainnetApi.estimateGasFee("osmosis", mainnetL2Chain, 500000, "auto", undefined, undefined, undefined);
                mainnetQueries.push(query);
            }
            const mainnetResponses = yield Promise.all(mainnetQueries);
            mainnetResponses.forEach((response) => {
                expect(response).toBeDefined();
                expect(String(response).length).toBeLessThanOrEqual(7);
            });
        }));
        test("It should return estimated gas amount that makes sense for native token", () => __awaiter(void 0, void 0, void 0, function* () {
            const gasAmount = yield api.estimateGasFee(chains_1.CHAINS.TESTNET.AVALANCHE, chains_1.CHAINS.TESTNET.SEPOLIA, 700000, 1.1, undefined, "5000000000");
            // gasAmount should be greater than 0.0000001, otherwise we handle decimal conversion incorrectly.
            expect(ethers_1.ethers.utils.parseEther("0.0000001").lt(gasAmount)).toBeTruthy();
        }));
        test("It should return estimated gas amount for an Amplifier chain", () => __awaiter(void 0, void 0, void 0, function* () {
            const gasAmount = yield api.estimateGasFee(chains_1.CHAINS.TESTNET.AVALANCHE, "flow", 700000, 1.1, undefined, "5000000000");
            // gasAmount should be greater than 0.0000001, otherwise we handle decimal conversion incorrectly.
            expect(ethers_1.ethers.utils.parseEther("0.0000001").lt(gasAmount)).toBeTruthy();
        }));
        // TODO: fix this test. Potential rounding issue
        test.skip("It should use `minGasPrice` if it is greater than the destination chain's gas_price returned from the api", () => __awaiter(void 0, void 0, void 0, function* () {
            const feeStub = (0, stubs_1.getFeeStub)();
            vitest.spyOn(api.axelarGMPServiceApi, "post").mockResolvedValueOnce(feeStub);
            const minGasPrice = ethers_1.ethers.utils.parseUnits("200", "gwei");
            const gasLimit = ethers_1.ethers.BigNumber.from(700000);
            const baseFee = ethers_1.ethers.utils.parseEther(feeStub.result.base_fee.toString());
            const gasAmount = yield api.estimateGasFee(chains_1.CHAINS.TESTNET.AVALANCHE, chains_1.CHAINS.TESTNET.SEPOLIA, gasLimit.toNumber(), 1.1, undefined, minGasPrice.toString());
            const destGasFeeWei = (0, utils_1.parseUnits)((gasLimit.toNumber() * Number(feeStub.result.destination_native_token.gas_price)).toString(), feeStub.result.destination_native_token.decimals);
            const srcGasFeeWei = (0, utils_1.parseUnits)((gasLimit.toNumber() * Number(feeStub.result.source_token.gas_price)).toString(), feeStub.result.source_token.decimals);
            const expectedGasAmount = ethers_1.BigNumber.from(gasLimit)
                .mul(minGasPrice)
                .mul(srcGasFeeWei)
                .div(destGasFeeWei)
                .mul(1.1 * 10000)
                .div(10000)
                .add(baseFee)
                .toString();
            expect(gasAmount).toEqual(expectedGasAmount);
        }));
        // TODO: fix this test. Potential rounding issue
        test.skip("It should not use `minGasPrice` if it is lesser than the destination chain's gas_price returned from the api", () => __awaiter(void 0, void 0, void 0, function* () {
            const feeStub = (0, stubs_1.getFeeStub)();
            vitest.spyOn(api.axelarGMPServiceApi, "post").mockResolvedValueOnce(feeStub);
            const minGasPrice = ethers_1.ethers.utils.parseUnits("1", "gwei");
            const gasLimit = ethers_1.ethers.BigNumber.from(700000);
            const srcGasPrice = ethers_1.ethers.utils.parseEther(feeStub.result.source_token.gas_price);
            const baseFee = ethers_1.ethers.utils.parseEther(feeStub.result.base_fee.toString());
            const gasAmount = yield api.estimateGasFee(chains_1.CHAINS.TESTNET.AVALANCHE, chains_1.CHAINS.TESTNET.SEPOLIA, gasLimit.toNumber(), 1.1, undefined, minGasPrice.toString());
            const expectedGasAmount = srcGasPrice
                .mul(gasLimit)
                .mul(ethers_1.ethers.BigNumber.from(1.1 * 10000))
                .div(10000)
                .add(baseFee)
                .toString();
            expect(gasAmount).toEqual(expectedGasAmount);
        }));
    });
    describe("getNativeGasBaseFee", () => {
        test("It should return base fee for a certain source chain / destination chain combination", () => __awaiter(void 0, void 0, void 0, function* () {
            vitest.spyOn(api, "getActiveChains").mockResolvedValueOnce((0, stubs_1.activeChainsStub)());
            const gasResult = yield api.getNativeGasBaseFee(chains_1.CHAINS.TESTNET.AVALANCHE, chains_1.CHAINS.TESTNET.SEPOLIA);
            expect(gasResult.success).toBeTruthy();
            expect(gasResult.baseFee).toBeDefined();
            expect(gasResult.error).toBeUndefined();
        }));
    });
    describe("getDenomFromSymbol", () => {
        test("It should get the denom for an asset given its symbol on a chain", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield api.getDenomFromSymbol("aUSDC", "axelar");
            expect(response).toEqual("uausdc");
        }));
    });
    describe("getSymbolFromDenom", () => {
        test("It should get the symbol for an asset on a given chain given its denom", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield api.getSymbolFromDenom("uaxl", "axelar");
            expect(response).toEqual("AXL");
        }));
    });
    describe("getAssetConfigFromDenom", () => {
        test("It should get asset config for an asset on a given chain given its denom", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield api.getAssetConfigFromDenom("uaxl", "axelar");
            expect(response).toEqual({
                assetSymbol: "AXL",
                assetName: "AXL",
                minDepositAmt: 0.05,
                ibcDenom: "uaxl",
                fullDenomPath: "uaxl",
                tokenAddress: "uaxl",
                decimals: 6,
                common_key: "uaxl",
                mintLimit: 0,
            });
        }));
    });
    describe("getActiveChains", () => {
        test("It should get a list of active chains", () => __awaiter(void 0, void 0, void 0, function* () {
            const activeChains = yield api.getActiveChains();
            expect(activeChains.length).toBeGreaterThan(0);
        }));
    });
    describe("getConfirmationHeight", () => {
        test("confirmation height should be defined", () => __awaiter(void 0, void 0, void 0, function* () {
            const height = yield api.getConfirmationHeight("polygon");
            expect(height).toBeDefined();
        }));
    });
    describe("throwIfInactiveChain", () => {
        test("It should throw if the chain does not get included in a active-chains list", () => __awaiter(void 0, void 0, void 0, function* () {
            vitest.spyOn(api, "getActiveChains").mockResolvedValue(["avalanche", "polygon"]);
            yield expect(api.throwIfInactiveChains(["ethereum"])).rejects.toThrowError("Chain ethereum is not active");
        }));
        test("It should throw if the chain does not get included in a active-chains list", () => __awaiter(void 0, void 0, void 0, function* () {
            vitest.spyOn(api, "getActiveChains").mockResolvedValue(["avalanche", "polygon"]);
            yield expect(api.throwIfInactiveChains(["avalanche"])).resolves.toBeUndefined();
        }));
    });
    describe("getContractAddressFromConfig", () => {
        let api;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            api = new AxelarQueryAPI_1.AxelarQueryAPI({
                environment: types_1.Environment.TESTNET,
                axelarRpcUrl: "https://axelar-testnet-lcd.qubelabs.io",
            });
        }));
        test("it should retrieve the gas receiver address remotely", () => __awaiter(void 0, void 0, void 0, function* () {
            yield api.getContractAddressFromConfig(EvmChain_1.EvmChain.MOONBEAM, "gas_service").then((res) => {
                expect(res).toBeDefined();
            });
        }));
    });
    describe("getTransferLimit", () => {
        let api;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            api = new AxelarQueryAPI_1.AxelarQueryAPI({
                environment: types_1.Environment.TESTNET,
                axelarRpcUrl: "https://axelar-testnet-rpc.qubelabs.io:443",
            });
            vitest.clearAllMocks();
            /**
             * in this mock below, we are setting:
             * ethereum:
             *  limit: 1000aUSDC
             *  incoming: 20aUSDC
             *  outgoing: 15aUSDC
             * sei:
             *  limit: 500aUSDC
             *  incoming: 5aUSDC
             *  outgoing: 10aUSDC
             */
            vitest
                .spyOn(api, "getTransferLimitNexusQuery")
                .mockImplementation(({ chainId }) => {
                const res = {
                    limit: "0",
                    outgoing: "0",
                    incoming: "0",
                };
                if (chainId === "ethereum-2") {
                    res.limit = "1000000000";
                    res.incoming = "20000000";
                    res.outgoing = "15000000";
                }
                if (chainId === "sei") {
                    res.limit = "500000000";
                    res.incoming = "5000000";
                    res.outgoing = "10000000";
                }
                return Promise.resolve(res);
            });
        }));
        test("it should return the transfer limit of an asset as a string for evm chains", () => __awaiter(void 0, void 0, void 0, function* () {
            const fromChainId = "ethereum-2";
            const toChainId = "sei";
            const denom = "uausdc";
            const res = yield api
                .getTransferLimit({ fromChainId, toChainId, denom })
                .catch(() => "0");
            const expectedRes = 500000000 * 0.25;
            /**
             if we are sending from ethereum to sei, we expect res to be
             Math.min( ethereumLimit, seiLimit ) * 0.25 (0.25 represents default proportion of total limit)
             = Math.min( ethereumLimit, seiLimit ) * 0.25 (0.25 represents default proportion of total limit)
             = Math.min ( 1000aUSDC, 500aUSDC) * 0.25 (0.25 represents default proportion of total limit)
             = 125
             *
             *
             */
            expect(res).toBeDefined();
            expect(Number(res) - expectedRes).toEqual(0);
        }));
    });
});
//# sourceMappingURL=AxelarQueryAPI.spec.js.map