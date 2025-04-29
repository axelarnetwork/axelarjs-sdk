import {
  FeeInfoResponse,
  TransferFeeResponse,
} from "@axelar-network/axelarjs-types/axelar/nexus/v1beta1/query";
import { BigNumber, BigNumberish, ethers } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { CHAINS } from "../../chains";
import { AxelarQueryAPI, DetailedFeeResponse } from "../AxelarQueryAPI";
import { Environment } from "../types";
import { EvmChain } from "../../constants/EvmChain";
import { GasToken } from "../../constants/GasToken";
import { activeChainsStub, getFeeStub } from "./stubs";
import { SpyInstance } from "vitest";

const MOCK_EXECUTE_DATA =
  "0x1a98b2e0e68ba0eb84262d4bcf91955ec2680b37bcedd59a1f48e18d183dac9961bf9d1400000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000d40000000000000000000000000000000000000000000000000000000000deac2c6000000000000000000000000000000000000000000000000000000000000000762696e616e636500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a307863653136463639333735353230616230313337376365374238386635424138433438463844363636000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bc000000000000000000000000000000000000000000000000000000000000000400000000000000000000000004607cad6135d7a119185ebe062d3b369b1b536ef000000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000003600000000000000000000000000000000000000000000000000000000000000580000000000000000000000000000000000000000000000000000000000000070000000000000000000000000000000000000000000000000000000000000009200000000000000000000000000000000000000000000000000000000000000a8000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000eb466342c4d449bc9f53a865d5cb90586f4052150000000000000000000000000000000000000000000000000000000000000001000000000000000000000000eb466342c4d449bc9f53a865d5cb90586f405215000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000044095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000eb466342c4d449bc9f53a865d5cb90586f4052150000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000eb466342c4d449bc9f53a865d5cb90586f405215000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc800000000000000000000000000000000000000000000000000000000000000640000000000000000000000004fd39c9e151e50580779bd04b1f7ecc310079fd3000000000000000000000000000000000000000000000000000000000deac2c6000000000000000000000000000000000000000000000000000000000dc647500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000eb466342c4d449bc9f53a865d5cb90586f40521500000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000001000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000044095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc80000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc800000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab100000000000000000000000000000000000000000000000000000000000000640000000000000000000000004fd39c9e151e50580779bd04b1f7ecc310079fd3000000000000000000000000000000000000000000000000000000000de83dbf000000000000000000000000000000000000000000000000015d8c7908dbe7130000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc80000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000100000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000242e1a7d4d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000004607cad6135d7a119185ebe062d3b369b1b536ef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000761786c5553444300000000000000000000000000000000000000000000000000";

describe("AxelarQueryAPI", () => {
  const api = new AxelarQueryAPI({
    environment: Environment.TESTNET,
    axelarRpcUrl: "https://axelar-testnet-rpc.qubelabs.io:443",
  });

  beforeEach(() => {
    vitest.clearAllMocks();
  });

  describe("getFeeForChainAndAsset", () => {
    test("It should generate a fee response", async () => {
      const [chain, assetDenom] = ["avalanche", "uausdc"];
      const response: FeeInfoResponse = await api.getFeeForChainAndAsset(chain, assetDenom);

      expect(response.feeInfo).toBeDefined();
      expect(response.feeInfo?.chain).toEqual(chain);
      expect(response.feeInfo?.asset).toEqual(assetDenom);
      expect(response.feeInfo?.feeRate).toBeDefined();
      expect(response.feeInfo?.minFee).toBeDefined();
      expect(response.feeInfo?.maxFee).toBeDefined();
    });
  });

  describe("getTransferFee", () => {
    test("It should generate a transfer fee for a specific transaction", async () => {
      const [sourceChainName, destinationChainName, assetDenom, amount] = [
        "avalanche",
        "polygon",
        "uausdc",
        100000000,
      ];
      const response: TransferFeeResponse = await api.getTransferFee(
        sourceChainName,
        destinationChainName,
        assetDenom,
        amount
      );

      expect(response).toBeDefined();
      expect(response.fee).toBeDefined();
      expect(response.fee?.denom).toEqual(assetDenom);
      expect(response.fee?.amount).toBeDefined();
    });

    test("it should suggest a chain id when passing chain name", async () => {
      const [sourceChainName, destinationChainName, assetDenom, amount] = [
        "osmosis",
        "polygon",
        "uausdc",
        100000000,
      ];
      expect(
        api.getTransferFee(sourceChainName, destinationChainName, assetDenom, amount)
      ).rejects.toThrow("Invalid chain identifier for osmosis. Did you mean osmosis-7");
    });
  });

  describe("getGasPrice", () => {
    test("It should get a gas price", async () => {
      const [sourceChainName, destinationChainName, sourceChainTokenSymbol] = [
        EvmChain.AVALANCHE,
        EvmChain.FANTOM,
        GasToken.AVAX,
      ];
      const response = await api.getGasInfo(
        sourceChainName,
        destinationChainName,
        sourceChainTokenSymbol
      );
      expect(response.source_token).toBeDefined();
      expect(response.destination_native_token).toBeDefined();
    });
  });

  describe("estimateL1GasFee", () => {
    const mainnetApi = new AxelarQueryAPI({ environment: Environment.MAINNET });

    test("it should return 0 if the destination chain is not a L2 chain", async () => {
      const gasAmount = await mainnetApi.estimateL1GasFee(EvmChain.AVALANCHE, {
        executeData: "0x",
        destChain: EvmChain.AVALANCHE,
        l1GasPrice: {
          decimals: 18,
          value: "32534506865",
        },
      });
      expect(gasAmount.toString()).toEqual("0");
    });

    test("it should return the logical L1 gas fee for a destination L2 chain", async () => {
      const gasAmount = await mainnetApi.estimateL1GasFee(EvmChain.OPTIMISM, {
        executeData: MOCK_EXECUTE_DATA,
        destChain: EvmChain.OPTIMISM,
        l1GasPrice: {
          decimals: 18,
          value: "32534506865",
        },
        l2Type: "op",
      });
      expect(gasAmount.lt(parseEther("0.005"))).toBeTruthy();
    });
  });

  describe("estimateMultihopFee", () => {
    let amplifierApi: AxelarQueryAPI;
    let mockAxelarscanApiPost: SpyInstance;
    let mockThrowIfInvalidChainIds: SpyInstance;

    beforeEach(async () => {
      amplifierApi = new AxelarQueryAPI({
        environment: Environment.DEVNET,
      });
      // Use vi instead of jest
      mockAxelarscanApiPost = vi
        .spyOn(amplifierApi["axelarscanApi"], "post")
        .mockResolvedValue({ test: "response" });
      mockThrowIfInvalidChainIds = vi
        .spyOn(await import("../../utils/validateChain"), "throwIfInvalidChainIds")
        .mockResolvedValueOnce(undefined);
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    test("should call API with correct path and parameters", async () => {
      const hops = [
        {
          destinationChain: "avalanche-fuji",
          sourceChain: "axelarnet",
          gasLimit: "700000",
        },
      ];

      await amplifierApi.estimateMultihopFee(hops);

      expect(mockAxelarscanApiPost).toHaveBeenCalledWith("/gmp/estimateGasFeeForNHops", {
        params: hops,
        showDetailedFees: false,
      });
    });

    test("should validate chains before making API call", async () => {
      const hops = [
        {
          destinationChain: "avalanche-fuji",
          sourceChain: "axelarnet",
          gasLimit: "700000",
        },
      ];

      await amplifierApi.estimateMultihopFee(hops);

      expect(mockThrowIfInvalidChainIds).toHaveBeenCalledWith(
        ["avalanche-fuji", "axelarnet"],
        Environment.DEVNET
      );
    });

    test("should deduplicate chains for validation", async () => {
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

      await amplifierApi.estimateMultihopFee(hops);

      expect(mockThrowIfInvalidChainIds).toHaveBeenCalledWith(
        ["avalanche-fuji", "axelarnet"],
        Environment.DEVNET
      );
    });

    test("should throw error for empty hops array", async () => {
      await expect(amplifierApi.estimateMultihopFee([])).rejects.toThrow(
        "At least one hop parameter must be provided"
      );

      expect(mockThrowIfInvalidChainIds).not.toHaveBeenCalled();
      expect(mockAxelarscanApiPost).not.toHaveBeenCalled();
    });

    test("should pass showDetailedFees option to API", async () => {
      const hops = [
        {
          destinationChain: "avalanche-fuji",
          sourceChain: "axelarnet",
          gasLimit: "700000",
        },
      ];

      await amplifierApi.estimateMultihopFee(hops, { showDetailedFees: true });

      expect(mockAxelarscanApiPost).toHaveBeenCalledWith("/gmp/estimateGasFeeForNHops", {
        params: hops,
        showDetailedFees: true,
      });
    });

    test("should retain original input array order", async () => {
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

      await amplifierApi.estimateMultihopFee(hops);

      expect(hops).toEqual(originalHops);
      expect(mockAxelarscanApiPost).toHaveBeenCalledWith("/gmp/estimateGasFeeForNHops", {
        params: originalHops,
        showDetailedFees: false,
      });
    });

    test("should chain validation fail before API call", async () => {
      mockThrowIfInvalidChainIds.mockReset();
      mockThrowIfInvalidChainIds.mockRejectedValueOnce("Invalid chain");

      const hops = [
        {
          destinationChain: "invalid-chain",
          sourceChain: "axelarnet",
          gasLimit: "700000",
        },
      ];

      await expect(amplifierApi.estimateMultihopFee(hops)).rejects.toThrow("Invalid chain");

      expect(mockAxelarscanApiPost).not.toHaveBeenCalled();
    });

    test("should return API response directly if showDetailedFees is undefined", async () => {
      const mockResponse = { test: "response" };
      mockAxelarscanApiPost.mockResolvedValueOnce(mockResponse);

      const hops = [
        {
          destinationChain: "avalanche-fuji",
          sourceChain: "axelarnet",
          gasLimit: "700000",
        },
      ];

      const response = await amplifierApi.estimateMultihopFee(hops);

      expect(response).toBe(mockResponse);
    });

    test("should map the response to HopFeeDetails if showDetailedFees is true", async () => {
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

      const response = await amplifierApi.estimateMultihopFee(hops, { showDetailedFees: true });

      expect(response).toEqual<DetailedFeeResponse>({
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
    });
  });

  describe("estimateGasFee", () => {
    test("It should return estimated gas amount that makes sense for USDC", async () => {
      const gasAmount = await api.estimateGasFee(
        EvmChain.AVALANCHE,
        "ethereum-sepolia",
        700000,
        1.1,
        GasToken.USDC,
        "500000",
        undefined
      );

      // gasAmount should be less than 10k usd, otherwise we handle decimal conversion incorrectly.
      expect(ethers.utils.parseEther("10000").gt(gasAmount as BigNumberish)).toBeTruthy();
    });

    test("It should include L1 fee for L2 destination chain", async () => {
      // Testnet
      const l2Chains = ["fraxtal", "base-sepolia", "optimism-sepolia", "mantle-sepolia"];

      const queries = [];
      for (const l2Chain of l2Chains) {
        const estimateGasFeeQuery = api.estimateGasFee(
          "ethereum-sepolia",
          l2Chain,
          500000,
          undefined,
          undefined,
          undefined,
          "0x"
        );

        queries.push(estimateGasFeeQuery);
      }
      const responses = await Promise.all(queries);

      for (const response of responses) {
        expect(response).toBeDefined();
      }

      // Mainnet
      const mainnetL2Chains = ["optimism", "base", "mantle", "scroll", "fraxtal", "blast"];
      const mainnetApi = new AxelarQueryAPI({ environment: Environment.MAINNET });
      const mainnetQueries = [];
      for (const mainnetL2Chain of mainnetL2Chains) {
        const query = await mainnetApi.estimateGasFee(
          EvmChain.ETHEREUM,
          mainnetL2Chain as EvmChain,
          500000,
          undefined,
          undefined,
          undefined,
          "0x"
        );
        mainnetQueries.push(query);
      }

      const mainnetResponses = await Promise.all(mainnetQueries);

      mainnetResponses.forEach((response) => {
        expect(response).toBeDefined();
      });
    });

    test("It should work for scroll since it uses different gas oracle contract address", async () => {
      const mainnetApi = new AxelarQueryAPI({ environment: Environment.MAINNET });
      const gasAmount = await mainnetApi.estimateGasFee(
        EvmChain.ETHEREUM,
        EvmChain.SCROLL,
        529994,
        1,
        undefined,
        undefined,
        MOCK_EXECUTE_DATA
      );

      expect(gasAmount).toBeDefined();
    });

    test("it should be able to return the gas fee when the destination chain is L2, but the executeData is undefined ", async () => {
      const l2Chains = ["fraxtal", "blast-sepolia", "mantle-sepolia"];

      const queries = [];
      for (const l2Chain of l2Chains) {
        const estimateGasFeeQuery = api.estimateGasFee(
          "ethereum-sepolia",
          l2Chain,
          500000,
          undefined,
          undefined,
          undefined
        );

        queries.push(estimateGasFeeQuery);
      }
      const responses = await Promise.all(queries);

      for (const response of responses) {
        expect(response).toBeDefined();
      }
    });

    test("It should include L1 fee for L2 destination chain for cosmos source chains", async () => {
      // Mainnet
      const mainnetL2Chains = ["optimism"];
      const mainnetApi = new AxelarQueryAPI({ environment: Environment.MAINNET });
      const mainnetQueries = [];
      for (const mainnetL2Chain of mainnetL2Chains) {
        const query = await mainnetApi.estimateGasFee(
          "osmosis",
          mainnetL2Chain as EvmChain,
          500000,
          "auto",
          undefined,
          undefined,
          undefined
        );
        mainnetQueries.push(query);
      }

      const mainnetResponses = await Promise.all(mainnetQueries);

      mainnetResponses.forEach((response) => {
        expect(response).toBeDefined();
        expect(String(response).length).toBeLessThanOrEqual(7);
      });
    });

    test("It should return estimated gas amount that makes sense for native token", async () => {
      const gasAmount = await api.estimateGasFee(
        CHAINS.TESTNET.AVALANCHE as EvmChain,
        CHAINS.TESTNET.SEPOLIA as EvmChain,
        700000,
        1.1,
        undefined,
        "5000000000"
      );

      // gasAmount should be greater than 0.0000001, otherwise we handle decimal conversion incorrectly.
      expect(ethers.utils.parseEther("0.0000001").lt(gasAmount as BigNumberish)).toBeTruthy();
    });
    test("It should return estimated gas amount for an Amplifier chain", async () => {
      const gasAmount = await api.estimateGasFee(
        CHAINS.TESTNET.AVALANCHE as EvmChain,
        "flow",
        700000,
        1.1,
        undefined,
        "5000000000"
      );

      // gasAmount should be greater than 0.0000001, otherwise we handle decimal conversion incorrectly.
      expect(ethers.utils.parseEther("0.0000001").lt(gasAmount as BigNumberish)).toBeTruthy();
    });

    // TODO: fix this test. Potential rounding issue
    test.skip("It should use `minGasPrice` if it is greater than the destination chain's gas_price returned from the api", async () => {
      const feeStub = getFeeStub();
      vitest.spyOn(api.axelarGMPServiceApi, "post").mockResolvedValueOnce(feeStub);

      const minGasPrice = ethers.utils.parseUnits("200", "gwei");
      const gasLimit = ethers.BigNumber.from(700000);
      const baseFee = ethers.utils.parseEther(feeStub.result.base_fee.toString());
      const gasAmount = await api.estimateGasFee(
        CHAINS.TESTNET.AVALANCHE as EvmChain,
        CHAINS.TESTNET.SEPOLIA as EvmChain,
        gasLimit.toNumber(),
        1.1,
        undefined,
        minGasPrice.toString()
      );
      const destGasFeeWei = parseUnits(
        (
          gasLimit.toNumber() * Number(feeStub.result.destination_native_token.gas_price)
        ).toString(),
        feeStub.result.destination_native_token.decimals
      );
      const srcGasFeeWei = parseUnits(
        (gasLimit.toNumber() * Number(feeStub.result.source_token.gas_price)).toString(),
        feeStub.result.source_token.decimals
      );

      const expectedGasAmount = BigNumber.from(gasLimit)
        .mul(minGasPrice)
        .mul(srcGasFeeWei)
        .div(destGasFeeWei)
        .mul(1.1 * 10000)
        .div(10000)
        .add(baseFee)
        .toString();

      expect(gasAmount).toEqual(expectedGasAmount);
    });
    // TODO: fix this test. Potential rounding issue
    test.skip("It should not use `minGasPrice` if it is lesser than the destination chain's gas_price returned from the api", async () => {
      const feeStub = getFeeStub();
      vitest.spyOn(api.axelarGMPServiceApi, "post").mockResolvedValueOnce(feeStub);

      const minGasPrice = ethers.utils.parseUnits("1", "gwei");
      const gasLimit = ethers.BigNumber.from(700000);
      const srcGasPrice = ethers.utils.parseEther(feeStub.result.source_token.gas_price);
      const baseFee = ethers.utils.parseEther(feeStub.result.base_fee.toString());
      const gasAmount = await api.estimateGasFee(
        CHAINS.TESTNET.AVALANCHE as EvmChain,
        CHAINS.TESTNET.SEPOLIA as EvmChain,
        gasLimit.toNumber(),
        1.1,
        undefined,
        minGasPrice.toString()
      );

      const expectedGasAmount = srcGasPrice
        .mul(gasLimit)
        .mul(ethers.BigNumber.from(1.1 * 10000))
        .div(10000)
        .add(baseFee)
        .toString();

      expect(gasAmount).toEqual(expectedGasAmount);
    });
  });

  describe("getNativeGasBaseFee", () => {
    test("It should return base fee for a certain source chain / destination chain combination", async () => {
      vitest.spyOn(api, "getActiveChains").mockResolvedValueOnce(activeChainsStub());
      const gasResult = await api.getNativeGasBaseFee(
        CHAINS.TESTNET.AVALANCHE as EvmChain,
        CHAINS.TESTNET.SEPOLIA as EvmChain
      );
      expect(gasResult.success).toBeTruthy();
      expect(gasResult.baseFee).toBeDefined();
      expect(gasResult.error).toBeUndefined();
    });
  });

  describe("getDenomFromSymbol", () => {
    test("It should get the denom for an asset given its symbol on a chain", async () => {
      const response = await api.getDenomFromSymbol("aUSDC", "axelar");
      expect(response).toEqual("uausdc");
    });
  });

  describe("getSymbolFromDenom", () => {
    test("It should get the symbol for an asset on a given chain given its denom", async () => {
      const response = await api.getSymbolFromDenom("uaxl", "axelar");
      expect(response).toEqual("AXL");
    });
  });

  describe("getAssetConfigFromDenom", () => {
    test("It should get asset config for an asset on a given chain given its denom", async () => {
      const response = await api.getAssetConfigFromDenom("uaxl", "axelar");
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
    });
  });

  describe("getActiveChains", () => {
    test("It should get a list of active chains", async () => {
      const activeChains = await api.getActiveChains();
      expect(activeChains.length).toBeGreaterThan(0);
    });
  });

  describe("getConfirmationHeight", () => {
    test("confirmation height should be defined", async () => {
      const height = await api.getConfirmationHeight("polygon");
      expect(height).toBeDefined();
    });
  });

  describe("throwIfInactiveChain", () => {
    test("It should throw if the chain does not get included in a active-chains list", async () => {
      vitest.spyOn(api, "getActiveChains").mockResolvedValue(["avalanche", "polygon"]);
      await expect(api.throwIfInactiveChains(["ethereum"])).rejects.toThrowError(
        "Chain ethereum is not active"
      );
    });

    test("It should throw if the chain does not get included in a active-chains list", async () => {
      vitest.spyOn(api, "getActiveChains").mockResolvedValue(["avalanche", "polygon"]);
      await expect(api.throwIfInactiveChains(["avalanche"])).resolves.toBeUndefined();
    });
  });

  describe("getContractAddressFromConfig", () => {
    let api: AxelarQueryAPI;

    beforeEach(async () => {
      api = new AxelarQueryAPI({
        environment: Environment.TESTNET,
        axelarRpcUrl: "https://axelar-testnet-lcd.qubelabs.io",
      });
    });

    test("it should retrieve the gas receiver address remotely", async () => {
      await api.getContractAddressFromConfig(EvmChain.MOONBEAM, "gas_service").then((res) => {
        expect(res).toBeDefined();
      });
    });
  });

  describe("getTransferLimit", () => {
    let api: AxelarQueryAPI;

    beforeEach(async () => {
      api = new AxelarQueryAPI({
        environment: Environment.TESTNET,
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
        .mockImplementation(({ chainId }: { chainId: string; denom: string }) => {
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
    });

    test("it should return the transfer limit of an asset as a string for evm chains", async () => {
      const fromChainId = "ethereum-2";
      const toChainId = "sei";
      const denom = "uausdc";
      const res: string = await api
        .getTransferLimit({ fromChainId, toChainId, denom })
        .catch(() => "0");
      const expectedRes = 500_000_000 * 0.25;
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
    });
  });
});
