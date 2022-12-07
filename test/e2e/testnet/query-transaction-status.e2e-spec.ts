import { AxelarRecoveryApi, Environment } from "../../../src";

describe("Query Transaction Status", () => {
  jest.setTimeout(20000);
  let sdk: AxelarRecoveryApi;

  beforeAll(() => {
    sdk = new AxelarRecoveryApi({
      environment: Environment.TESTNET,
    });
  });

  it("should include timeSpent", async () => {
    // the sample tx hashes are from the testnet
    // it contains all finalized statuses to ensure the `timeSpent` is always included.
    const sampleTxHashes = [
      "0xd563e708d99da0c7d7cdd613183d6a45f21dd0e1237cd5568551861f3bf3767a", // failed
      "0x085ad5106880b7a4ecf9ea3ecba3e5637aa6acdeac7158080aa65033aa5731d9", // executed
    ];
    const response = await Promise.all(
      sampleTxHashes.map((hash) => sdk.queryTransactionStatus(hash))
    );
    const timeSpents = response.map((result) => result.timeSpent);
    for (const timeSpent of timeSpents) {
      expect(timeSpent).toBeDefined();
      expect(timeSpent?.total).toBeDefined();
    }
  });
});
