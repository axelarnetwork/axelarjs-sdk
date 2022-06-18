import { AxelarQueryAPI } from "../AxelarQueryAPI";
import { Environment, EvmChain, FeeInfoResponse, GasToken, TransferFeeResponse } from "../types";

describe("AxelarQueryAPI", () => {
  const api = new AxelarQueryAPI({ environment: Environment.TESTNET });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getFeeForChainAndAsset", () => {
    test("It should generate a fee response", async () => {
      const [chain, assetDenom] = ["avalanche", "uusd"];
      const response: FeeInfoResponse = await api.getFeeForChainAndAsset(chain, assetDenom);

      expect(response.fee_info).toBeDefined();
      expect(response.fee_info.chain).toEqual(chain);
      expect(response.fee_info.asset).toEqual(assetDenom);
      expect(response.fee_info.fee_rate).toBeDefined();
      expect(response.fee_info.min_fee).toBeDefined();
      expect(response.fee_info.max_fee).toBeDefined();
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
      expect(response.fee.denom).toEqual(assetDenom);
      expect(response.fee.amount).toBeDefined();
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
      const [sourceChainName, destinationChainName, sourceChainTokenSymbol] = [
        EvmChain.AVALANCHE,
        EvmChain.FANTOM,
        GasToken.UST,
      ];
      const gasAmount = await api.estimateGasFee(
        sourceChainName,
        destinationChainName,
        sourceChainTokenSymbol,
        100000
      );
      expect(gasAmount).toBeDefined();
    });
  });

  describe("getDenomFromSymbol", () => {
    test("It should get the denom for an asset given its symbol on a chain", async () => {
      const response = await api.getDenomFromSymbol("UST", "ethereum");
      expect(response).toEqual("uusd");
    });
  });
  describe("getSymbolFromDenom", () => {
    test("It should get the symbol for an asset on a given chain given its denom", async () => {
      const response = await api.getSymbolFromDenom("uusd", "ethereum");
      expect(response).toEqual("UST");
    });
  });
});
