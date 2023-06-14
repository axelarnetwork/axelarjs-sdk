import { AxelarGMPRecoveryAPI } from "../../TransactionRecoveryApi/AxelarGMPRecoveryAPI";
import {
  AddGasOptions,
  ApproveGatewayError,
  AxelarTxResponse,
  Environment,
  EvmChain,
  EvmWalletDetails,
  GasToken,
} from "../../types";
import { createNetwork, utils } from "@axelar-network/axelar-local-dev";
import { Contract, ContractReceipt, ContractTransaction, ethers, Wallet } from "ethers";
import DistributionExecutable from "../abi/DistributionExecutable.json";
import DistributionExecutableWithGasToken from "../abi/DistributionExecutableGasToken.json";
import TestToken from "../abi/TestToken.json";
import { findContractEvent, getLogIndexFromTxReceipt } from "../../TransactionRecoveryApi/helpers";
import { Interface } from "ethers/lib/utils";
import {
  AlreadyExecutedError,
  AlreadyPaidGasFeeError,
  ExecutionRevertedError,
  GasPriceAPIError,
  GMPQueryError,
  InsufficientFundsError,
  InvalidGasTokenError,
  InvalidTransactionError,
  NotApprovedError,
  NotGMPTransactionError,
  UnsupportedGasTokenError,
} from "../../TransactionRecoveryApi/constants/error";
import { AXELAR_GATEWAY } from "../../AxelarGateway";
import {
  BatchedCommandsAxelarscanResponse,
  GMPStatus,
} from "../../TransactionRecoveryApi/AxelarRecoveryApi";
import * as ContractCallHelper from "../../TransactionRecoveryApi/helpers/contractCallHelper";
import {
  activeChainsStub,
  axelarTxResponseStub,
  contractReceiptStub,
  evmEventStubResponse,
  executeParamsStub,
} from "../stubs";
import * as Sleep from "../../../utils/sleep";
import { EventResponse } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/query";

describe("AxelarGMPRecoveryAPI", () => {
  const { setLogger } = utils;
  setLogger(() => null);
  let evmWalletDetails: EvmWalletDetails;

  beforeEach(() => {
    vitest.clearAllMocks();
    evmWalletDetails = {
      privateKey: "",
      useWindowEthereum: false,
    };
  });

  describe.skip("findEventAndConfirmIfNeeded", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    test("It should confirm an event if needed", async () => {
      const mockConfirmGatewayTx = vitest.spyOn(api, "confirmGatewayTx");
      const stub: AxelarTxResponse = axelarTxResponseStub();
      mockConfirmGatewayTx.mockImplementation(() => Promise.resolve(stub));
      const confirmation = await api.findEventAndConfirmIfNeeded(
        // { event: { ...evmEvent.event, status: Event_Status.STATUS_UNSPECIFIED } },
        EvmChain.AVALANCHE,
        EvmChain.POLYGON,
        "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503",
        evmWalletDetails,
        1
      );
      expect(mockConfirmGatewayTx).toHaveBeenCalled();
      expect(confirmation).toBeTruthy();
      expect(confirmation.errorMessage).toBeFalsy();
      expect(confirmation.confirmTx).toEqual(stub);
      expect(confirmation.success).toBeTruthy();
    }, 60000);
    test("It should not confirm an event if not needed", async () => {
      const mockConfirmGatewayTx = vitest.spyOn(api, "confirmGatewayTx");
      const stub = axelarTxResponseStub();
      mockConfirmGatewayTx.mockImplementation(() => Promise.resolve(stub));
      const confirmation = await api.findEventAndConfirmIfNeeded(
        // { event: { ...evmEvent.event, status: Event_Status.STATUS_COMPLETED } },
        EvmChain.AVALANCHE,
        EvmChain.POLYGON,
        "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503",
        evmWalletDetails,
        1
      );
      expect(mockConfirmGatewayTx).not.toHaveBeenCalled();
      expect(confirmation).toBeTruthy();
      expect(confirmation.errorMessage).toBeFalsy();
      expect(confirmation.confirmTx).toEqual(null);
      expect(confirmation.success).toBeTruthy();
    }, 60000);
    test("It should confirm the event and fail if event is not completed after sleep delay", async () => {
      const mockConfirmGatewayTx = vitest.spyOn(api, "confirmGatewayTx");
      const mockGetEvmEvent = vitest.spyOn(api, "getEvmEvent");
      const mockisEVMEventCompleted = vitest.spyOn(api, "isEVMEventCompleted");

      const stub = axelarTxResponseStub();
      mockConfirmGatewayTx.mockImplementation(() => Promise.resolve(stub));
      mockGetEvmEvent.mockResolvedValueOnce(evmEventStubResponse());
      mockisEVMEventCompleted.mockReturnValue(false);

      const confirmation = await api.findEventAndConfirmIfNeeded(
        // evmEvent,
        EvmChain.AVALANCHE,
        EvmChain.POLYGON,
        "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503",
        evmWalletDetails,
        1
      );
      expect(mockConfirmGatewayTx).toHaveBeenCalled();
      expect(confirmation).toBeTruthy();
      expect(confirmation.errorMessage).toContain(`could not confirm event successfully:`);
      expect(confirmation.confirmTx).toEqual(stub);
      expect(confirmation.success).toBeFalsy();
    }, 60000);
  });

  describe.skip("findBatchAndSignIfNeeded", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    test("It should sign an event if needed", async () => {
      const mockSignCommandTx = vitest.spyOn(api, "signCommands");
      const stub = axelarTxResponseStub();
      mockSignCommandTx.mockImplementation(() => Promise.resolve(stub));
      const mockFetchBatchData = vitest.spyOn(api, "fetchBatchData");
      mockFetchBatchData.mockImplementation(() => Promise.resolve(null));

      const commandId = "",
        destChainId = EvmChain.MOONBEAM;
      const signResult = await api.findBatchAndSignIfNeeded(commandId, destChainId, 1);
      expect(mockSignCommandTx).toHaveBeenCalled();
      expect(signResult).toBeTruthy();
      expect(signResult.errorMessage).toBeFalsy();
      expect(signResult.signCommandTx).toEqual(stub);
      expect(signResult.success).toBeTruthy();
    }, 60000);
    test("It should skip sign an event if batch is found", async () => {
      const mockSignCommandTx = vitest.spyOn(api, "signCommands");
      const stub = axelarTxResponseStub();
      mockSignCommandTx.mockImplementation(() => Promise.resolve(stub));
      const mockFetchBatchData = vitest.spyOn(api, "fetchBatchData");
      mockFetchBatchData.mockImplementation(() =>
        Promise.resolve({} as BatchedCommandsAxelarscanResponse)
      );

      const commandId = "",
        destChainId = EvmChain.MOONBEAM;
      const signResult = await api.findBatchAndSignIfNeeded(commandId, destChainId, 1);
      expect(mockSignCommandTx).not.toHaveBeenCalled();
      expect(signResult).toBeTruthy();
      expect(signResult.errorMessage).toBeFalsy();
      expect(signResult.signCommandTx).toBeNull();
      expect(signResult.success).toBeTruthy();
    }, 60000);
    test("It should return an error if unable to fetchBatchData", async () => {
      const mockSignCommandTx = vitest.spyOn(api, "signCommands");
      const stub = axelarTxResponseStub();
      mockSignCommandTx.mockImplementation(() => Promise.resolve(stub));
      const mockFetchBatchData = vitest.spyOn(api, "fetchBatchData");
      mockFetchBatchData.mockImplementation(() => {
        throw "error";
      });

      const commandId = "",
        destChainId = EvmChain.MOONBEAM;
      const signResult = await api.findBatchAndSignIfNeeded(commandId, destChainId, 1);
      expect(mockSignCommandTx).not.toHaveBeenCalled();
      expect(signResult).toBeTruthy();
      expect(signResult.errorMessage).toContain(
        `findBatchAndSignIfNeeded(): issue retrieving and signing command data`
      );
      expect(signResult.signCommandTx).toBeNull();
      expect(signResult.success).toBeFalsy();
    }, 60000);
  });

  describe.skip("findBatchAndBroadcastIfNeeded", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    test("It should broadcast an event if needed", async () => {
      const commandId = "TEST_COMMAND_ID",
        destChainId = EvmChain.MOONBEAM;
      const mockSendApproveTx = vitest.spyOn(api, "sendApproveTx");
      const stub = axelarTxResponseStub();
      mockSendApproveTx.mockImplementation(() => Promise.resolve(stub));
      const mockFetchBatchData = vitest.spyOn(api, "fetchBatchData");
      mockFetchBatchData.mockImplementation(() =>
        Promise.resolve({} as BatchedCommandsAxelarscanResponse)
      );

      const approveTx = await api.findBatchAndBroadcast(commandId, destChainId, evmWalletDetails);
      expect(mockSendApproveTx).toHaveBeenCalled();
      expect(approveTx).toBeTruthy();
      expect(approveTx.errorMessage).toBeFalsy();
      expect(approveTx.approveTx).toEqual(stub);
      expect(approveTx.success).toBeTruthy();
    }, 60000);

    test("It should return unsuccess message if batch data is not found", async () => {
      const commandId = "TEST_COMMAND_ID",
        destChainId = EvmChain.MOONBEAM;
      const mockSendApproveTx = vitest.spyOn(api, "sendApproveTx");
      const stub = axelarTxResponseStub();
      mockSendApproveTx.mockImplementation(() => Promise.resolve(stub));
      const mockFetchBatchData = vitest.spyOn(api, "fetchBatchData");
      mockFetchBatchData.mockImplementation(() => Promise.resolve(null));

      const approveTx = await api.findBatchAndBroadcast(commandId, destChainId, evmWalletDetails);
      expect(mockSendApproveTx).not.toHaveBeenCalled();
      expect(approveTx).toBeTruthy();
      expect(approveTx.errorMessage).toContain(
        `findBatchAndBroadcastIfNeeded(): unable to retrieve batch data for`
      );
      expect(approveTx.approveTx).toEqual(null);
      expect(approveTx.success).toBeFalsy();
    }, 60000);
    test("It should return unsuccess message if batch data does not contain command ID", async () => {
      const commandId = "TEST_COMMAND_ID",
        destChainId = EvmChain.MOONBEAM;
      const mockSendApproveTx = vitest.spyOn(api, "sendApproveTx");
      const stub = axelarTxResponseStub();
      mockSendApproveTx.mockImplementation(() => Promise.resolve(stub));
      const mockFetchBatchData = vitest.spyOn(api, "fetchBatchData");
      mockFetchBatchData.mockImplementation(() =>
        Promise.resolve({} as BatchedCommandsAxelarscanResponse)
      );

      const approveTx = await api.findBatchAndBroadcast(commandId, destChainId, evmWalletDetails);
      expect(mockSendApproveTx).not.toHaveBeenCalled();
      expect(approveTx).toBeTruthy();
      expect(approveTx.errorMessage).toContain(
        `findBatchAndBroadcastIfNeeded(): unable to retrieve command ID`
      );
      expect(approveTx.approveTx).toEqual(null);
      expect(approveTx.success).toBeFalsy();
    }, 60000);
  });

  describe.skip("confirmGatewayTx", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    test("It should confirm a gateway tx", async () => {
      const confirmation = await api.confirmGatewayTx(
        "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503",
        EvmChain.AVALANCHE
      );
      expect(confirmation).toBeTruthy();
    }, 60000);
  });

  describe("manualRelayToDestChain", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    beforeEach(() => {
      // Prevent sleep while testing
      const mockSleep = vitest.spyOn(Sleep, "sleep");
      mockSleep.mockImplementation(() => Promise.resolve(undefined));
    });

    test("it shouldn't call approve given the gmp status cannot be fetched", async () => {
      const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
      mockQueryTransactionStatus.mockResolvedValueOnce({ status: GMPStatus.CANNOT_FETCH_STATUS });

      const response = await api.manualRelayToDestChain("0x");

      expect(response).toEqual({
        success: false,
        error: ApproveGatewayError.FETCHING_STATUS_FAILED,
      });
    });
    test("it should fail if the evm event cannot be retrieved", async () => {
      const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
      mockQueryTransactionStatus.mockResolvedValueOnce({
        status: GMPStatus.SRC_GATEWAY_CALLED,
        callTx: {
          chain: EvmChain.AVALANCHE,
          returnValues: { destinationChain: EvmChain.MOONBEAM },
        },
      });
      const res = await api.manualRelayToDestChain("0x");
      expect(res).toBeTruthy();
      expect(res?.success).toBeFalsy();
      expect(res?.error).toEqual(
        "findEventAndConfirmIfNeeded(): unable to confirm transaction on Axelar"
      );
    });
    test("it should fail if it confirms the tx and event still incomplete", async () => {
      const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
      mockQueryTransactionStatus.mockResolvedValueOnce({
        status: GMPStatus.SRC_GATEWAY_CALLED,
        callTx: {
          chain: EvmChain.AVALANCHE,
          returnValues: { destinationChain: EvmChain.MOONBEAM },
        },
      });
      const mockFindEventAndConfirmIfNeeded = vitest.spyOn(api, "findEventAndConfirmIfNeeded");
      mockFindEventAndConfirmIfNeeded.mockResolvedValueOnce({
        success: false,
        errorMessage: `findEventAndConfirmIfNeeded(): could not confirm event successfully`,
        commandId: "",
        eventResponse: {} as EventResponse,
        confirmTx: null,
        infoLogs: [""],
      });
      const mockGetEvmEvent = vitest.spyOn(api, "getEvmEvent");
      mockGetEvmEvent.mockResolvedValueOnce(evmEventStubResponse());

      const res = await api.manualRelayToDestChain("0x");
      expect(res).toBeTruthy();
      expect(res?.success).toBeFalsy();
      expect(res?.error).toEqual(
        `findEventAndConfirmIfNeeded(): could not confirm event successfully`
      );
    });
    test("it should fail if it has an issue finding the batch and trying to sign", async () => {
      const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
      mockQueryTransactionStatus.mockResolvedValueOnce({
        status: GMPStatus.SRC_GATEWAY_CALLED,
        callTx: {
          chain: EvmChain.AVALANCHE,
          returnValues: { destinationChain: EvmChain.MOONBEAM },
        },
      });
      const mockFindEventAndConfirmIfNeeded = vitest.spyOn(api, "findEventAndConfirmIfNeeded");
      mockFindEventAndConfirmIfNeeded.mockResolvedValueOnce({
        success: true,
        errorMessage: "findBatchAndSignIfNeeded(): issue retrieving and signing command data",
        commandId: "",
        eventResponse: {} as EventResponse,
        confirmTx: {} as AxelarTxResponse,
        infoLogs: [""],
      });
      const mockFindBatchAndSignIfNeeded = vitest.spyOn(api, "findBatchAndSignIfNeeded");
      mockFindBatchAndSignIfNeeded.mockResolvedValueOnce({
        success: false,
        errorMessage: "findBatchAndSignIfNeeded(): issue retrieving and signing command data",
        signCommandTx: {} as AxelarTxResponse,
        infoLogs: [],
      });
      const mockGetEvmEvent = vitest.spyOn(api, "getEvmEvent");
      mockGetEvmEvent.mockResolvedValueOnce(evmEventStubResponse());

      const res = await api.manualRelayToDestChain("0x", undefined, false);
      expect(res).toBeTruthy();
      expect(res?.success).toBeFalsy();
      expect(res?.error).toEqual(
        "findBatchAndSignIfNeeded(): issue retrieving and signing command data"
      );
    });
    test("it should fail if it has an issue finding the batch and trying to broadcast", async () => {
      const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
      mockQueryTransactionStatus.mockResolvedValueOnce({
        status: GMPStatus.SRC_GATEWAY_CALLED,
        callTx: {
          chain: EvmChain.AVALANCHE,
          returnValues: { destinationChain: EvmChain.MOONBEAM },
        },
      });
      const mockFindEventAndConfirmIfNeeded = vitest.spyOn(api, "findEventAndConfirmIfNeeded");
      mockFindEventAndConfirmIfNeeded.mockResolvedValueOnce({
        success: true,
        errorMessage: "",
        commandId: "",
        eventResponse: {} as EventResponse,
        confirmTx: {} as AxelarTxResponse,
        infoLogs: [""],
      });
      const mockFindBatchAndSignIfNeeded = vitest.spyOn(api, "findBatchAndSignIfNeeded");
      mockFindBatchAndSignIfNeeded.mockResolvedValueOnce({
        success: true,
        errorMessage: "",
        signCommandTx: {} as AxelarTxResponse,
        infoLogs: [],
      });
      const mockfindBatchAndBroadcast = vitest.spyOn(api, "findBatchAndBroadcast");
      mockfindBatchAndBroadcast.mockResolvedValueOnce({
        success: false,
        errorMessage: "findBatchAndBroadcast(): unable to retrieve command ID",
        approveTx: {} as AxelarTxResponse,
        infoLogs: [],
      });
      const mockGetEvmEvent = vitest.spyOn(api, "getEvmEvent");
      mockGetEvmEvent.mockResolvedValueOnce(evmEventStubResponse());

      const res = await api.manualRelayToDestChain("0x", undefined, false);
      expect(res).toBeTruthy();
      expect(res?.success).toBeFalsy();
      expect(res?.error).toEqual(`findBatchAndBroadcast(): unable to retrieve command ID`);
    });

    // test.skip("it shouldn't call approve given the 'batchedCommandId' cannot be fetched", async () => {
    //   const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
    //   mockQueryTransactionStatus.mockResolvedValueOnce({
    //     status: GMPStatus.SRC_GATEWAY_CALLED,
    //     callTx: {
    //       chain: EvmChain.AVALANCHE,
    //       returnValues: { destinationChain: EvmChain.MOONBEAM },
    //     },
    //   });
    //   const mockGetEvmEvent = vitest.spyOn(api, "getEvmEvent");
    //   mockGetEvmEvent.mockResolvedValueOnce(evmEventStubResponse());
    //   const mockConfirmGatewayTx = vitest.spyOn(api, "confirmGatewayTx");
    //   mockConfirmGatewayTx.mockResolvedValueOnce(axelarTxResponseStub());
    //   const mockcreatePendingTransfer = vitest.spyOn(api, "createPendingTransfers");
    //   mockcreatePendingTransfer.mockResolvedValueOnce(axelarTxResponseStub());
    //   const mockSignCommandTx = vitest.spyOn(api, "signCommands");
    //   const signCommandStub = axelarTxResponseStub([
    //     {
    //       events: [
    //         {
    //           type: "sign",
    //           attributes: [
    //             {
    //               key: "batchedCommandId",
    //               value: "0x123",
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //   ]);
    //   mockSignCommandTx.mockResolvedValueOnce(signCommandStub);

    //   const mockQueryBatchedCommand = vitest.spyOn(api, "queryBatchedCommands");
    //   mockQueryBatchedCommand.mockResolvedValue(batchedCommandResponseStub());

    //   const response = await api.manualRelayToDestChain("0x");

    //   expect(response).toEqual({
    //     success: false,
    //     error: ApproveGatewayError.ERROR_BATCHED_COMMAND,
    //     confirmTx: axelarTxResponseStub(),
    //     createPendingTransferTx: axelarTxResponseStub(),
    //     signCommandTx: signCommandStub,
    //   });
    // });
    // test.skip("it shouldn't call approve given the sign command returns 'no command to sign found'", async () => {
    //   const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
    //   mockQueryTransactionStatus.mockResolvedValueOnce({
    //     status: GMPStatus.SRC_GATEWAY_CALLED,
    //     callTx: {
    //       chain: EvmChain.AVALANCHE,
    //       returnValues: { destinationChain: EvmChain.MOONBEAM },
    //     },
    //   });
    //   const mockConfirmGatewayTx = vitest.spyOn(api, "confirmGatewayTx");
    //   mockConfirmGatewayTx.mockResolvedValueOnce(axelarTxResponseStub());
    //   const mockcreatePendingTransfer = vitest.spyOn(api, "createPendingTransfers");
    //   mockcreatePendingTransfer.mockResolvedValueOnce(axelarTxResponseStub());
    //   const mockSignCommandTx = vitest.spyOn(api, "signCommands");
    //   const signCommandStub = axelarTxResponseStub([
    //     {
    //       events: [],
    //     },
    //   ]);
    //   mockSignCommandTx.mockResolvedValueOnce(signCommandStub);

    //   const response = await api.manualRelayToDestChain("0x");

    //   expect(response).toEqual({
    //     success: false,
    //     error: ApproveGatewayError.SIGN_COMMAND_FAILED,
    //     confirmTx: axelarTxResponseStub(),
    //     createPendingTransferTx: axelarTxResponseStub(),
    //     signCommandTx: signCommandStub,
    //   });
    // });
    // test.skip("it shouldn't call approve given the account sequence mismatch", async () => {
    //   const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
    //   mockQueryTransactionStatus.mockResolvedValueOnce({
    //     status: GMPStatus.SRC_GATEWAY_CALLED,
    //     callTx: {
    //       chain: EvmChain.AVALANCHE,
    //       returnValues: { destinationChain: EvmChain.MOONBEAM },
    //     },
    //   });
    //   const mockConfirmGatewayTx = vitest.spyOn(api, "confirmGatewayTx");
    //   mockConfirmGatewayTx.mockRejectedValueOnce(new Error("account sequence mismatch"));

    //   const response = await api.manualRelayToDestChain("0x");

    //   expect(response).toEqual({
    //     success: false,
    //     error: ApproveGatewayError.ERROR_ACCOUNT_SEQUENCE_MISMATCH,
    //   });
    // });
    // test.skip("it shouldn't call approve given the error has thrown before finish", async () => {
    //   const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
    //   mockQueryTransactionStatus.mockResolvedValueOnce({
    //     status: GMPStatus.SRC_GATEWAY_CALLED,
    //     callTx: {
    //       chain: EvmChain.AVALANCHE,
    //       returnValues: { destinationChain: EvmChain.MOONBEAM },
    //     },
    //   });
    //   const mockConfirmGatewayTx = vitest.spyOn(api, "confirmGatewayTx");
    //   mockConfirmGatewayTx.mockRejectedValueOnce(new Error("unknown error"));

    //   const response = await api.manualRelayToDestChain("0x");

    //   expect(response).toEqual({
    //     success: false,
    //     error: ApproveGatewayError.ERROR_UNKNOWN,
    //   });
    // });
    // test.skip("it should call approve successfully", async () => {
    //   const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
    //   mockQueryTransactionStatus.mockResolvedValueOnce({
    //     status: GMPStatus.SRC_GATEWAY_CALLED,
    //     callTx: {
    //       chain: EvmChain.AVALANCHE,
    //       returnValues: { destinationChain: EvmChain.MOONBEAM },
    //     },
    //   });
    //   const mockConfirmGatewayTx = vitest.spyOn(api, "confirmGatewayTx");
    //   mockConfirmGatewayTx.mockResolvedValueOnce(axelarTxResponseStub());
    //   const mockcreatePendingTransfer = vitest.spyOn(api, "createPendingTransfers");
    //   mockcreatePendingTransfer.mockResolvedValueOnce(axelarTxResponseStub());
    //   const mockSignCommandTx = vitest.spyOn(api, "signCommands");
    //   const signCommandStub = axelarTxResponseStub([
    //     {
    //       events: [
    //         {
    //           type: "sign",
    //           attributes: [
    //             {
    //               key: "batchedCommandId",
    //               value: "0x123",
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //   ]);
    //   mockSignCommandTx.mockResolvedValueOnce(signCommandStub);

    //   const mockQueryBatchedCommand = vitest.spyOn(api, "queryBatchedCommands");
    //   mockQueryBatchedCommand.mockResolvedValueOnce(batchedCommandResponseStub("0x456"));
    //   const mockApproveTx = vitest.spyOn(api, "sendApproveTx");
    //   const mockTransaction = { transactionHash: "0x123456" };
    //   mockApproveTx.mockResolvedValueOnce(mockTransaction);

    //   const response = await api.manualRelayToDestChain("0x");

    //   expect(response).toEqual({
    //     success: true,
    //     confirmTx: axelarTxResponseStub(),
    //     createPendingTransferTx: axelarTxResponseStub(),
    //     signCommandTx: signCommandStub,
    //     approveTx: mockTransaction,
    //   });
    // });
  });

  describe.skip("calculateNativeGasFee", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    let contract: Contract;
    let userWallet: Wallet;
    let usdc: Contract;
    let provider: ethers.providers.Web3Provider;
    const tokenSymbol = "aUSDC";

    beforeAll(async () => {
      // Create a source chain network
      const srcChain = await createNetwork({ name: EvmChain.AVALANCHE });
      userWallet = srcChain.adminWallets[0];
      provider = srcChain.provider as ethers.providers.Web3Provider;
      const args = [srcChain.gateway.address, srcChain.gasReceiver.address];

      // Deploy test contract
      contract = await utils.deployContract(userWallet, DistributionExecutable, args as any);
      usdc = await srcChain.deployToken("Axelar Wrapped aUSDC", "aUSDC", 6, BigInt(1e70));

      // Send USDC to the user wallet for testing
      await srcChain.giveToken(userWallet.address, tokenSymbol, BigInt("10000000"));

      // Approve token before running any test
      await usdc
        .connect(userWallet)
        .approve(contract.address, ethers.constants.MaxUint256)
        .then((tx: ContractTransaction) => tx.wait(1));

      vitest.spyOn(api.axelarQueryApi, "getActiveChains").mockResolvedValue(activeChainsStub());
    });

    test("it should return 'gas required' - 'gas paid' given 'gas required' > 'gas paid'", async () => {
      const gasPaid = ethers.utils.parseEther("1");
      const gasRequired = ethers.utils.parseEther("2");

      // Send transaction at the source chain with some gas.
      const tx = await contract
        .connect(userWallet)
        .sendToMany(
          EvmChain.MOONBEAM,
          ethers.constants.AddressZero,
          [ethers.constants.AddressZero],
          tokenSymbol,
          "10000",
          {
            value: gasPaid,
          }
        )
        .then((tx: ContractTransaction) => tx.wait());

      vitest
        .spyOn(api.axelarQueryApi, "estimateGasFee")
        .mockResolvedValueOnce(gasRequired.toString());
      vitest.spyOn(api.axelarQueryApi, "getActiveChains").mockResolvedValueOnce(activeChainsStub());

      // Calculate how many gas we need to add more.
      const wantedGasFee = await api.calculateNativeGasFee(
        tx.transactionHash,
        EvmChain.AVALANCHE,
        EvmChain.MOONBEAM,
        GasToken.AVAX,
        { provider }
      );

      return expect(wantedGasFee).toBe(gasRequired.sub(gasPaid).toString());
    });

    test("it should return 0 given 'gas paid' >= 'gas required'", async () => {
      const gasPaid = ethers.utils.parseEther("10");
      const gasRequired = ethers.utils.parseEther("2");

      // Send transaction at the source chain with overpaid gas.
      const tx = await contract
        .connect(userWallet)
        .sendToMany(
          EvmChain.MOONBEAM,
          ethers.constants.AddressZero,
          [ethers.constants.AddressZero],
          tokenSymbol,
          "10000",
          {
            value: gasPaid,
          }
        )
        .then((tx: ContractTransaction) => tx.wait());

      vitest
        .spyOn(api.axelarQueryApi, "estimateGasFee")
        .mockResolvedValueOnce(gasRequired.toString());

      // Calculate how many gas we need to add more.
      const wantedGasFee = await api.calculateNativeGasFee(
        tx.transactionHash,
        EvmChain.AVALANCHE,
        EvmChain.MOONBEAM,
        GasToken.AVAX,
        { provider }
      );

      return expect(wantedGasFee).toBe("0");
    });
  });

  describe.skip("addNativeGas", () => {
    let api: AxelarGMPRecoveryAPI;
    let contract: Contract;
    let userWallet: Wallet;
    let provider: ethers.providers.Web3Provider;
    let gasReceiverContract: Contract;
    let usdc: Contract;
    let addNativeGasOptions: AddGasOptions;
    const chain = EvmChain.AVALANCHE;
    const tokenSymbol = "aUSDC";

    beforeEach(() => {
      api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });
      vitest.clearAllMocks();
      vitest
        .spyOn(api.axelarQueryApi, "getContractAddressFromConfig")
        .mockResolvedValue(gasReceiverContract.address);

      vitest.spyOn(api.axelarQueryApi, "getActiveChains").mockResolvedValue(activeChainsStub());
    });

    beforeAll(async () => {
      // Create a source chain network
      const srcChain = await createNetwork({ name: chain });
      gasReceiverContract = srcChain.gasReceiver;

      userWallet = srcChain.adminWallets[0];
      provider = srcChain.provider as ethers.providers.Web3Provider;
      usdc = await (
        await srcChain.deployToken("Axelar Wrapped aUSDC", "aUSDC", 6, BigInt(1e70))
      ).connect(userWallet);

      // Override the provider and wallet to use data from the local network
      addNativeGasOptions = {
        evmWalletDetails: {
          useWindowEthereum: false,
          privateKey: userWallet.privateKey,
          provider,
        },
      };

      const args = [srcChain.gateway.address, srcChain.gasReceiver.address];

      // Deploy test contract
      contract = await utils
        .deployContract(userWallet, DistributionExecutable, args as any)
        .then((contract: Contract) => contract.connect(userWallet));

      // Send USDC to the user wallet for testing
      await srcChain.giveToken(userWallet.address, tokenSymbol, BigInt("10000000"));

      // Approve token before running any test
      await usdc
        .approve(contract.address, ethers.constants.MaxUint256)
        .then((tx: ContractTransaction) => tx.wait(1));
    });

    test("it shouldn't call 'addNativeGas' given tx is already executed", async () => {
      const gasPaid = ethers.utils.parseEther("0.000001");

      // Send transaction at the source chain with some gas.
      const tx: ContractReceipt = await contract
        .sendToMany(
          EvmChain.MOONBEAM,
          ethers.constants.AddressZero,
          [ethers.constants.AddressZero],
          tokenSymbol,
          "10000",
          {
            value: gasPaid,
          }
        )
        .then((tx: ContractTransaction) => tx.wait());

      // Mock that this transaction is already executed.
      vitest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(true));

      // Call addNativeGas function
      const response = await api.addNativeGas(
        EvmChain.AVALANCHE,
        tx.transactionHash,
        addNativeGasOptions
      );

      expect(response).toEqual(AlreadyExecutedError());
    });

    test("it shouldn't call 'addNativeGas' given tx doesn't exist", async () => {
      // Override the provider and wallet to use data from the local network
      const addNativeGasOptions = {
        evmWalletDetails: {
          useWindowEthereum: false,
          privateKey: userWallet.privateKey,
          provider,
        },
      };

      // Call addNativeGas function by passing non-existing tx hash
      const response = await api.addNativeGas(
        chain,
        "0xcd1edb36c37caadf852c4614e3bed1082528d7c6a8d2de3fff3c596f8e675b90", // random tx hash
        addNativeGasOptions
      );

      // Validate response
      expect(response).toEqual(InvalidTransactionError(chain));
    });

    test("it shouldn't call 'addNativeGas' given tx is not gmp call", async () => {
      // Sending non-gmp transaction
      const notGmpTx = await usdc
        .transfer("0x0000000000000000000000000000000000000001", "1")
        .then((tx: ContractTransaction) => tx.wait());

      // Call addNativeGas function and passing non-gmp tx hash
      const response = await api.addNativeGas(
        chain,
        notGmpTx.transactionHash, // random tx hash
        addNativeGasOptions
      );

      // Validate response
      expect(response).toEqual(NotGMPTransactionError());
    });

    test("it shouldn't call 'addNativeGas' given gas is already overpaid", async () => {
      const gasPaid = ethers.utils.parseEther("10");

      // Send transaction at the source chain with overpaid gas
      const tx: ContractReceipt = await contract
        .sendToMany(
          EvmChain.MOONBEAM,
          ethers.constants.AddressZero,
          [ethers.constants.AddressZero],
          tokenSymbol,
          "10000",
          {
            value: gasPaid,
          }
        )
        .then((tx: ContractTransaction) => tx.wait());
      vitest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(false));
      vitest.spyOn(api.axelarQueryApi, "estimateGasFee").mockResolvedValueOnce(gasPaid.toString());

      // Call addNativeGas function
      const response = await api.addNativeGas(chain, tx.transactionHash, addNativeGasOptions);

      expect(response).toEqual(AlreadyPaidGasFeeError());
    });

    test("it shouldn't call 'addNativeGas' given gasPrice api is not available and gas amount is not specified", async () => {
      // Override the provider and wallet to use data from the local network
      const addNativeGasOptions = {
        evmWalletDetails: {
          useWindowEthereum: false,
          privateKey: userWallet.privateKey,
          provider,
        },
      };

      const gasPaid = ethers.utils.parseEther("10");

      // Send transaction at the source chain with overpaid gas
      const tx: ContractReceipt = await contract
        .connect(userWallet)
        .sendToMany(
          EvmChain.MOONBEAM,
          ethers.constants.AddressZero,
          [ethers.constants.AddressZero],
          tokenSymbol,
          "10000",
          {
            value: gasPaid,
          }
        )
        .then((tx: ContractTransaction) => tx.wait());

      // Simulate gasPrice api error
      vitest
        .spyOn(api.axelarQueryApi, "estimateGasFee")
        .mockRejectedValueOnce(() => Promise.reject());
      vitest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(false));

      // Call addNativeGas function
      const response = await api.addNativeGas(
        chain, // Passing wrong value here will cause the gas price api to return error
        tx.transactionHash,
        addNativeGasOptions
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe("Couldn't query the gas price");
    });

    test("it should call 'addNativeGas' with specified amount in 'options' object without calling 'calculateNativeGasFee' function", async () => {
      const gasPaid = ethers.utils.parseEther("1");
      const tx: ContractReceipt = await contract
        .sendToMany(
          EvmChain.MOONBEAM,
          ethers.constants.AddressZero,
          [ethers.constants.AddressZero],
          tokenSymbol,
          "10000",
          {
            value: gasPaid,
          }
        )
        .then((tx: ContractTransaction) => tx.wait());

      const manualAddedGasAmount = ethers.utils.parseEther("2");

      // Manually specify gas amount
      const overpaidAddNativeGasOptions = {
        ...addNativeGasOptions,
        amount: manualAddedGasAmount.toString(),
      };

      // Mock that this transaction is already executed.
      vitest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(false));
      const calculateNativeGasFeeFunction = vitest
        .spyOn(api, "calculateNativeGasFee")
        .mockResolvedValueOnce("9");

      // Call addNativeGas function
      const response = await api.addNativeGas(
        chain,
        tx.transactionHash,
        overpaidAddNativeGasOptions
      );

      const signatureNativeGasAdded = ethers.utils.id(
        "NativeGasAdded(bytes32,uint256,uint256,address)"
      );
      const nativeGasAddedEvent = findContractEvent(
        response.transaction as ContractReceipt,
        [signatureNativeGasAdded],
        new Interface([
          "event NativeGasAdded(bytes32 indexed txHash,  uint256 indexed logIndex, uint256 gasFeeAmount, address refundAddress)",
        ])
      );

      // Validate event data
      const args = nativeGasAddedEvent?.eventLog.args;
      const eventGasFeeAmount = args?.gasFeeAmount?.toString();

      expect(calculateNativeGasFeeFunction).not.toHaveBeenCalled();
      expect(response.success).toBe(true);
      // Validate that the additional gas fee is equal to "total gas fee" - "gas paid".
      expect(eventGasFeeAmount).toBe(manualAddedGasAmount.toString());
    });

    test("it should call 'addNativeGas' successfully", async () => {
      const gasPaid = ethers.utils.parseEther("1");

      // Send transaction at the source chain with some gas.
      const tx: ContractReceipt = await contract
        .sendToMany(
          EvmChain.MOONBEAM,
          ethers.constants.AddressZero,
          [ethers.constants.AddressZero],
          tokenSymbol,
          "10000",
          {
            value: gasPaid,
          }
        )
        .then((tx: ContractTransaction) => tx.wait());

      // Mock that this transaction is already executed.
      vitest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(false));

      // Mock the this transaction requires 2 ETH gas to be paid.
      const mockedGasFee = ethers.utils.parseEther("2").toString();
      vitest.spyOn(api.axelarQueryApi, "estimateGasFee").mockResolvedValueOnce(mockedGasFee);

      // Call addNativeGas function
      const response = await api.addNativeGas(chain, tx.transactionHash, addNativeGasOptions);

      // Validate response structure
      expect(response.success).toBe(true);
      expect(response.transaction).toBeDefined();

      const signatureNativeGasAdded = ethers.utils.id(
        "NativeGasAdded(bytes32,uint256,uint256,address)"
      );
      const nativeGasAddedEvent = findContractEvent(
        response.transaction as ContractReceipt,
        [signatureNativeGasAdded],
        new Interface([
          "event NativeGasAdded(bytes32 indexed txHash, uint256 indexed logIndex, uint256 gasFeeAmount, address refundAddress)",
        ])
      );

      // Calculate how many gas we need to add more.
      const expectedLogIndex = getLogIndexFromTxReceipt(tx);

      // Validate event data
      const args = nativeGasAddedEvent?.eventLog.args;
      const eventGasFeeAmount = args?.gasFeeAmount?.toString();
      expect(args?.logIndex?.toNumber()).toBe(expectedLogIndex);

      // Validate that the additional gas fee is equal to "total gas fee" - "gas paid".
      expect(eventGasFeeAmount).toBe(ethers.BigNumber.from(mockedGasFee).sub(gasPaid).toString());
      expect(args?.refundAddress).toBe(userWallet.address);
    });
  });

  describe.skip("addGas", () => {
    let api: AxelarGMPRecoveryAPI;
    let contract: Contract;
    let userWallet: Wallet;
    let provider: ethers.providers.Web3Provider;
    let gasReceiverContract: Contract;
    let usdc: Contract;
    const chain = EvmChain.AVALANCHE;
    const tokenSymbol = "aUSDC";
    // Override the provider and wallet to use data from the local network
    let addGasOptions: AddGasOptions;

    beforeEach(() => {
      vitest.clearAllMocks();
      api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });
      vitest
        .spyOn(api.axelarQueryApi, "getContractAddressFromConfig")
        .mockResolvedValueOnce(gasReceiverContract.address);
      vitest.spyOn(api.axelarQueryApi, "getActiveChains").mockResolvedValue(activeChainsStub());
    });

    beforeAll(async () => {
      // Create a source chain network
      const srcChain = await createNetwork({ name: chain });
      gasReceiverContract = srcChain.gasReceiver;

      userWallet = srcChain.adminWallets[0];
      provider = srcChain.provider as ethers.providers.Web3Provider;
      usdc = await srcChain
        .deployToken("Axelar Wrapped aUSDC", "aUSDC", 6, BigInt(1e70))
        .then((usdc) => usdc.connect(userWallet));
      addGasOptions = {
        evmWalletDetails: {
          useWindowEthereum: false,
          privateKey: userWallet.privateKey,
          provider,
        },
      };
      const args = [srcChain.gateway.address, srcChain.gasReceiver.address];

      // Deploy test contract
      contract = await utils
        .deployContract(userWallet, DistributionExecutableWithGasToken, args as any)
        .then((contract: Contract) => contract.connect(userWallet));

      // Send USDC to the user wallet for testing
      await srcChain.giveToken(
        userWallet.address,
        tokenSymbol,
        BigInt(ethers.utils.parseEther("1000000").toString())
      );

      // Approve token before running any test
      await usdc
        .approve(contract.address, ethers.constants.MaxUint256)
        .then((tx: ContractTransaction) => tx.wait(1));

      await usdc
        .approve(gasReceiverContract.address, ethers.constants.MaxUint256)
        .then((tx: ContractTransaction) => tx.wait(1));

      // This is a hacky way to set the gateway object to local gateway contract address
      AXELAR_GATEWAY[Environment.TESTNET][chain] = srcChain.gateway.address;
    });

    test("it shouldn't call 'addGas' given tx is already executed", async () => {
      const amount = ethers.utils.parseEther("0.0001");
      const gasPaid = ethers.utils.parseEther("0.000001");

      // Send transaction at the source chain with some gas.
      const tx: ContractReceipt = await contract
        .sendToMany(
          EvmChain.MOONBEAM,
          ethers.constants.AddressZero,
          [ethers.constants.AddressZero],
          tokenSymbol,
          amount,
          usdc.address,
          gasPaid
        )
        .then((tx: ContractTransaction) => tx.wait());

      // Mock that this transaction is already executed.
      vitest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(true));

      // Call addGas function
      const response = await api.addGas(
        EvmChain.AVALANCHE,
        tx.transactionHash,
        usdc.address,
        addGasOptions
      );

      expect(response).toEqual(AlreadyExecutedError());
    });

    test("it shouldn't call 'addGas' given tx doesn't exist", async () => {
      // Call addNativeGas function by passing non-existing tx hash
      const response = await api.addGas(
        chain,
        "0xcd1edb36c37caadf852c4614e3bed1082528d7c6a8d2de3fff3c596f8e675b90", // random tx hash
        usdc.address,
        addGasOptions
      );

      // Validate response
      expect(response).toEqual(InvalidTransactionError(chain));
    });

    test("it shouldn't call 'addGas' given tx is not gmp call", async () => {
      // Sending non-gmp transaction
      const notGmpTx = await usdc
        .transfer("0x0000000000000000000000000000000000000001", "1")
        .then((tx: ContractTransaction) => tx.wait());

      // Call addNativeGas function and passing non-gmp tx hash
      const response = await api.addGas(
        chain,
        notGmpTx.transactionHash, // random tx hash
        usdc.address,
        addGasOptions
      );

      // Validate response
      expect(response).toEqual(NotGMPTransactionError());
    });

    test("it shouldn't call 'addGas' given gas is already overpaid", async () => {
      const decimals = await usdc.decimals();
      const gasPaid = ethers.utils.parseUnits("100", decimals);

      // Send transaction at the source chain with overpaid gas
      const tx: ContractReceipt = await contract
        .connect(userWallet)
        .sendToMany(
          EvmChain.MOONBEAM,
          ethers.constants.AddressZero,
          [ethers.constants.AddressZero],
          tokenSymbol,
          "10000",
          usdc.address,
          gasPaid
        )
        .then((tx: ContractTransaction) => tx.wait());

      vitest.spyOn(api, "isExecuted").mockResolvedValueOnce(false);

      // Mock total gas fee is 0.1 USDC
      vitest
        .spyOn(api.axelarQueryApi, "estimateGasFee")
        .mockResolvedValue(ethers.utils.parseUnits("0.1", decimals).toString());

      // Call addGas function
      const response = await api.addGas(chain, tx.transactionHash, usdc.address, addGasOptions);

      expect(response).toEqual(AlreadyPaidGasFeeError());
    });

    test("it shouldn't call 'addGas' given gasPrice api is not available and gas amount is not specified", async () => {
      const gasPaid = ethers.utils.parseEther("10");

      // Send transaction at the source chain with overpaid gas
      const tx: ContractReceipt = await contract
        .sendToMany(
          EvmChain.MOONBEAM,
          ethers.constants.AddressZero,
          [ethers.constants.AddressZero],
          tokenSymbol,
          "10000",
          usdc.address,
          gasPaid
        )
        .then((tx: ContractTransaction) => tx.wait());

      vitest.spyOn(api, "isExecuted").mockResolvedValueOnce(false);
      // Simulate gasPrice api error
      vitest
        .spyOn(api.axelarQueryApi, "estimateGasFee")
        .mockRejectedValueOnce("unable to fetch gas price");

      // Call addNativeGas function
      const response = await api.addGas(
        chain, // Passing wrong value here will cause the gas price api to return error
        tx.transactionHash,
        usdc.address,
        addGasOptions
      );

      expect(response).toEqual(GasPriceAPIError());
    });

    test("it shouldn't call 'addGas' given 'gasTokenAddress' does not exist", async () => {
      const gasPaid = ethers.utils.parseEther("0.00001");

      // Send transaction at the source chain with overpaid gas
      const tx: ContractReceipt = await contract
        .sendToMany(
          EvmChain.MOONBEAM,
          ethers.constants.AddressZero,
          [ethers.constants.AddressZero],
          tokenSymbol,
          "10000",
          usdc.address,
          gasPaid
        )
        .then((tx: ContractTransaction) => tx.wait());

      // Simulate gasPrice api error
      vitest
        .spyOn(api.axelarQueryApi, "estimateGasFee")
        .mockRejectedValueOnce(() => Promise.reject());

      // Call addGas function
      const response = await api.addGas(
        chain,
        tx.transactionHash,
        ethers.constants.AddressZero,
        addGasOptions
      );

      expect(response).toEqual(InvalidGasTokenError());
    });

    test("it shouldn't call 'addGas' given `gasTokenAddress` is not supported by Axelar", async () => {
      const testToken = await utils
        .deployContract(userWallet, TestToken, ["100000000000"] as any)
        .then((contract: Contract) => contract.connect(userWallet));

      const gasPaid = ethers.utils.parseEther("0.00001");

      // Send transaction at the source chain with overpaid gas
      const tx: ContractReceipt = await contract
        .sendToMany(
          EvmChain.MOONBEAM,
          ethers.constants.AddressZero,
          [ethers.constants.AddressZero],
          tokenSymbol,
          "10000",
          usdc.address,
          gasPaid
        )
        .then((tx: ContractTransaction) => tx.wait());

      // Simulate gasPrice api error
      vitest
        .spyOn(api.axelarQueryApi, "estimateGasFee")
        .mockRejectedValueOnce(() => Promise.reject());

      // Call addGas function
      const response = await api.addGas(
        chain,
        tx.transactionHash,
        testToken.address,
        addGasOptions
      );

      expect(response).toEqual(UnsupportedGasTokenError(testToken.address));
    });

    test("it should call 'addGas' with specified amount in 'options' object without calling 'calculateGasFee' function", async () => {
      const gasPaid = ethers.utils.parseEther("0.00001");

      // Send transaction at the source chain with overpaid gas
      const tx: ContractReceipt = await contract
        .sendToMany(
          EvmChain.MOONBEAM,
          ethers.constants.AddressZero,
          [ethers.constants.AddressZero],
          tokenSymbol,
          "10000",
          usdc.address,
          gasPaid
        )
        .then((tx: ContractTransaction) => tx.wait());

      // Override the amount, so it should call contract's addGas even the gas price api returns error
      const overridedAddGasOptions = {
        ...addGasOptions,
        amount: ethers.utils.parseEther("10").toString(),
      };

      vitest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(false));
      const calculateGasFeeFunction = vitest.spyOn(api, "calculateGasFee");

      // Call addGas function
      const response = await api.addGas(
        chain,
        tx.transactionHash,
        usdc.address,
        overridedAddGasOptions
      );

      expect(response.success).toBe(true);
      expect(calculateGasFeeFunction).not.toHaveBeenCalled();

      // Validate event data
      const signatureGasAdded = ethers.utils.id(
        "GasAdded(bytes32,uint256,address,uint256,address)"
      );
      const gasAddedEvent = findContractEvent(
        response.transaction as ContractReceipt,
        [signatureGasAdded],
        new Interface([
          "event GasAdded(bytes32 indexed txHash, uint256 indexed logIndex, address gasToken, uint256 gasFeeAmount, address refundAddress)",
        ])
      );
      const args = gasAddedEvent?.eventLog.args;
      const eventGasFeeAmount = args?.gasFeeAmount?.toString();
      expect(eventGasFeeAmount).toBe(overridedAddGasOptions.amount);
    });

    test("it should call 'addGas' successfully", async () => {
      const gasPaid = ethers.utils.parseEther("1");

      // Send transaction at the source chain with some gas.
      const tx: ContractReceipt = await contract
        .sendToMany(
          EvmChain.MOONBEAM,
          ethers.constants.AddressZero,
          [ethers.constants.AddressZero],
          tokenSymbol,
          "10000",
          usdc.address,
          gasPaid
        )
        .then((tx: ContractTransaction) => tx.wait());

      vitest.spyOn(api, "isExecuted").mockResolvedValueOnce(false);
      const mockedGasFee = ethers.utils.parseEther("2").toString();
      vitest.spyOn(api.axelarQueryApi, "estimateGasFee").mockResolvedValue(mockedGasFee);

      // Call addGas function
      const response = await api.addGas(chain, tx.transactionHash, usdc.address, addGasOptions);

      // Validate response structure
      expect(response.success).toBe(true);
      expect(response.transaction).toBeDefined();

      const signatureGasAdded = ethers.utils.id(
        "GasAdded(bytes32,uint256,address,uint256,address)"
      );
      const gasAddedEvent = findContractEvent(
        response.transaction as ContractReceipt,
        [signatureGasAdded],
        new Interface([
          "event GasAdded(bytes32 indexed txHash, uint256 indexed logIndex, address gasToken, uint256 gasFeeAmount, address refundAddress)",
        ])
      );

      // Calculate how many gas we need to add more.
      const expectedLogIndex = getLogIndexFromTxReceipt(tx);

      // Validate event data
      const args = gasAddedEvent?.eventLog.args;
      const eventGasFeeAmount = args?.gasFeeAmount?.toString();

      expect(args?.logIndex?.toNumber()).toBe(expectedLogIndex);
      expect(eventGasFeeAmount).toBe(ethers.BigNumber.from(mockedGasFee).sub(gasPaid).toString());
      expect(args?.refundAddress).toBe(userWallet.address);
    });
  });

  describe.skip("execute", () => {
    let api: AxelarGMPRecoveryAPI;
    const wallet = Wallet.createRandom();
    const evmWalletDetails: EvmWalletDetails = {
      privateKey: wallet.privateKey,
    };

    beforeEach(async () => {
      vitest.clearAllMocks();
      api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });
    });

    test("it shouldn't call 'execute' given tx is already executed", async () => {
      const mockApi = vitest.spyOn(api, "queryExecuteParams");
      mockApi.mockResolvedValueOnce({ status: GMPStatus.DEST_EXECUTED });

      const response = await api.execute(
        "0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae",
        undefined,
        evmWalletDetails
      );

      expect(response).toEqual(AlreadyExecutedError());
    });

    test("it shouldn't call 'execute' given tx has not approved yet", async () => {
      const mockApi = vitest.spyOn(api, "queryExecuteParams");
      mockApi.mockResolvedValueOnce({ status: GMPStatus.SRC_GATEWAY_CALLED });

      const response = await api.execute(
        "0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae",
        undefined,
        evmWalletDetails
      );

      expect(response).toEqual(NotApprovedError());
    });

    test("it shouldn't call 'execute' given gmp api error", async () => {
      const mockApi = vitest.spyOn(api, "queryExecuteParams");
      mockApi.mockResolvedValueOnce(undefined);

      const response = await api.execute(
        "0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae",
        undefined,
        evmWalletDetails
      );

      expect(response).toEqual(GMPQueryError());
    });

    test("it calls 'execute' and return revert error given 'callExecute' throws 'CALL_EXECUTE_ERROR.REVERT' error", async () => {
      // mock query api
      const executeParams = executeParamsStub();
      const mockApi = vitest.spyOn(api, "queryExecuteParams");
      mockApi.mockResolvedValueOnce({
        status: GMPStatus.DEST_GATEWAY_APPROVED,
        data: executeParams,
      });

      // Mock contract call is failed
      const error = new Error(ContractCallHelper.CALL_EXECUTE_ERROR.REVERT);
      vitest.spyOn(ContractCallHelper, "callExecute").mockRejectedValueOnce(error);

      // Mock private saveGMP
      const mockGMPApi = vitest.spyOn(AxelarGMPRecoveryAPI.prototype as any, "saveGMP");
      mockGMPApi.mockImplementation(() => Promise.resolve(undefined));

      const sourceTxHash = "0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae";
      const response = await api.execute(sourceTxHash, undefined, evmWalletDetails);

      // Expect returns error
      expect(response).toEqual(ExecutionRevertedError(executeParams));

      // Expect we don't call saveGMP api
      expect(mockGMPApi).toHaveBeenCalledWith(
        sourceTxHash,
        new ethers.Wallet(evmWalletDetails.privateKey as string).address,
        "",
        response.error
      );
    });

    test("it calls 'execute' and return revert error given 'callExecute' throws 'CALL_EXECUTE_ERROR.INSUFFICIENT_FUNDS' error", async () => {
      // mock query api
      const executeParams = executeParamsStub();
      const mockApi = vitest.spyOn(api, "queryExecuteParams");
      mockApi.mockResolvedValueOnce({
        status: GMPStatus.DEST_GATEWAY_APPROVED,
        data: executeParams,
      });

      // Mock contract call is failed
      const error = new Error(ContractCallHelper.CALL_EXECUTE_ERROR.INSUFFICIENT_FUNDS);
      vitest.spyOn(ContractCallHelper, "callExecute").mockRejectedValueOnce(error);

      // Mock private saveGMP
      const mockGMPApi = vitest.spyOn(AxelarGMPRecoveryAPI.prototype as any, "saveGMP");
      mockGMPApi.mockImplementation(() => Promise.resolve(undefined));

      const sourceTxHash = "0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae";
      const response = await api.execute(sourceTxHash, undefined, evmWalletDetails);

      // Expect returns error
      expect(response).toEqual(InsufficientFundsError(executeParams));

      // Expect we don't call saveGMP api
      expect(mockGMPApi).toHaveBeenCalledWith(
        sourceTxHash,
        new ethers.Wallet(evmWalletDetails.privateKey as string).address,
        "",
        response.error
      );
    });

    test("it should call 'execute' and return success = true", async () => {
      // mock query api
      const mockApi = vitest.spyOn(api, "queryExecuteParams");
      const executeParams = executeParamsStub();
      mockApi.mockResolvedValueOnce({
        status: GMPStatus.DEST_GATEWAY_APPROVED,
        data: executeParams,
      });

      // Mock contract call is successful
      vitest.spyOn(ContractCallHelper, "callExecute").mockResolvedValueOnce(contractReceiptStub());

      // Mock private saveGMP
      const mockGMPApi = vitest.spyOn(AxelarGMPRecoveryAPI.prototype as any, "saveGMP");
      mockGMPApi.mockImplementation(() => Promise.resolve(undefined));

      const response = await api.execute(
        "0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae",
        undefined,
        evmWalletDetails
      );

      const {
        commandId,
        sourceChain,
        sourceAddress,
        payload,
        symbol,
        amount,
        isContractCallWithToken,
      } = executeParams;
      const functionName = isContractCallWithToken ? "executeWithToken" : "execute";

      expect(response).toEqual({
        success: true,
        transaction: contractReceiptStub(),
        data: {
          functionName,
          args: {
            commandId,
            sourceChain,
            sourceAddress,
            payload,
            symbol,
            amount,
          },
        },
      });

      expect(mockGMPApi).toHaveBeenCalledTimes(1);
    });
  });
});
