import { Wallet } from "ethers";
import { createWallet, signOtc } from "../../src/utils";
import { TransferAssetBridge } from "../../src/libs";
import { OTC } from "../../src/services/types";
import { AssetTransferObject } from "../../src/chains/types";

describe("E2E - Depost address generation", () => {
  const destinationAddress = "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";
  let axelar: TransferAssetBridge;
  let wallet: Wallet;
  let signature: string;
  let validationMsg: string;

  beforeAll(() => {
    axelar = new TransferAssetBridge("testnet");
  });

  describe("wallet creation", () => {
    beforeAll(() => {
      wallet = createWallet();
    });

    it("should create wallet", () => {
      expect(wallet).toBeDefined();
    });
  });

  describe("getting one time code", () => {
    let response: OTC;
    beforeAll(async () => {
      response = await axelar.getOneTimeCode(wallet.address, "0x");
    });

    it("should get otc", () => {
      expect(response.otc).toBeDefined(); // FIXME: check why otc is "OK"
      expect(response.validationMsg).toBeDefined();
      validationMsg = response.validationMsg;
    });
  });

  describe("signin one time code", () => {
    beforeAll(async () => {
      signature = await signOtc(wallet, validationMsg);
    });
    it("should sign message", () => {
      expect(signature).toBeDefined();
    });
  });

  describe("getting deposit address", () => {
    let response: { roomId: string };

    beforeAll(async () => {
      const transferPayload: AssetTransferObject = {
        signature,
        publicAddr: wallet.address,
        sourceChainInfo: {
          chainSymbol: "Terra",
          chainName: "Terra",
          estimatedWaitTime: 5,
          fullySupported: true,
          txFeeInPercent: 0.1,
          module: "axelarnet",
          chainIdentifier: {
            devnet: "terra",
            testnet: "terra",
            mainnet: "terra",
          },
        },
        selectedSourceAsset: {
          assetSymbol: "UST",
          assetName: "UST",
          minDepositAmt: 0.05,
          common_key: "uusd",
          native_chain: "terra",
          decimals: 6,
          fullySupported: true,
        },
        destinationChainInfo: {
          chainSymbol: "AVAX",
          chainName: "Avalanche",
          estimatedWaitTime: 5,
          fullySupported: true,
          txFeeInPercent: 0.1,
          module: "evm",
          confirmLevel: 12,
          chainIdentifier: {
            devnet: "avalanche",
            testnet: "avalanche",
            mainnet: "avalanche",
          },
        },
        selectedDestinationAsset: {
          assetAddress: destinationAddress,
          assetSymbol: "UST",
          common_key: "uusd",
        },
        transactionTraceId: "0x",
      };
      response = await axelar.getInitRoomId(transferPayload, false, "0x");
    });

    it("should get room id", () => {
      expect(response.roomId).toBeDefined();
      expect(typeof response.roomId).toBe("string");
      expect(response.roomId.includes(destinationAddress)).toBe(true);
    });
  });
});
