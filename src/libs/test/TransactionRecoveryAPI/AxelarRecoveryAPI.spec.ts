import { ethers } from "hardhat";
import { AxelarRecoveryApi, GMPStatus } from "../../TransactionRecoveryApi/AxelarRecoveryApi";
import { Environment, EvmChain } from "../../types";

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

  describe("query execute params", () => {
    test("It should return null when the response is undefined", async () => {
      jest.spyOn(api, "execGet").mockResolvedValueOnce(undefined);

      const response = await api.queryExecuteParams("0x");

      expect(response).toBeUndefined();
    });
    test("It should return null when response array is empty", async () => {
      jest.spyOn(api, "execGet").mockResolvedValueOnce([]);

      const response = await api.queryExecuteParams("0x");

      expect(response).toBeUndefined();
    });
    test("It should return status: 'call' when the approve transaction hash is undefined", async () => {
      jest.spyOn(api, "execGet").mockResolvedValueOnce([{}]);
      const response = await api.queryExecuteParams("0x");
      expect(response?.status).toBe(GMPStatus.CALL);

      jest.spyOn(api, "execGet").mockResolvedValueOnce([
        {
          approved: {},
        },
      ]);
      const response2 = await api.queryExecuteParams("0x");
      expect(response2?.status).toBe(GMPStatus.CALL);
    });
    test("It should return status: 'executed' when the execute transaction hash is defined", async () => {
      jest.spyOn(api, "execGet").mockResolvedValueOnce([
        {
          approved: {
            transactionHash: "0x",
          },
          executed: {
            transactionHash: "0x",
          },
        },
      ]);
      const response = await api.queryExecuteParams("0x");
      expect(response?.status).toBe(GMPStatus.EXECUTED);
    });
    test("It should get the execute params when the event type is 'ContractCallWithToken'", async () => {
      const txHash = "0x1";
      jest.spyOn(api, "execGet").mockResolvedValueOnce([
        {
          call: {
            chain: "Moonbeam",
            returnValues: {
              payload: "payload",
              destinationContractAddress: "destinationContractAddress",
            },
            event: "ContractCallWithToken",
          },
          approved: {
            transactionHash: txHash,
            chain: "Avalanche",
            returnValues: {
              commandId: "0x1",
              sourceAddress: "0x2",
              sourceChain: "Moonbeam",
              symbol: "UST",
              amount: ethers.BigNumber.from("1"),
            },
          },
        },
      ]);
      const executeParams = await api.queryExecuteParams(txHash);

      expect(api.execGet).toHaveBeenCalledWith(api.axelarCachingServiceUrl, {
        method: "searchGMP",
        txHash,
      });

      expect(executeParams).toEqual({
        status: GMPStatus.APPROVED,
        data: {
          commandId: "0x1",
          destinationChain: EvmChain.AVALANCHE,
          destinationContractAddress: "destinationContractAddress",
          isContractCallWithToken: true,
          payload: "payload",
          sourceAddress: "0x2",
          sourceChain: "Moonbeam",
          symbol: "UST",
          amount: "1",
        },
      });
    });

    test("It should get the execute params when the event type is 'ContractCall'", async () => {
      const txHash = "0x1";
      jest.spyOn(api, "execGet").mockResolvedValueOnce([
        {
          call: {
            chain: "Moonbeam",
            returnValues: {
              payload: "payload",
              destinationContractAddress: "destinationContractAddress",
            },
            event: "ContractCall",
          },
          approved: {
            transactionHash: txHash,
            chain: "Avalanche",
            returnValues: {
              commandId: "0x1",
              sourceAddress: "0x2",
              sourceChain: "Moonbeam",
            },
          },
        },
      ]);
      const executeParams = await api.queryExecuteParams(txHash);

      expect(api.execGet).toHaveBeenCalledWith(api.axelarCachingServiceUrl, {
        method: "searchGMP",
        txHash,
      });

      expect(executeParams).toEqual({
        status: GMPStatus.APPROVED,
        data: {
          commandId: "0x1",
          destinationChain: EvmChain.AVALANCHE,
          destinationContractAddress: "destinationContractAddress",
          isContractCallWithToken: false,
          payload: "payload",
          sourceAddress: "0x2",
          sourceChain: "Moonbeam",
          symbol: undefined,
          amount: undefined,
        },
      });
    });
  });
});
