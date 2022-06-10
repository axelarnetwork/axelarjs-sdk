import { AxelarGMPRecoveryAPI } from "../../TransactionRecoveryApi/AxelarGMPRecoveryAPI";
import { Environment } from "../../types";

describe("AxelarDepositRecoveryAPI", () => {
  const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("confirmGatewayTx", () => {
    test("It should confirm a gateway tx", async () => {
        const testParamsAxelarnet = {
            txHash: "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503",
            chain: "Avalanche"
        }
        const confirmation = await api.confirmGatewayTx(testParamsAxelarnet);
        console.log("confirmation",confirmation)
        expect(confirmation).toBeTruthy();
    }, 60000);
  });

  describe("confirmGatewayTx", () => {
    test("It should confirm a gateway tx", async () => {
        const testParamsAxelarnet = {
            txHash: "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503",
            chain: "Avalanche"
        }
        const confirmation = await api.confirmGatewayTx(testParamsAxelarnet);
        console.log("confirmation",confirmation)
        expect(confirmation).toBeTruthy();
    }, 60000);
  });
  
});
