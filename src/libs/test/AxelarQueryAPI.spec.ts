import {
  FeeInfoResponse,
  TransferFeeResponse,
} from "@axelar-network/axelarjs-types/axelar/nexus/v1beta1/query";
import { ethers } from "ethers";
import { CHAINS } from "../../chains";
import { AxelarQueryAPI } from "../AxelarQueryAPI";
import { Environment, EvmChain, GasToken } from "../types";
import { activeChainsStub } from "./stubs";

describe("AxelarQueryAPI", () => {
  const api = new AxelarQueryAPI({ environment: Environment.TESTNET });

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
      ).rejects.toThrow("Invalid chain identifier for osmosis. Did you mean osmosis-5");
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

  describe("estimateGasFee", () => {
    test.skip("It should return estimated gas amount that makes sense for USDC", async () => {
      const gasAmount = await api.estimateGasFee(
        EvmChain.AVALANCHE,
        EvmChain.ETHEREUM,
        GasToken.USDC,
        700000,
        1.1,
        "500000"
      );

      // gasAmount should be less than 10k usd, otherwise we handle decimal conversion incorrectly.
      expect(ethers.utils.parseUnits("10000", 6).gt(gasAmount)).toBeTruthy();
    });

    test("It should return estimated gas amount that makes sense for native token", async () => {
      const gasAmount = await api.estimateGasFee(
        CHAINS.TESTNET.AVALANCHE as EvmChain,
        CHAINS.TESTNET.ETHEREUM as EvmChain,
        GasToken.AVAX,
        700000,
        1.1,
        "5000000000"
      );

      // gasAmount should be greater than 0.0000001, otherwise we handle decimal conversion incorrectly.
      expect(ethers.utils.parseEther("0.0000001").lt(gasAmount)).toBeTruthy();
    });
  });

  describe("getNativeGasBaseFee", () => {
    test("It should return base fee for a certain source chain / destination chain combination", async () => {
      vitest.spyOn(api, "getActiveChains").mockResolvedValueOnce(activeChainsStub());
      const gasResult = await api.getNativeGasBaseFee(
        CHAINS.TESTNET.AVALANCHE as EvmChain,
        CHAINS.TESTNET.ETHEREUM as EvmChain
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
      api = new AxelarQueryAPI({ environment: Environment.TESTNET });
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
      api = new AxelarQueryAPI({ environment: Environment.TESTNET });
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
