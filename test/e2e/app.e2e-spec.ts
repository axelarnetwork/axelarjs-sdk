import { Wallet } from "ethers";
import { createWallet, signOtc } from "../../src/utils";
import { TransferAssetBridge } from "../../src/libs";
import { OTC } from "../../src/services/types";

describe("E2E", () => {
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

  describe("getting deposit address", () => {});
});
