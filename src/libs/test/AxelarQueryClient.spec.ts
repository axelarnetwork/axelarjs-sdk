import { AxelarQueryClientConfig, Environment } from "../types";
import { AxelarQueryClient, AxelarQueryClientType } from "../AxelarQueryClient";
import {
  BatchedCommandsRequest,
  BatchedCommandsResponse,
} from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/query";
import {
  FeeInfoRequest,
  FeeInfoResponse,
} from "@axelar-network/axelarjs-types/axelar/nexus/v1beta1/query";
import {
  PendingIBCTransferCountRequest,
  PendingIBCTransferCountResponse,
} from "@axelar-network/axelarjs-types/axelar/axelarnet/v1beta1/query";

describe.skip("AxelarQueryClient", () => {
  const config: AxelarQueryClientConfig = { environment: Environment.TESTNET };

  beforeEach(() => {
    vitest.clearAllMocks();
  });

  describe("Axelar queries", () => {
    test("It should be able to query the evm module", async () => {
      const api: AxelarQueryClientType = await AxelarQueryClient.initOrGetAxelarQueryClient(config);
      const params: BatchedCommandsRequest = { chain: "avalanche", id: "" };
      const result: BatchedCommandsResponse = await api.evm.BatchedCommands(params);

      expect(result).toBeDefined();
      expect(result.commandIds).toBeDefined();
      expect(result.executeData).toBeDefined();
      expect(result.prevBatchedCommandsId).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.keyId).toBeDefined();
    }, 60000);

    test("It should be able to query the nexus module", async () => {
      const api: AxelarQueryClientType = await AxelarQueryClient.initOrGetAxelarQueryClient(config);
      const params: FeeInfoRequest = { chain: "avalanche", asset: "wavax-wei" };
      const result: FeeInfoResponse = await api.nexus.FeeInfo(params);

      expect(result).toBeDefined();
      expect(result.feeInfo?.asset).toBeDefined();
      expect(result.feeInfo?.chain).toEqual("avalanche");
      expect(result.feeInfo?.feeRate).toBeDefined();
    }, 60000);

    test("It should be able to query the axelarnet module", async () => {
      const api: AxelarQueryClientType = await AxelarQueryClient.initOrGetAxelarQueryClient(config);
      const params: PendingIBCTransferCountRequest = { chain: "osmosis-3" };
      const result: PendingIBCTransferCountResponse = await api.axelarnet.PendingIBCTransferCount(
        params
      );

      expect(result).toBeDefined();
      expect(result.transfersByChain).toBeDefined();
    }, 60000);

    // test("It should be able to query the tss module", async () => {

    //   const api: AxelarQueryClientType = await AxelarQueryClient.initOrGetAxelarQueryClient(config);
    //   const params: NextKeyIDRequest = { chain: "avalanche", keyRole: 1 };
    //   const result: NextKeyIDResponse = await api.tss.NextKeyID(params);

    //   expect(result).toBeDefined();
    //   expect(result.keyId).toBeDefined();

    // }, 60000);
  });
});
