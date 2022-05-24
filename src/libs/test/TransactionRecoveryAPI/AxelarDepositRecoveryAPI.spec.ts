import { AxelarRetryResponse, ConfirmDepositRequest, ConfirmDepositResponse } from "../../TransactionRecoveryApi/interface";
import { AxelarDepositRecoveryAPI } from "../../TransactionRecoveryApi/AxelarDepositRecoveryAPI";
import { Environment } from "../../types";

describe("AxelarDepositRecoveryAPI", () => {
  const api = new AxelarDepositRecoveryAPI({ environment: Environment.TESTNET });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("confirmDeposit", () => {
    test("It should confirm a deposit", async () => {
        const testParams: ConfirmDepositRequest = {
            hash: "0xaea3b215c6a79a47b31f85253f788e928b37a9fe2cfad8484cc6b2a65226d32c",
            from: "Avalanche",
            depositAddress: "0xe74e43b70bc841011288aa510456fd942596a685",
            amount: "2000000",
            signature: "", // this won't be used because single signer
            token: "uusd"
        }
        const confirmation: AxelarRetryResponse<ConfirmDepositResponse> = await api.confirmDeposit(testParams);
        expect(confirmation).toBeTruthy();
        expect(confirmation?.status).toBeTruthy();
        expect(confirmation?.data).toBeTruthy();
        expect(confirmation?.data?.hash).toBeTruthy();
        expect(confirmation?.data?.depositTxHash).toEqual(testParams.hash);
        expect(confirmation?.data?.depositAddress.toLowerCase()).toEqual(testParams.depositAddress.toLowerCase());
        expect(confirmation?.data?.chain).toEqual(testParams.from);
        // expect(confirmation?.data?.amount).toEqual(testParams.amount);
    });
  });
});
