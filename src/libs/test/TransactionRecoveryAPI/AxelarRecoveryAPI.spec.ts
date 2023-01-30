import { ethers } from "ethers";
import {
  AxelarRecoveryApi,
  GasPaidStatus,
  GMPStatus,
} from "../../TransactionRecoveryApi/AxelarRecoveryApi";
import { Environment, EvmChain } from "../../types";

describe("AxelarRecoveryAPI", () => {
  const api = new AxelarRecoveryApi({ environment: Environment.TESTNET });

  beforeEach(() => {
    vitest.clearAllMocks();
  });

  describe("queryTransactionStatus", () => {
    test("it should return 'GMPStatus.DEST_GATEWAY_APPROVED' when the transaction is approved, but not executed.", async () => {
      const txHash = "0x123456789";
      const txDetails = {
        call: {
          transactionHash: txHash,
        },
        gas_paid: {
          transactionHash: txHash,
        },
        approved: {
          transactionHash: `${txHash}1`,
        },
        executed: {
          transactionHash: `${txHash}2`,
        },
        gas_status: "gas_paid",
        status: "approved",
      };

      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(txDetails);

      const status = await api.queryTransactionStatus(txHash);

      expect(status).toEqual({
        status: GMPStatus.DEST_GATEWAY_APPROVED,
        error: undefined,
        approved: txDetails.approved,
        callTx: txDetails.call,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID,
          details: txDetails.gas_paid,
        },
        executed: txDetails.executed,
        callback: undefined,
      });
    });

    test("it should return 'GMPStatus.DEST_EXECUTING' when the transaction is still in process", async () => {
      const txHash = "0x123456789";
      const txDetails = {
        call: {
          transactionHash: txHash,
        },
        gas_paid: {
          transactionHash: txHash,
        },
        approved: {
          transactionHash: `${txHash}1`,
        },
        executed: {
          transactionHash: `${txHash}2`,
        },
        gas_status: "gas_paid",
        status: "executing",
      };

      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(txDetails);

      const status = await api.queryTransactionStatus(txHash);

      expect(status).toEqual({
        status: GMPStatus.DEST_EXECUTING,
        error: undefined,
        callTx: txDetails.call,
        approved: txDetails.approved,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID,
          details: txDetails.gas_paid,
        },
        executed: txDetails.executed,
        callback: undefined,
      });
    });

    test("it should return 'GMPStatus.DEST_EXECUTED' when the transaction is already executed", async () => {
      const txHash = "0x123456789";
      const txDetails = {
        call: {
          transactionHash: txHash,
        },
        gas_paid: {
          transactionHash: txHash,
        },
        approved: {
          transactionHash: `${txHash}1`,
        },
        executed: {
          transactionHash: `${txHash}2`,
        },
        gas_status: "gas_paid_enough_gas",
        status: "executed",
      };

      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(txDetails);

      const status = await api.queryTransactionStatus(txHash);

      expect(status).toEqual({
        status: GMPStatus.DEST_EXECUTED,
        error: undefined,
        callTx: txDetails.call,
        approved: txDetails.approved,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID_ENOUGH_GAS,
          details: txDetails.gas_paid,
        },
        executed: txDetails.executed,
        callback: undefined,
      });
    });

    test("it should return 'GMPStatus.SRC_GATEWAY_CALLED' when the transaction is not approved", async () => {
      const txHash = "0x123456789";
      const txDetails = {
        call: {
          transactionHash: txHash,
        },
        gas_paid: {
          transactionHash: txHash,
        },
        gas_status: "gas_paid",
        status: "called",
      };

      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(txDetails);

      const status = await api.queryTransactionStatus(txHash);

      expect(status).toEqual({
        status: GMPStatus.SRC_GATEWAY_CALLED,
        error: undefined,
        callTx: txDetails.call,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID,
          details: txDetails.gas_paid,
        },
      });
    });

    test("it should return error when the transaction fee is not enough", async () => {
      const txHash = "0x123456789";
      const txDetails = {
        call: {
          transaction: {
            hash: txHash,
          },
          chain: EvmChain.ETHEREUM,
        },
        gas_paid: {
          transactionHash: txHash,
        },
        is_insufficient_fee: true,
        gas_status: "gas_paid",
        status: "called",
      };

      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(txDetails);

      const status = await api.queryTransactionStatus(txHash);

      expect(status).toEqual({
        status: GMPStatus.SRC_GATEWAY_CALLED,
        error: {
          message: "Insufficient fee",
          txHash: txHash,
          chain: EvmChain.ETHEREUM,
        },
        callTx: txDetails.call,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID,
          details: txDetails.gas_paid,
        },
      });
    });

    test("it should return 'GMPStatus.DEST_EXECUTE_ERROR' when the transaction is not executed", async () => {
      const txHash = "0x123456789";
      const txDetails = {
        call: {
          transactionHash: txHash,
        },
        gas_paid: {
          transactionHash: txHash,
        },
        approved: {
          transactionHash: `${txHash}1`,
        },
        executed: {
          transactionHash: `${txHash}2`,
        },
        error: {
          chain: "ethereum",
          error: {
            message: "execution reverted",
            transactionHash: `${txHash}2`,
          },
        },
        gas_status: "gas_paid_enough_gas",
        status: "error",
      };

      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(txDetails);

      const status = await api.queryTransactionStatus(txHash);

      expect(status).toEqual({
        status: GMPStatus.DEST_EXECUTE_ERROR,
        error: {
          chain: EvmChain.ETHEREUM,
          message: "execution reverted",
          txHash: `${txHash}2`,
        },
        approved: txDetails.approved,
        callTx: txDetails.call,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID_ENOUGH_GAS,
          details: txDetails.gas_paid,
        },
        executed: txDetails.executed,
        callback: undefined,
      });
    });

    test("it should return 'GMPStatus.UNKNOWN_ERROR' when the api status is error but 'error' object is undefined", async () => {
      const txHash = "0x123456789";
      const txDetails = {
        call: {
          transactionHash: txHash,
        },
        gas_paid: {
          transactionHash: txHash,
        },
        approved: {
          transactionHash: `${txHash}1`,
        },
        executed: {
          transactionHash: `${txHash}2`,
        },
        gas_status: "gas_paid_enough_gas",
        status: "error",
      };

      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(txDetails);

      const status = await api.queryTransactionStatus(txHash);

      expect(status).toEqual({
        status: "error",
        callTx: txDetails.call,
        approved: txDetails.approved,
        error: undefined,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID_ENOUGH_GAS,
          details: txDetails.gas_paid,
        },
        executed: txDetails.executed,
        callback: undefined,
      });
    });

    test("it should return 'GMPStatus.CANNOT_FETCH_STATUS' when the axelarscan api is down", async () => {
      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(undefined);

      const status = await api.queryTransactionStatus("0x");

      expect(status).toEqual({
        status: GMPStatus.CANNOT_FETCH_STATUS,
      });
    });
  });

  describe.skip("create pending transfers", () => {
    test("It should create pending transfers", async () => {
      const confirmation = await api.createPendingTransfers("ethereum");
      console.log("confirmation", confirmation);
      expect(confirmation).toBeTruthy();
    }, 60000);
  });

  describe.skip("create pending transfers", () => {
    test("It should create pending transfers", async () => {
      const confirmation = await api.createPendingTransfers("ethereum");
      console.log("confirmation", confirmation);
      expect(confirmation).toBeTruthy();
    }, 60000);
  });

  describe.skip("sign commands", () => {
    test("It should sign commands", async () => {
      const confirmation = await api.signCommands("ethereum");
      console.log("confirmation", confirmation);
      expect(confirmation).toBeTruthy();
    }, 60000);
  });

  describe.skip("execute pending transfers", () => {
    test("It should execute pending transfers", async () => {
      const confirmation = await api.executePendingTransfers("terra");
      console.log("confirmation", confirmation);
      expect(confirmation).toBeTruthy();
    }, 60000);
  });

  describe.skip("query execute params", () => {
    test("It should return null when the response is undefined", async () => {
      vitest.spyOn(api, "execGet").mockResolvedValueOnce(undefined);

      const response = await api.queryExecuteParams("0x");

      expect(response).toBeUndefined();
    });
    test("It should return null when response array is empty", async () => {
      vitest.spyOn(api, "execGet").mockResolvedValueOnce([]);

      const response = await api.queryExecuteParams("0x");

      expect(response).toBeUndefined();
    });
    test("It should return status: 'call' when the approve transaction hash is undefined", async () => {
      vitest.spyOn(api, "execGet").mockResolvedValueOnce([{}]);
      const response = await api.queryExecuteParams("0x");
      expect(response?.status).toBe(GMPStatus.SRC_GATEWAY_CALLED);

      vitest.spyOn(api, "execGet").mockResolvedValueOnce([
        {
          approved: {},
        },
      ]);
      const response2 = await api.queryExecuteParams("0x");
      expect(response2?.status).toBe(GMPStatus.SRC_GATEWAY_CALLED);
    });
    test("It should return status: 'executed' when the execute transaction hash is defined", async () => {
      vitest.spyOn(api, "execGet").mockResolvedValueOnce([
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
      expect(response?.status).toBe(GMPStatus.DEST_EXECUTED);
    });
    test("It should get the execute params when the event type is 'ContractCallWithToken'", async () => {
      const txHash = "0x1";
      vitest.spyOn(api, "execGet").mockResolvedValueOnce([
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

      expect(api.execGet).toHaveBeenCalledWith(api.axelarGMPApiUrl, {
        method: "searchGMP",
        txHash,
      });

      expect(executeParams).toEqual({
        status: GMPStatus.DEST_GATEWAY_APPROVED,
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
      vitest.spyOn(api, "execGet").mockResolvedValueOnce([
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

      expect(api.execGet).toHaveBeenCalledWith(api.axelarGMPApiUrl, {
        method: "searchGMP",
        txHash,
      });

      expect(executeParams).toEqual({
        status: GMPStatus.DEST_GATEWAY_APPROVED,
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
