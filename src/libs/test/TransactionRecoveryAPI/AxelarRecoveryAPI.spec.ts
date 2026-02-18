import { ethers } from "ethers";
import {
  AxelarRecoveryApi,
  GasPaidStatus,
  GMPStatus,
} from "../../TransactionRecoveryApi/AxelarRecoveryApi";
import { Environment } from "../../types";
import { EvmChain } from "../../../constants/EvmChain";

describe("AxelarRecoveryAPI", () => {
  const api = new AxelarRecoveryApi({
    environment: Environment.TESTNET,
  });

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

    test("it should return a valid result when the source tx is from a cosmos-based chain", async () => {
      const txHash = "B210DF80331FB40A61229D23DEF849FF04A51839D47F7D696A4B228DB57EED1D";
      const result = await api.queryTransactionStatus(txHash);
      expect(result.status).toEqual("destination_executed");
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
      const confirmation = await api.createPendingTransfers("ethereum-sepolia");
      console.log("confirmation", confirmation);
      expect(confirmation).toBeTruthy();
    }, 60000);
  });

  describe.skip("create pending transfers", () => {
    test("It should create pending transfers", async () => {
      const confirmation = await api.createPendingTransfers("ethereum-sepolia");
      console.log("confirmation", confirmation);
      expect(confirmation).toBeTruthy();
    }, 60000);
  });

  describe.skip("sign commands", () => {
    test("It should sign commands", async () => {
      const confirmation = await api.signCommands("ethereum-sepolia");
      console.log("confirmation", confirmation);
      expect(confirmation).toBeTruthy();
    }, 60000);
  });

  describe.skip("execute pending transfers", () => {
    test("It should execute pending transfers", async () => {
      const confirmation = await api.executePendingTransfers("terra-3");
      console.log("confirmation", confirmation);
      expect(confirmation).toBeTruthy();
    }, 60000);
  });

  describe("query execute params", () => {
    test("It should return null when the response is undefined", async () => {
      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce(undefined);
      const response = await api.queryExecuteParams("0x");

      expect(response).toBeUndefined();
    });
    test("It should return null when response array is empty", async () => {
      vitest.spyOn(api, "execGet").mockResolvedValueOnce([]);
      const response = await api.queryExecuteParams("0x");

      expect(response).toBeUndefined();
    });
    test("It should return status: 'call' when the approve transaction hash is undefined", async () => {
      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce({
        approved: {},
      } as any);
      const response = await api.queryExecuteParams("0x");
      expect(response?.status).toBe(GMPStatus.SRC_GATEWAY_CALLED);

      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce({
        approved: {},
      } as any);
      const response2 = await api.queryExecuteParams("0x");
      expect(response2?.status).toBe(GMPStatus.SRC_GATEWAY_CALLED);
    });
    test("It should return status: 'executed' when the execute transaction hash is defined", async () => {
      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce({
        approved: {
          transactionHash: "0x",
        },
        executed: {
          transactionHash: "0x",
        },
      } as any);
      const response = await api.queryExecuteParams("0x");
      expect(response?.status).toBe(GMPStatus.DEST_EXECUTED);
    });
    test("It should get the execute params when the event type is 'ContractCallWithToken'", async () => {
      const txHash = "0x1";
      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce({
        call: {
          transactionHash: txHash,
          transactionIndex: 1,
          logIndex: 2,
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
      } as any);
      const executeParams = await api.queryExecuteParams(txHash);

      expect(executeParams).toEqual({
        status: GMPStatus.DEST_GATEWAY_APPROVED,
        data: {
          commandId: "0x1",
          destinationChain: EvmChain.AVALANCHE,
          destinationContractAddress: "destinationContractAddress",
          isContractCallWithToken: true,
          payload: "payload",
          srcTxInfo: {
            transactionHash: txHash,
            transactionIndex: 1,
            logIndex: 2,
          },
          sourceAddress: "0x2",
          sourceChain: "Moonbeam",
          symbol: "UST",
          amount: "1",
        },
      });
    });

    test("It should get the execute params when the event type is 'ContractCall'", async () => {
      const txHash = "0x1";
      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValueOnce({
        call: {
          transactionHash: txHash,
          transactionIndex: 1,
          logIndex: 2,
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
      } as any);
      const executeParams = await api.queryExecuteParams(txHash);

      expect(executeParams).toEqual({
        status: GMPStatus.DEST_GATEWAY_APPROVED,
        data: {
          commandId: "0x1",
          destinationChain: EvmChain.AVALANCHE,
          destinationContractAddress: "destinationContractAddress",
          isContractCallWithToken: false,
          payload: "payload",
          srcTxInfo: {
            transactionHash: txHash,
            transactionIndex: 1,
            logIndex: 2,
          },
          sourceAddress: "0x2",
          sourceChain: "Moonbeam",
          symbol: undefined,
          amount: undefined,
        },
      });
    });
  });

  describe("self-signing option handling", () => {
    test("maps self-signed response into AxelarTxResponse", async () => {
      vitest.spyOn(api as any, "getChainInfo").mockResolvedValue({
        module: "evm",
        chainIdentifier: {
          [Environment.TESTNET]: "avalanche",
        },
      });
      vitest.spyOn(api as any, "trySelfSignAndBroadcast").mockResolvedValue({
        code: 0,
        height: 1,
        transactionHash: "0x123",
        events: [],
        gasUsed: 1,
        gasWanted: 1,
      });

      const response = await api.confirmGatewayTx("0xabc", "avalanche", {
        cosmosWalletDetails: {
          offlineSigner: {} as any,
        },
      });

      expect(response).toBeDefined();
      expect(response.transactionHash).toBe("0x123");
      expect(response.rawLog).toBe("[]");
    });

    test("does not warn when options object has no cosmos signing material and self-sign flag is false", () => {
      const warnSpy = vitest.spyOn(console, "warn").mockImplementation(() => undefined);
      const resolved = (api as any).resolveSelfSigningOptions({
        evmWalletDetails: { useWindowEthereum: true },
      });

      expect(resolved.shouldSelfSign).toBeFalsy();
      expect(warnSpy).not.toHaveBeenCalled();
    });

    test("warns when self-sign flag is true but cosmos signing material is missing", () => {
      const warnSpy = vitest.spyOn(console, "warn").mockImplementation(() => undefined);
      const resolved = (api as any).resolveSelfSigningOptions(
        {
          evmWalletDetails: { useWindowEthereum: true },
        },
        true
      );

      expect(resolved.shouldSelfSign).toBeTruthy();
      expect(warnSpy).toHaveBeenCalledWith("[recovery self-sign options ignored]", {
        reason: "cosmos signing material missing",
      });
    });

    test("keeps legacy cosmos wallet details on relayer path without self-sign flag", () => {
      const resolved = (api as any).resolveSelfSigningOptions({
        offlineSigner: {} as any,
      });

      expect(resolved.shouldSelfSign).toBeFalsy();
    });
  });
});
