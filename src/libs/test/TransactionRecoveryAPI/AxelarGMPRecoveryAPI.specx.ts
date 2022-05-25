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
        const testParams: any = {
            hash: "0x13c9093c019ea97445d3142a88e9ffd0bd8e50807304e3337e17a54bc8fa5de9",
            from: "Avalanche",
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
