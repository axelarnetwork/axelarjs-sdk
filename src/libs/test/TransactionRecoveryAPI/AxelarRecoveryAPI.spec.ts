import { AxelarRecoveryApi } from "../../TransactionRecoveryApi/AxelarRecoveryApi";
import { Environment } from "../../types";

describe("AxelarDepositRecoveryAPI", () => {
  const api = new AxelarRecoveryApi({ environment: Environment.TESTNET });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("queryTransactionStatus", () => {
    test("It should get the latest state of a txHash using the axelar caching service API", async () => {
      const txHash = "0xf459d54046b0507bd4b726bc64a7ce459053c53b0d858ea785d982e7c51594b0";

      const confirmation = await api.queryTransactionStatus(txHash);
      console.log("confirmation", confirmation);
      expect(confirmation).toBeTruthy();
    }, 60000);
  });

  xdescribe("create pending transfers", () => {
    test("It should create pending transfers", async () => {
      const confirmation = await api.createPendingTransfers({ chain: "ethereum" });
      console.log("confirmation", confirmation);
      expect(confirmation).toBeTruthy();
    }, 60000);
  });

  xdescribe("create pending transfers", () => {
    test("It should create pending transfers", async () => {
      const confirmation = await api.createPendingTransfers({ chain: "ethereum" });
      console.log("confirmation", confirmation);
      expect(confirmation).toBeTruthy();
    }, 60000);
  });

  xdescribe("sign commands", () => {
    test("It should sign commands", async () => {
      const confirmation = await api.signCommands({ chain: "ethereum" });
      console.log("confirmation", confirmation);
      expect(confirmation).toBeTruthy();
    }, 60000);
  });

  xdescribe("execute pending transfers", () => {
    test("It should execute pending transfers", async () => {
      const confirmation = await api.executePendingTransfers({ chain: "terra" });
      console.log("confirmation", confirmation);
      expect(confirmation).toBeTruthy();
    }, 60000);
  });
});
