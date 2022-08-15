import {
  FeeInfoResponse,
  TransferFeeResponse,
} from "@axelar-network/axelarjs-types/axelar/nexus/v1beta1/query";
import { AxelarQueryAPI } from "../AxelarQueryAPI";
import { Environment, EvmChain, GasToken } from "../types";

describe("AxelarQueryAPI", () => {
  const api = new AxelarQueryAPI({ environment: Environment.TESTNET });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getFeeForChainAndAsset", () => {
    test("It should generate a fee response", async () => {
      const [chain, assetDenom] = ["avalanche", "uusd"];
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
        "uusd",
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

    test("It should return estimated gas amount", async () => {
      const gasAmount = await api.estimateGasFee(
        EvmChain.AVALANCHE,
        EvmChain.ETHEREUM,
        GasToken.AVAX
      );
      expect(gasAmount).toBeDefined();
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
      });
    });
  });
});
