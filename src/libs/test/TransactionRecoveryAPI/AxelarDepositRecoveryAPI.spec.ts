import {
  AxelarRetryResponse,
  ConfirmDepositRequest,
  ConfirmDepositResponse,
} from "../../TransactionRecoveryApi/interface";
import { AxelarDepositRecoveryAPI } from "../../TransactionRecoveryApi/AxelarDepositRecoveryAPI";
import { Environment } from "../../types";

describe("AxelarDepositRecoveryAPI", () => {
  const senderAddress = process.env.LIVE_AXELAR_SENDER_ADDRESS;
  const api = new AxelarDepositRecoveryAPI({
    environment: Environment.TESTNET,
    senderAddress,
  });
  const testIf = senderAddress ? test : test.skip;

  beforeEach(() => {
    vitest.clearAllMocks();
  });

  describe("confirmDeposit", () => {
    testIf("It should confirm a deposit", async () => {
      const testParamsAxelarnet: ConfirmDepositRequest = {
        hash: "FD6F3C9E63A8A0F47092418CCF3A70D52642B77B940FB6D2BE5A797D7AA97BEB",
        from: "osmosis-7",
        depositAddress: "axelar192mp2cv2s0hayv6fwgjl64zs72hl97zcxjwcg6g8nkdkjxq89dps0yt6gc",
        denom: "wavax-wei",
        senderAddress,
      };
      //   const testParamsEvm: ConfirmDepositRequest = {
      //     hash: "0xaea3b215c6a79a47b31f85253f788e928b37a9fe2cfad8484cc6b2a65226d32c",
      //     from: "Avalanche",
      //     depositAddress: "0xe74e43b70bc841011288aa510456fd942596a685",
      //     amount: "2000000",
      //     signature: "", // this won't be used because single signer
      //     token: "uusd"
      // }
      const confirmation: AxelarRetryResponse<ConfirmDepositResponse> = await api.confirmDeposit(
        testParamsAxelarnet
      );
      console.log("confirmation", confirmation);
      expect(confirmation).toBeTruthy();
      // expect(confirmation?.status).toBeTruthy();
      // expect(confirmation?.data).toBeTruthy();
      // expect(confirmation?.data?.hash).toBeTruthy();
      // expect(confirmation?.data?.depositTxHash).toEqual(testParamsAxelarnet.hash);
      // expect(confirmation?.data?.depositAddress.toLowerCase()).toEqual(testParamsAxelarnet.depositAddress.toLowerCase());
      // expect(confirmation?.data?.chain).toEqual(testParamsAxelarnet.from);
      // expect(confirmation?.data?.amount).toEqual(testParams.amount);
    }, 60000);
  });
});
