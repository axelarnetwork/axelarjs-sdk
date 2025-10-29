/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AxelarGMPRecoveryAPI, RouteDir } from "../../TransactionRecoveryApi/AxelarGMPRecoveryAPI";
import {
  AddGasOptions,
  ApproveGatewayError,
  AxelarTxResponse,
  Environment,
  EvmWalletDetails,
} from "../../types";
import { Secp256k1Keypair } from "@mysten/sui/keypairs/secp256k1";
import { EvmChain } from "../../../constants/EvmChain";
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
import { GMPStatus } from "../../TransactionRecoveryApi/AxelarRecoveryApi";
import * as ContractCallHelper from "../../TransactionRecoveryApi/helpers/contractCallHelper";
import {
  activeChainsStub,
  axelarTxResponseStub,
  batchCommandStub,
  chainInfoStub,
  contractReceiptStub,
  evmEventStubResponse,
  executeParamsStub,
  findEventAndConfirmStub,
} from "../stubs";
import * as Sleep from "../../../utils/sleep";
import { EventResponse } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/query";
import { ChainInfo } from "../../../chains/types";
import { Event_Status } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/types";
import { Horizon } from "@stellar/stellar-sdk";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";
import * as chains from "../../../chains";
import { STANDARD_FEE } from "../../AxelarSigningClient";
import { coin, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

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

  describe("findEventAndConfirmIfNeeded", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    test("It should confirm an event if needed", async () => {
      const mockConfirmGatewayTx = vitest
        .spyOn(api, "confirmGatewayTx")
        .mockResolvedValue(axelarTxResponseStub());

      const mockEvmEvent = vitest
        .spyOn(api, "getEvmEvent")
        .mockResolvedValue(evmEventStubResponse());

      vitest.spyOn(api, "isEVMEventCompleted").mockReturnValueOnce(false).mockReturnValueOnce(true);
      vitest.spyOn(api, "isEVMEventConfirmed").mockReturnValueOnce(false);

      const mockDoesTxMeetConfirmHt = vitest
        .spyOn(api, "doesTxMeetConfirmHt")
        .mockResolvedValue(true);

      const txHash = "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503";
      const response = await api.findEventAndConfirmIfNeeded(
        EvmChain.AVALANCHE,
        EvmChain.POLYGON,
        txHash,
        undefined,
        evmWalletDetails
      );
      expect(mockEvmEvent).toHaveBeenCalledWith(
        EvmChain.AVALANCHE,
        EvmChain.POLYGON,
        txHash,
        undefined
      );
      expect(mockEvmEvent).toHaveBeenCalledWith(
        EvmChain.AVALANCHE,
        EvmChain.POLYGON,
        txHash,
        undefined
      );
      expect(mockConfirmGatewayTx).toHaveBeenCalledWith(txHash, EvmChain.AVALANCHE);
      expect(mockDoesTxMeetConfirmHt).toHaveBeenCalledWith(EvmChain.AVALANCHE, txHash, undefined);
      expect(response).toBeDefined();
      expect(response.infoLogs.length).toBeGreaterThan(0);
      expect(response.eventResponse).toBeDefined();
      expect(response.success).toBeTruthy();
      expect(response.commandId).toBe("commandId");
    });

    test("It should not confirm an event if the evm event is completed", async () => {
      const mockConfirmGatewayTx = vitest
        .spyOn(api, "confirmGatewayTx")
        .mockResolvedValue(axelarTxResponseStub());

      vitest.spyOn(api, "getEvmEvent").mockResolvedValue({
        ...evmEventStubResponse(),
        eventResponse: {
          event: {
            ...evmEventStubResponse().eventResponse.event,
            status: Event_Status.STATUS_COMPLETED,
          },
        },
      });

      const response = await api.findEventAndConfirmIfNeeded(
        EvmChain.AVALANCHE,
        EvmChain.POLYGON,
        "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503",
        undefined,
        evmWalletDetails
      );

      expect(mockConfirmGatewayTx).not.toHaveBeenCalled();
      expect(response).toBeTruthy();
      expect(response.success).toBeTruthy();
      expect(response.eventResponse).toBeDefined();
      expect(response.commandId).toBe("commandId");
    });

    test("It should not confirm an event if the finalized block is not met", async () => {
      const mockConfirmGatewayTx = vitest
        .spyOn(api, "confirmGatewayTx")
        .mockResolvedValue(axelarTxResponseStub());

      vitest.spyOn(api, "getEvmEvent").mockResolvedValue({
        ...evmEventStubResponse(),
        eventResponse: {
          event: {
            ...evmEventStubResponse().eventResponse.event,
            status: Event_Status.STATUS_UNSPECIFIED,
          },
        },
      });

      const mockDoesTxMeetConfirmHt = vitest
        .spyOn(api, "doesTxMeetConfirmHt")
        .mockResolvedValue(false);
      const txHash = "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503";

      const response = await api.findEventAndConfirmIfNeeded(
        EvmChain.AVALANCHE,
        EvmChain.POLYGON,
        txHash,
        undefined,
        evmWalletDetails
      );

      expect(mockConfirmGatewayTx).toBeCalledTimes(0);
      expect(mockDoesTxMeetConfirmHt).toHaveBeenCalledWith(EvmChain.AVALANCHE, txHash, undefined);
      expect(response.success).toBeFalsy();
      expect(response.eventResponse).toBeDefined();
      expect(response.commandId).toBe("commandId");
      expect(response.errorMessage).toContain(`minimum confirmation`);
      expect(response.confirmTx).toBeUndefined();
    });

    test("It should return success: false if the confirmGatewayTx is failed", async () => {
      vitest.spyOn(api, "getEvmEvent").mockResolvedValue({
        ...evmEventStubResponse(),
        eventResponse: {
          event: {
            ...evmEventStubResponse().eventResponse.event,
            status: Event_Status.STATUS_UNSPECIFIED,
          },
        },
      });
      const mockDoesTxMeetConfirmHt = vitest
        .spyOn(api, "doesTxMeetConfirmHt")
        .mockResolvedValue(true);
      const txHash = "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503";
      const mockConfirmGatewayTx = vitest.spyOn(api, "confirmGatewayTx").mockRejectedValue("error");

      const response = await api.findEventAndConfirmIfNeeded(
        EvmChain.AVALANCHE,
        EvmChain.POLYGON,
        txHash,
        undefined,
        evmWalletDetails
      );

      expect(mockConfirmGatewayTx).toHaveBeenCalledWith(txHash, EvmChain.AVALANCHE);
      expect(mockDoesTxMeetConfirmHt).toHaveBeenCalledWith(EvmChain.AVALANCHE, txHash, undefined);
      expect(response.success).toBeFalsy();
      expect(response.eventResponse).toBeDefined();
      expect(response.commandId).toBe("commandId");
      expect(response.errorMessage).toContain(`could not confirm`);
      expect(response.confirmTx).toBeUndefined();
    });
  });

  describe("findBatchAndSignIfNeeded", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    test("It should sign an event if needed", async () => {
      const mockSignCommandTx = vitest
        .spyOn(api, "signCommands")
        .mockResolvedValue(axelarTxResponseStub());
      vitest.spyOn(api, "fetchBatchData").mockResolvedValue(undefined);

      const signResult = await api.findBatchAndSignIfNeeded("conmmandId", EvmChain.AVALANCHE);
      expect(mockSignCommandTx).toHaveBeenLastCalledWith(EvmChain.AVALANCHE);
      expect(signResult).toBeDefined();
    });
    test("It should skip sign an event if batch is found", async () => {
      const mockSignCommandTx = vitest
        .spyOn(api, "signCommands")
        .mockResolvedValue(axelarTxResponseStub());
      vitest.spyOn(api, "fetchBatchData").mockResolvedValue({} as any);

      const signResult = await api.findBatchAndSignIfNeeded("commandId", EvmChain.MOONBEAM);
      expect(mockSignCommandTx).not.toHaveBeenCalled();
      expect(signResult).toBeDefined();
    });

    test("It should return an error if unable to fetchBatchData", async () => {
      const mockSignCommandTx = vitest
        .spyOn(api, "signCommands")
        .mockResolvedValue(axelarTxResponseStub());
      vitest.spyOn(api, "fetchBatchData").mockRejectedValue("error");

      const signResult = await api.findBatchAndSignIfNeeded("commandId", EvmChain.MOONBEAM);
      expect(mockSignCommandTx).not.toHaveBeenCalled();
      expect(signResult).toBeDefined();
      expect(signResult.errorMessage).toContain(
        `findBatchAndSignIfNeeded(): issue retrieving and signing`
      );
    });
  });

  describe("findBatchAndApproveGateway", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    beforeEach(() => {
      vitest.clearAllMocks();
    });

    test("It should broadcast an event if needed", async () => {
      const mockSendApproveTx = vitest
        .spyOn(api, "sendApproveTx")
        .mockResolvedValue(axelarTxResponseStub());
      vitest.spyOn(api, "fetchBatchData").mockResolvedValue({
        ...batchCommandStub(),
        status: "BATCHED_COMMANDS_STATUS_SIGNED",
      });

      const response = await api.findBatchAndApproveGateway(
        batchCommandStub().command_ids[0],
        EvmChain.MOONBEAM,
        evmWalletDetails
      );
      expect(mockSendApproveTx).toHaveBeenCalled();
      expect(response).toBeDefined();
      expect(response.errorMessage).toBeFalsy();
      expect(response.approveTx).toEqual(axelarTxResponseStub());
      expect(response.success).toBeTruthy();
    });

    test("It should return unsuccess message if batch data is not found", async () => {
      const mockSendApproveTx = vitest
        .spyOn(api, "sendApproveTx")
        .mockResolvedValue(axelarTxResponseStub());
      vitest.spyOn(api, "fetchBatchData").mockResolvedValue(undefined);

      const response = await api.findBatchAndApproveGateway(
        batchCommandStub().command_ids[0],
        EvmChain.MOONBEAM,
        evmWalletDetails
      );
      expect(mockSendApproveTx).not.toHaveBeenCalled();
      expect(response).toBeTruthy();
      expect(response.errorMessage).toContain(
        `findBatchAndApproveGateway(): unable to retrieve batch data for`
      );
      expect(response.approveTx).toBeUndefined();
      expect(response.success).toBeFalsy();
    });

    test("It should return unsuccess message if batch data does not contain command ID", async () => {
      vitest.spyOn(api, "sendApproveTx").mockResolvedValue(axelarTxResponseStub());
      vitest.spyOn(api, "fetchBatchData").mockResolvedValue({
        ...batchCommandStub(),
        status: "BATCHED_COMMANDS_STATUS_SIGNED",
      });

      const response = await api.findBatchAndApproveGateway(
        "non-existent-command-id",
        EvmChain.MOONBEAM,
        evmWalletDetails
      );
      expect(response).toBeDefined();
      expect(response.errorMessage).toContain("unable to retrieve command ID");
      expect(response.approveTx).toBeUndefined();
      expect(response.success).toBeFalsy();
    });
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

  describe("getRouteDir", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });
    const axelarnetModule: ChainInfo = {
      ...chainInfoStub(),
      module: "axelarnet",
    };
    const evmModule: ChainInfo = {
      ...chainInfoStub(),
      module: "evm",
    };

    test("it should return cosmos_to_evm", () => {
      const routeDir = api.getRouteDir(axelarnetModule, evmModule);
      expect(routeDir).toBe(RouteDir.COSMOS_TO_EVM);
    });

    test("it should return evm_to_cosmos", () => {
      const routeDir = api.getRouteDir(evmModule, axelarnetModule);
      expect(routeDir).toBe(RouteDir.EVM_TO_COSMOS);
    });

    test("it should return evm_to_evm", () => {
      const routeDir = api.getRouteDir(evmModule, evmModule);
      expect(routeDir).toBe(RouteDir.EVM_TO_EVM);
    });
  });

  describe("recoverEvmToCosmosTx", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    beforeEach(() => {
      vitest.clearAllMocks();
      vitest.spyOn(api, "queryTransactionStatus").mockResolvedValueOnce({
        status: "called",
        callTx: {
          chain: "avalanche",
          returnValues: {
            destinationChain: "osmosis-7",
          },
        },
      });
    });

    test("it returns error if the confirmation is not met", async () => {
      vitest.spyOn(api as any, "doesTxMeetConfirmHt").mockReturnValue(Promise.resolve(false));

      const result = await api.manualRelayToDestChain("0xtest");
      expect(result.success).toBeFalsy();
      expect(result.error).toContain("not confirmed");
    });

    test("it returns error if the api fails to send ConfirmGatewayTx tx", async () => {
      vitest.spyOn(api as any, "doesTxMeetConfirmHt").mockReturnValue(Promise.resolve(true));

      vitest.spyOn(api, "confirmGatewayTx").mockRejectedValue({ message: "any" });
      const result = await api.manualRelayToDestChain("0xtest");
      expect(result.success).toBeFalsy();
      expect(result.error).toContain("ConfirmGatewayTx");
    });

    test("it returns error if the api fails to send RouteMessage tx", async () => {
      vitest.spyOn(api as any, "doesTxMeetConfirmHt").mockReturnValue(Promise.resolve(true));
      vitest.spyOn(api, "confirmGatewayTx").mockResolvedValue(axelarTxResponseStub());
      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValue({
        call: { returnValues: { payload: "payload" } },
      });
      vitest.spyOn(api, "getEventIndex").mockResolvedValue(0);
      vitest.spyOn(api, "routeMessageRequest").mockRejectedValue({ message: "any" });
      const result = await api.manualRelayToDestChain("0xtest");
      expect(result.success).toBeFalsy();
      expect(result.error).toContain("RouteMessage");
    });

    test("it should return success if the api succeeds to send RouteMessage tx", async () => {
      vitest.spyOn(api as any, "doesTxMeetConfirmHt").mockReturnValue(Promise.resolve(true));
      vitest.spyOn(api, "confirmGatewayTx").mockResolvedValue(axelarTxResponseStub());
      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValue({
        call: { returnValues: { payload: "payload" } },
      });
      vitest.spyOn(api, "getEventIndex").mockResolvedValue(0);
      vitest.spyOn(api, "routeMessageRequest").mockResolvedValue(axelarTxResponseStub());
      const result = await api.manualRelayToDestChain("0xtest");
      expect(result.success).toBeTruthy();
      expect(result.confirmTx).toBeDefined();
      expect(result.routeMessageTx).toBeDefined();
      expect(result.infoLogs?.length).toBeGreaterThan(0);
    });
  });

  describe("recoverCosmosToEvmTx", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    beforeEach(() => {
      vitest.clearAllMocks();
      vitest.spyOn(api, "queryTransactionStatus").mockResolvedValueOnce({
        status: "called",
        callTx: {
          chain: "osmosis-7",
          returnValues: {
            destinationChain: "avalanche",
          },
        },
      });
    });

    test("it should return error if the routeMessage tx is undefined", async () => {
      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValue({
        call: { returnValues: { payload: "payload", messageId: "messageID" } },
      });
      vitest.spyOn(api, "routeMessageRequest").mockRejectedValue("any");
      const result = await api.manualRelayToDestChain("0xtest");
      expect(result.success).toBeFalsy();
      expect(result.error).toContain("RouteMessage");
    });

    test("it should return error if the signAndApproveGateway is not success", async () => {
      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValue({
        call: { returnValues: { payload: "payload", messageId: "messageID" } },
      });
      vitest.spyOn(api, "routeMessageRequest").mockResolvedValue(axelarTxResponseStub());
      vitest.spyOn(api as any, "signAndApproveGateway").mockResolvedValue({
        success: false,
        error: "any",
      });
      const result = await api.manualRelayToDestChain("0xtest");
      expect(result.success).toBeFalsy();
      expect(result.error).toBe("any");
    });

    test("it should return success response if the signAndApproveGateway is success", async () => {
      vitest.spyOn(api, "fetchGMPTransaction").mockResolvedValue({
        call: {
          returnValues: {
            payload: "payload",
            messageId: "messageID",
            destinationChain: "avalanche",
          },
        },
        command_id: "commandID",
      });
      const mockRouteMesssageRequest = vitest
        .spyOn(api, "routeMessageRequest")
        .mockResolvedValue(axelarTxResponseStub());
      const mockSignAndApproveGateway = vitest
        .spyOn(api as any, "signAndApproveGateway")
        .mockResolvedValue({
          success: true,
          signCommandTx: axelarTxResponseStub(),
          infoLogs: ["log"],
        });

      const result = await api.manualRelayToDestChain("0xtest");
      expect(mockRouteMesssageRequest).toHaveBeenLastCalledWith("messageID", "payload", -1);
      expect(mockSignAndApproveGateway).toHaveBeenLastCalledWith("commandID", "avalanche", {
        useWindowEthereum: true,
      });
      expect(result.success).toBeTruthy();
      expect(result.signCommandTx).toBeDefined();
      expect(result.infoLogs?.length).toEqual(2);
      expect(result.routeMessageTx).toEqual(axelarTxResponseStub());
    });
  });

  describe("doesTxMeetConfirmHt", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    beforeEach(() => {
      vitest.clearAllMocks();
      vitest.spyOn(api as any, "getSigner").mockReturnValue({
        provider: {
          getTransactionReceipt: () => Promise.resolve({ confirmations: 10 }),
        },
      });
    });

    test("it should return true if the given transaction hash has enough confirmation", async () => {
      const isConfirmed = await api.doesTxMeetConfirmHt("ethereum-2", "0xinsufficient");
      expect(isConfirmed).toBeTruthy();
    });

    test("it should return false if the given transaction hash does not have enough confirmation", async () => {
      const isConfimed = await api.doesTxMeetConfirmHt("avalanche", "0xsufficient");
      expect(isConfimed).toBeTruthy();
    });
  });

  describe("recoverEvmToEvmTx", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    beforeEach(() => {
      // Prevent sleep while testing
      vitest.clearAllMocks();
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
      vitest.spyOn(api as any, "doesTxMeetConfirmHt").mockReturnValue(Promise.resolve(true));
      const res = await api.manualRelayToDestChain("0x");
      expect(res).toBeTruthy();
      expect(res?.success).toBeFalsy();
      expect(res?.error).toEqual(
        "findEventAndConfirmIfNeeded(): could not confirm transaction on Axelar"
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

      const mockFindBatchAndSignIfNeeded = vitest.spyOn(api, "findBatchAndSignIfNeeded");
      mockFindBatchAndSignIfNeeded.mockResolvedValueOnce({
        success: false,
        errorMessage: "findBatchAndSignIfNeeded(): issue retrieving and signing command data",
        signCommandTx: undefined,
        infoLogs: [],
      });
      const mockGetEvmEvent = vitest.spyOn(api, "getEvmEvent");
      mockGetEvmEvent.mockResolvedValueOnce(evmEventStubResponse());

      const res = await api.manualRelayToDestChain("0x", undefined, undefined, undefined, false);
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
        signCommandTx: undefined,
        infoLogs: [],
      });
      const mockfindBatchAndApproveGateway = vitest.spyOn(api, "findBatchAndApproveGateway");
      mockfindBatchAndApproveGateway.mockResolvedValueOnce({
        success: false,
        errorMessage: "findBatchAndApproveGateway(): unable to retrieve command ID",
        approveTx: {} as AxelarTxResponse,
        infoLogs: [],
      });
      const mockGetEvmEvent = vitest.spyOn(api, "getEvmEvent");
      mockGetEvmEvent.mockResolvedValueOnce(evmEventStubResponse());

      const res = await api.manualRelayToDestChain("0x", undefined, undefined, undefined, false);
      expect(res).toBeTruthy();
      expect(res?.success).toBeFalsy();
      expect(res?.error).toEqual(`findBatchAndApproveGateway(): unable to retrieve command ID`);
    });

    test("it should call approve successfully", async () => {
      const mockQueryTransactionStatus = vitest.spyOn(api, "queryTransactionStatus");
      mockQueryTransactionStatus.mockResolvedValueOnce({
        status: GMPStatus.SRC_GATEWAY_CALLED,
        callTx: {
          chain: EvmChain.AVALANCHE,
          returnValues: { destinationChain: EvmChain.MOONBEAM },
        },
      });
      vitest.spyOn(api, "getEvmEvent").mockResolvedValueOnce(evmEventStubResponse());
      const mockFindEventAndConfirmIfNeeded = vitest
        .spyOn(api, "findEventAndConfirmIfNeeded")
        .mockResolvedValueOnce(findEventAndConfirmStub());
      const mockSignAndApproveGateway = vitest
        .spyOn(api as any, "signAndApproveGateway")
        .mockResolvedValue({
          success: true,
          signCommandTx: axelarTxResponseStub(),
          approveTx: axelarTxResponseStub(),
          infoLogs: ["log"],
        });

      const response = await api.manualRelayToDestChain(
        "0x",
        undefined,
        undefined,
        undefined,
        false
      );
      expect(mockFindEventAndConfirmIfNeeded).toHaveBeenCalled();
      expect(mockSignAndApproveGateway).toHaveBeenCalled();
      expect(response.success).toBeTruthy();
      expect(response.confirmTx).toBeDefined();
      expect(response.signCommandTx).toBeDefined();
      expect(response.approveTx).toBeDefined();
      expect(response.infoLogs?.length).greaterThan(2);
    });
  });

  describe("getCidFromSrcTxHash", () => {
    const mainnetApi = new AxelarGMPRecoveryAPI({ environment: Environment.MAINNET });

    // https://axelarscan.io/gmp/0x3828bf893801f337e08d15b89efc9c3c2d9196fe7f83f3b7640425b24d122cb2:12
    it("should return the correct commandId from evm -> evm for ContractCallWithToken event", () => {
      expect(
        mainnetApi.getCidFromSrcTxHash(
          "celo",
          "0x3828bf893801f337e08d15b89efc9c3c2d9196fe7f83f3b7640425b24d122cb2",
          8
        )
      ).toEqual("0xa45da101fcfed541b8251cb8a288b5b7dd84086377eb9cf3f8d4a99f11e062e0");
    });

    // https://axelarscan.io/gmp/0x92f676751feccab46a048a16aaf81b26620a3683933b56a722ce742de8ea7429:349
    it("should return the correct commandId from evm -> evm for ContractCall event", () => {
      expect(
        mainnetApi.getCidFromSrcTxHash(
          "blast",
          "0x92f676751feccab46a048a16aaf81b26620a3683933b56a722ce742de8ea7429-5",
          5
        )
      ).toEqual("0xe6868c6e94240fa6a37cc71d265106a00ad8fa0652319f145e3235f703046574");
    });
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
        700000,
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
        700000,
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
        700000,
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
        700000,
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
        700000,
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
      const response = await api.addNativeGas(
        chain,
        tx.transactionHash,
        700000,
        addNativeGasOptions
      );

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
        700000,
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
        700000,
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
      const response = await api.addNativeGas(
        chain,
        tx.transactionHash,
        700000,
        addNativeGasOptions
      );

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

  describe("addGasToXrplChain", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    it("should return transaction data for adding gas to xrpl chain", async () => {
      const senderAddress = "r9uAV8PfN3v6cDHhNGv3o5fSDsfYbs1vbV";
      const messageId = "rsEwuNC25grc6zRszZGkLXdkhvkz89zQkN";
      const amount = "1000000";
      const tokenSymbol = "XRP";

      const response = await api.addGasToXrplChain({
        senderAddress,
        messageId,
        amount,
        tokenSymbol,
      });

      expect(response).toBeDefined();

      // Replace with your XRPL wallet seed for manual testing
      // const xrplWalletSeed = "";
      // const wallet = xrpl.Wallet.fromSecret(xrplWalletSeed, {
      //   algorithm: xrpl.ECDSA.secp256k1,
      // });
      //
      // const signedTx = wallet.sign(response as any);
      //
      // const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
      // await client.connect();
      // const result = await client.submit(signedTx.tx_blob);
      // console.log(result);
      // await client.disconnect();
    });
  });

  describe.skip("addGasToCosmosChain", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.MAINNET });

    // this test built for manual testing purpose
    it("should add gas to cosmos chain", async () => {
      // enter test mnemonic here. don't commit it to git
      const testMnemonic = "";
      const offlineSigner = await DirectSecp256k1HdWallet.fromMnemonic("", {
        prefix: "jkl",
      });

      const response = await api.addGasToCosmosChain({
        gasLimit: 100000,
        txHash: "97653D04099970A43B173A68103FC98389FD842AD4FFBA21FA5239000AE059C1",
        chain: "jackal",
        token: "autocalculate",
        sendOptions: {
          txFee: {
            amount: [
              {
                denom: "ujkl",
                amount: "15000",
              },
            ],
            gas: "5000000",
          },
          environment: Environment.MAINNET,
          offlineSigner,
        },
      });
    });
  });

  describe("addGasToStellarChain", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });
    const randomAddress = "GBX7EYLXHTS3AZDV23BIZR6KYEGGXM7XHMPRZV55NZT54H4EVD37ORWP";

    async function fundAccountIfNeeded(address: string) {
      const server = new Horizon.Server("https://soroban-testnet.stellar.org");
      try {
        await server.accounts().accountId(address).call();
      } catch (e: any) {
        await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`);
      }
    }

    it("should return transaction data for adding gas to stellar chain", async () => {
      await fundAccountIfNeeded(randomAddress);

      const response = await api.addGasToStellarChain({
        senderAddress: randomAddress, // The address that sent the cross-chain message via the `axelar_gateway`
        messageId: "tx-123",
        amount: "10000000", // the token amount to pay for the gas fee
        spender: randomAddress, // The spender pays for the gas fee.
      });

      expect(response).toBeDefined();
    });
  });

  describe("addGasToSuiChain", () => {
    // The default rpc url for testnet doesn't work as of 07 November 2024, so we need to use a custom one for testing.
    const api: AxelarGMPRecoveryAPI = new AxelarGMPRecoveryAPI({ environment: Environment.DEVNET });
    const keypair: Secp256k1Keypair = Secp256k1Keypair.deriveKeypair(
      "test test test test test test test test test test test junk"
    );

    beforeEach(async () => {
      vitest.clearAllMocks();
    });

    test("addGasToSuiChain should construct moveCall correctly", async () => {
      // Create a spy for the moveCall function
      const originalMoveCall = Transaction.prototype.moveCall;
      const moveCallSpy = vitest.fn();

      // Replace moveCall with our spy
      Transaction.prototype.moveCall = moveCallSpy;

      try {
        // Mock the importS3Config to return a specific configuration
        vitest.spyOn(chains, "importS3Config").mockResolvedValue({
          chains: {
            sui: {
              config: {
                contracts: {
                  GasService: {
                    address: "0x1234",
                    objects: {
                      GasService: "0x5678",
                    },
                  },
                },
              },
            },
          },
        });

        // Call the method under test
        await api.addGasToSuiChain({
          gasParams: "0x",
          messageId: "test-1",
          refundAddress: keypair.toSuiAddress(),
        });

        // Verify the spy was called with the expected arguments
        expect(moveCallSpy).toHaveBeenCalledTimes(1);

        // Get the first call's first argument
        const callArgs = moveCallSpy.mock.calls[0][0];

        // Check the specific properties we're interested in
        expect(callArgs.target).toBe("0x1234::gas_service::add_gas");
        expect(callArgs.typeArguments).toContain(SUI_TYPE_ARG);
        expect(callArgs.arguments.length).toBe(5);
      } finally {
        // Restore the original moveCall function
        Transaction.prototype.moveCall = originalMoveCall;
      }
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
        700000,
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
        700000,
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
        700000,
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
      const response = await api.addGas(
        chain,
        tx.transactionHash,
        usdc.address,
        700000,
        addGasOptions
      );

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
        700000,
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
        700000,
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
        700000,
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
        700000,
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
      const response = await api.addGas(
        chain,
        tx.transactionHash,
        usdc.address,
        700000,
        addGasOptions
      );

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

      const sourceTxHash = "0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae";
      const response = await api.execute(sourceTxHash, undefined, evmWalletDetails);

      // Expect returns error
      expect(response).toEqual(ExecutionRevertedError(executeParams));
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

      const sourceTxHash = "0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae";
      const response = await api.execute(sourceTxHash, undefined, evmWalletDetails);

      // Expect returns error
      expect(response).toEqual(InsufficientFundsError(executeParams));
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
    });
  });
});
