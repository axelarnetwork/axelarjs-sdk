import { AxelarRecoveryApi } from "../../TransactionRecoveryApi/AxelarRecoveryApi";
import { Environment } from "../../types";

describe("AxelarDepositRecoveryAPI", () => {
  const api = new AxelarRecoveryApi({ environment: Environment.TESTNET });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  xdescribe("create pending transfers", () => {
    test("It should create pending transfers", async () => {
        const confirmation = await api.createPendingTransfers({ chain: "ethereum" });
        console.log("confirmation",confirmation)
        expect(confirmation).toBeTruthy();
        
    }, 60000);
  });

  xdescribe("sign commands", () => {
    test("It should sign commands", async () => {
        const confirmation = await api.signCommands({ chain: "ethereum" });
        console.log("confirmation",confirmation)
        expect(confirmation).toBeTruthy();
        
    }, 60000);
  });

  xdescribe("execute pending transfers", () => {
    test("It should execute pending transfers", async () => {
        const confirmation = await api.executePendingTransfers({ chain: "terra" });
        console.log("confirmation",confirmation)
        expect(confirmation).toBeTruthy();
        
    }, 60000);
  });

});
