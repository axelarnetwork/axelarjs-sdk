import { AxelarGMPRecoveryAPI } from "../../TransactionRecoveryApi/AxelarGMPRecoveryAPI";
import {
  AddGasOptions,
  ApproveGatewayError,
  Environment,
  EvmChain,
  EvmWalletDetails,
  GasToken,
} from "../../types";
import { createNetwork, utils } from "@axelar-network/axelar-local-dev";
import { Contract, ContractReceipt, ContractTransaction, ethers, Wallet } from "ethers";
import DistributionExecutable from "../abi/DistributionExecutable.json";
import DistributionExecutableWithGasToken from "../abi/DistributionExecutableGasToken.json";
import GasServiceAbi from "../../abi/IAxelarGasService.json";
import TestToken from "../abi/TestToken.json";
import { AxelarQueryAPI } from "../../AxelarQueryAPI";
import { findContractEvent, getLogIndexFromTxReceipt } from "../../TransactionRecoveryApi/helpers";
import { Interface } from "ethers/lib/utils";
import { GAS_RECEIVER } from "../../TransactionRecoveryApi/constants/contract";
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
  axelarTxResponseStub,
  batchedCommandResponseStub,
  contractReceiptStub,
  executeParamsStub,
} from "../stubs";
import * as Sleep from "../../../utils/sleep";

describe("AxelarDepositRecoveryAPI", () => {
  const { setLogger } = utils;
  setLogger(() => null);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  xdescribe("confirmGatewayTx", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    test("It should confirm a gateway tx", async () => {
      const confirmation = await api.confirmGatewayTx(
        "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503",
        EvmChain.AVALANCHE
      );
      expect(confirmation).toBeTruthy();
    }, 60000);
  });

  describe("approveGatewayTx", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    beforeEach(() => {
      // Prevent sleep while testing
      const mockSleep = jest.spyOn(Sleep, "sleep");
      mockSleep.mockImplementation(() => Promise.resolve(undefined));
    });

    test("it shouldn't call approve given the gmp status cannot be fetched", async () => {
      const mockQueryTransactionStatus = jest.spyOn(api, "queryTransactionStatus");
      mockQueryTransactionStatus.mockResolvedValueOnce({ status: GMPStatus.CANNOT_FETCH_STATUS });

      const response = await api.manualRelayToDestChain("0x");

      expect(response).toEqual({
        success: false,
        error: ApproveGatewayError.FETCHING_STATUS_FAILED,
      });
    });
    test("it shouldn't call approve given the 'batchedCommandId' cannot be fetched", async () => {
      const mockQueryTransactionStatus = jest.spyOn(api, "queryTransactionStatus");
      mockQueryTransactionStatus.mockResolvedValueOnce({
        status: GMPStatus.SRC_GATEWAY_CALLED,
        callTx: {
          chain: EvmChain.AVALANCHE,
          returnValues: { destinationChain: EvmChain.MOONBEAM },
        },
      });
      const mockConfirmGatewayTx = jest.spyOn(api, "confirmGatewayTx");
      mockConfirmGatewayTx.mockResolvedValueOnce(axelarTxResponseStub());
      const mockcreatePendingTransfer = jest.spyOn(api, "createPendingTransfers");
      mockcreatePendingTransfer.mockResolvedValueOnce(axelarTxResponseStub());
      const mockSignCommandTx = jest.spyOn(api, "signCommands");
      const signCommandStub = axelarTxResponseStub([
        {
          events: [
            {
              type: "sign",
              attributes: [
                {
                  key: "batchedCommandId",
                  value: "0x123",
                },
              ],
            },
          ],
        },
      ]);
      mockSignCommandTx.mockResolvedValueOnce(signCommandStub);

      const mockQueryBatchedCommand = jest.spyOn(api, "queryBatchedCommands");
      mockQueryBatchedCommand.mockResolvedValueOnce(batchedCommandResponseStub());

      const response = await api.manualRelayToDestChain("0x");

      expect(response).toEqual({
        success: false,
        error: ApproveGatewayError.ERROR_BATCHED_COMMAND,
        confirmTx: axelarTxResponseStub(),
        createPendingTransferTx: axelarTxResponseStub(),
        signCommandTx: signCommandStub,
      });
    });
    test("it shouldn't call approve given the tx is already executed", async () => {
      const mockQueryTransactionStatus = jest.spyOn(api, "queryTransactionStatus");
      mockQueryTransactionStatus.mockResolvedValueOnce({ status: GMPStatus.DEST_EXECUTED });

      const response = await api.manualRelayToDestChain("0x");

      expect(response).toEqual({
        success: false,
        error: ApproveGatewayError.ALREADY_EXECUTED,
      });
    });

    test("it shouldn't call approve given the tx is already approved", async () => {
      const mockQueryTransactionStatus = jest.spyOn(api, "queryTransactionStatus");
      mockQueryTransactionStatus.mockResolvedValueOnce({ status: GMPStatus.DEST_GATEWAY_APPROVED });

      const response = await api.manualRelayToDestChain("0x");

      expect(response).toEqual({
        success: false,
        error: ApproveGatewayError.ALREADY_APPROVED,
      });
    });

    test("it shouldn't call approve given the sign command returns 'no command to sign found'", async () => {
      const mockQueryTransactionStatus = jest.spyOn(api, "queryTransactionStatus");
      mockQueryTransactionStatus.mockResolvedValueOnce({
        status: GMPStatus.SRC_GATEWAY_CALLED,
        callTx: {
          chain: EvmChain.AVALANCHE,
          returnValues: { destinationChain: EvmChain.MOONBEAM },
        },
      });
      const mockConfirmGatewayTx = jest.spyOn(api, "confirmGatewayTx");
      mockConfirmGatewayTx.mockResolvedValueOnce(axelarTxResponseStub());
      const mockcreatePendingTransfer = jest.spyOn(api, "createPendingTransfers");
      mockcreatePendingTransfer.mockResolvedValueOnce(axelarTxResponseStub());
      const mockSignCommandTx = jest.spyOn(api, "signCommands");
      const signCommandStub = axelarTxResponseStub([
        {
          events: [],
        },
      ]);
      mockSignCommandTx.mockResolvedValueOnce(signCommandStub);

      const response = await api.manualRelayToDestChain("0x");

      expect(response).toEqual({
        success: false,
        error: ApproveGatewayError.SIGN_COMMAND_FAILED,
        confirmTx: axelarTxResponseStub(),
        createPendingTransferTx: axelarTxResponseStub(),
        signCommandTx: signCommandStub,
      });
    });
    test("it shouldn't call approve given the account sequence mismatch", async () => {
      const mockQueryTransactionStatus = jest.spyOn(api, "queryTransactionStatus");
      mockQueryTransactionStatus.mockResolvedValueOnce({
        status: GMPStatus.SRC_GATEWAY_CALLED,
        callTx: {
          chain: EvmChain.AVALANCHE,
          returnValues: { destinationChain: EvmChain.MOONBEAM },
        },
      });
      const mockConfirmGatewayTx = jest.spyOn(api, "confirmGatewayTx");
      mockConfirmGatewayTx.mockRejectedValueOnce(new Error("account sequence mismatch"));

      const response = await api.manualRelayToDestChain("0x");

      expect(response).toEqual({
        success: false,
        error: ApproveGatewayError.ERROR_ACCOUNT_SEQUENCE_MISMATCH,
      });
    });
    test("it shouldn't call approve given the error has thrown before finish", async () => {
      const mockQueryTransactionStatus = jest.spyOn(api, "queryTransactionStatus");
      mockQueryTransactionStatus.mockResolvedValueOnce({
        status: GMPStatus.SRC_GATEWAY_CALLED,
        callTx: {
          chain: EvmChain.AVALANCHE,
          returnValues: { destinationChain: EvmChain.MOONBEAM },
        },
      });
      const mockConfirmGatewayTx = jest.spyOn(api, "confirmGatewayTx");
      mockConfirmGatewayTx.mockRejectedValueOnce(new Error("unknown error"));

      const response = await api.manualRelayToDestChain("0x");

      expect(response).toEqual({
        success: false,
        error: ApproveGatewayError.ERROR_UNKNOWN,
      });
    });
    test("it should call approve successfully", async () => {
      const mockQueryTransactionStatus = jest.spyOn(api, "queryTransactionStatus");
      mockQueryTransactionStatus.mockResolvedValueOnce({
        status: GMPStatus.SRC_GATEWAY_CALLED,
        callTx: {
          chain: EvmChain.AVALANCHE,
          returnValues: { destinationChain: EvmChain.MOONBEAM },
        },
      });
      const mockConfirmGatewayTx = jest.spyOn(api, "confirmGatewayTx");
      mockConfirmGatewayTx.mockResolvedValueOnce(axelarTxResponseStub());
      const mockcreatePendingTransfer = jest.spyOn(api, "createPendingTransfers");
      mockcreatePendingTransfer.mockResolvedValueOnce(axelarTxResponseStub());
      const mockSignCommandTx = jest.spyOn(api, "signCommands");
      const signCommandStub = axelarTxResponseStub([
        {
          events: [
            {
              type: "sign",
              attributes: [
                {
                  key: "batchedCommandId",
                  value: "0x123",
                },
              ],
            },
          ],
        },
      ]);
      mockSignCommandTx.mockResolvedValueOnce(signCommandStub);

      const mockQueryBatchedCommand = jest.spyOn(api, "queryBatchedCommands");
      mockQueryBatchedCommand.mockResolvedValueOnce(batchedCommandResponseStub("0x456"));
      const mockApproveTx = jest.spyOn(api, "sendApproveTx");
      const mockTransaction = { transactionHash: "0x123456" };
      mockApproveTx.mockResolvedValueOnce(mockTransaction);

      const response = await api.manualRelayToDestChain("0x");

      expect(response).toEqual({
        success: true,
        confirmTx: axelarTxResponseStub(),
        createPendingTransferTx: axelarTxResponseStub(),
        signCommandTx: signCommandStub,
        approveTx: mockTransaction,
      });
    });
  });

  describe("calculateWantedGasFee", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    let contract: Contract;
    let userWallet: Wallet;
    let usdc: Contract;
    let provider: ethers.providers.Web3Provider;
    const tokenSymbol = "aUSDC";
    const queryApi = new AxelarQueryAPI({ environment: Environment.TESTNET });

    beforeEach(async () => {
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
    });

    test("it should return 'gas required' - 'gas paid' given 'gas required' > 'gas paid'", async () => {
      const gasPaid = ethers.utils.parseEther("0.000001");

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

      // Calculate how many gas we need to add more.
      const wantedGasFee = await api.calculateNativeGasFee(
        tx.transactionHash,
        EvmChain.AVALANCHE,
        EvmChain.MOONBEAM,
        GasToken.AVAX,
        { provider }
      );

      // Get gas required
      const gasRequired = await queryApi.estimateGasFee(
        EvmChain.AVALANCHE,
        EvmChain.MOONBEAM,
        GasToken.AVAX
      );

      const roundedWantedGasFee = parseFloat(ethers.utils.formatEther(wantedGasFee)).toFixed(7);
      const roundedGasRequired = parseFloat(
        ethers.utils.formatEther(ethers.BigNumber.from(gasRequired).sub(gasPaid).toString())
      ).toFixed(7);
      return expect(roundedWantedGasFee).toBe(roundedGasRequired);
    });

    test("it should return 0 given 'gas paid' >= 'gas required'", async () => {
      const gasPaid = ethers.utils.parseEther("10");

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

  describe("addNativeGas", () => {
    let api: AxelarGMPRecoveryAPI;
    let contract: Contract;
    let userWallet: Wallet;
    let provider: ethers.providers.Web3Provider;
    let gasReceiverContract: Contract;
    let usdc: Contract;
    let addNativeGasOptions: AddGasOptions;
    const chain = EvmChain.AVALANCHE;
    const tokenSymbol = "aUSDC";

    beforeEach(async () => {
      jest.clearAllMocks();
      api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });
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

      // This is a hacky way to set the gas receiver constant object to local gas receiver contract address
      GAS_RECEIVER[Environment.TESTNET][chain] = gasReceiverContract.address;
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
      jest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(true));

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
      jest
        .spyOn(api.axelarQueryApi, "estimateGasFee")
        .mockRejectedValueOnce(() => Promise.reject());

      // Call addNativeGas function
      const response = await api.addNativeGas(
        chain, // Passing wrong value here will cause the gas price api to return error
        tx.transactionHash,
        addNativeGasOptions
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe("Couldn't query the gas price");
    });

    test("it should call 'addNativeGas' given gasPrice api is not available but gas amount is specified", async () => {
      const gasPaid = ethers.utils.parseEther("0.00001");

      // Send transaction at the source chain with overpaid gas
      addNativeGasOptions.amount = gasPaid.toString();

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

      // Simulate gasPrice api error
      jest
        .spyOn(api.axelarQueryApi, "estimateGasFee")
        .mockRejectedValueOnce(() => Promise.reject());

      // Call addNativeGas function
      const response = await api.addNativeGas(chain, tx.transactionHash, addNativeGasOptions);

      expect(response.success).toBe(true);
    });

    test("it should call 'addNativeGas' successfully", async () => {
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
        new Interface(GasServiceAbi)
      );

      // Calculate how many gas we need to add more.
      const _expectedGasFee = await api.calculateNativeGasFee(
        tx.transactionHash,
        chain,
        EvmChain.MOONBEAM,
        GasToken.AVAX,
        { provider }
      );
      const expectedLogIndex = getLogIndexFromTxReceipt(tx);

      // Validate event data
      const args = nativeGasAddedEvent?.eventLog.args;
      const eventGasFeeAmount = parseFloat(ethers.utils.formatEther(args?.gasFeeAmount)).toFixed(2);
      const expectedGasFee = parseFloat(ethers.utils.formatEther(_expectedGasFee)).toFixed(2);

      expect(args?.logIndex?.toNumber()).toBe(expectedLogIndex);
      expect(eventGasFeeAmount).toBe(expectedGasFee);
      expect(args?.refundAddress).toBe(userWallet.address);
    });
  });

  describe("addGas", () => {
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

    beforeEach(async () => {
      jest.clearAllMocks();
      api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });
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

      // This is a hacky way to set the gas receiver constant object to local gas receiver contract address
      GAS_RECEIVER[Environment.TESTNET][chain] = gasReceiverContract.address;
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
      jest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(true));

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

      // Mock total gas fee is 0.1 USDC
      jest
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

      // Simulate gasPrice api error
      jest
        .spyOn(api.axelarQueryApi, "estimateGasFee")
        .mockRejectedValueOnce(() => Promise.reject());

      // Call addNativeGas function
      const response = await api.addGas(
        chain, // Passing wrong value here will cause the gas price api to return error
        tx.transactionHash,
        usdc.address,
        addGasOptions
      );

      expect(response).toEqual(GasPriceAPIError());
    });

    test("it should call 'addGas' given gasPrice api is not available but gas amount is specified", async () => {
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
      jest
        .spyOn(api.axelarQueryApi, "estimateGasFee")
        .mockRejectedValueOnce(() => Promise.reject());

      // Override the amount, so it should call contract's addGas even the gas price api returns error
      addGasOptions.amount = ethers.utils.parseEther("10").toString();

      // Call addGas function
      const response = await api.addGas(chain, tx.transactionHash, usdc.address, addGasOptions);

      expect(response.success).toBe(true);
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
      jest
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
      jest
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

    test("it should call 'addGas' successfully", async () => {
      const gasPaid = ethers.utils.parseEther("0.000001");

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

      // Mock total gas fee is 0.1 USDC
      jest
        .spyOn(api.axelarQueryApi, "estimateGasFee")
        .mockResolvedValue(ethers.utils.parseEther("0.1").toString());

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
        new Interface(GasServiceAbi)
      );

      // Calculate how many gas we need to add more.
      const _expectedGasFee = await api.calculateGasFee(
        tx.transactionHash,
        chain,
        EvmChain.MOONBEAM,
        GasToken.USDC,
        { provider }
      );
      const expectedLogIndex = getLogIndexFromTxReceipt(tx);

      // Validate event data
      const args = gasAddedEvent?.eventLog.args;
      const eventGasFeeAmount = parseFloat(ethers.utils.formatEther(args?.gasFeeAmount)).toFixed(2);
      const expectedGasFee = parseFloat(ethers.utils.formatEther(_expectedGasFee)).toFixed(2);

      expect(args?.logIndex?.toNumber()).toBe(expectedLogIndex);
      expect(eventGasFeeAmount).toBe(expectedGasFee);
      expect(args?.refundAddress).toBe(userWallet.address);
    });
  });

  describe("execute", () => {
    let api: AxelarGMPRecoveryAPI;
    const wallet = Wallet.createRandom();
    const evmWalletDetails: EvmWalletDetails = {
      privateKey: wallet.privateKey,
    };

    beforeEach(async () => {
      jest.clearAllMocks();
      api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });
    });

    test("it shouldn't call 'execute' given tx is already executed", async () => {
      const mockApi = jest.spyOn(api, "queryExecuteParams");
      mockApi.mockResolvedValueOnce({ status: GMPStatus.DEST_EXECUTED });

      const response = await api.execute(
        "0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae",
        evmWalletDetails
      );

      expect(response).toEqual(AlreadyExecutedError());
    });

    test("it shouldn't call 'execute' given tx has not approved yet", async () => {
      const mockApi = jest.spyOn(api, "queryExecuteParams");
      mockApi.mockResolvedValueOnce({ status: GMPStatus.SRC_GATEWAY_CALLED });

      const response = await api.execute(
        "0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae",
        evmWalletDetails
      );

      expect(response).toEqual(NotApprovedError());
    });

    test("it shouldn't call 'execute' given gmp api error", async () => {
      const mockApi = jest.spyOn(api, "queryExecuteParams");
      mockApi.mockResolvedValueOnce(undefined);

      const response = await api.execute(
        "0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae",
        evmWalletDetails
      );

      expect(response).toEqual(GMPQueryError());
    });

    test("it calls 'execute' and return revert error given 'callExecute' throws 'CALL_EXECUTE_ERROR.REVERT' error", async () => {
      // mock query api
      const executeParams = executeParamsStub();
      const mockApi = jest.spyOn(api, "queryExecuteParams");
      mockApi.mockResolvedValueOnce({
        status: GMPStatus.DEST_GATEWAY_APPROVED,
        data: executeParams,
      });

      // Mock contract call is failed
      const error = new Error(ContractCallHelper.CALL_EXECUTE_ERROR.REVERT);
      jest.spyOn(ContractCallHelper, "callExecute").mockRejectedValueOnce(error);

      // Mock private saveGMP
      const mockGMPApi = jest.spyOn(AxelarGMPRecoveryAPI.prototype as any, "saveGMP");
      mockGMPApi.mockImplementation(() => Promise.resolve(undefined));

      const sourceTxHash = "0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae";
      const response = await api.execute(sourceTxHash, evmWalletDetails);

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
      const mockApi = jest.spyOn(api, "queryExecuteParams");
      mockApi.mockResolvedValueOnce({
        status: GMPStatus.DEST_GATEWAY_APPROVED,
        data: executeParams,
      });

      // Mock contract call is failed
      const error = new Error(ContractCallHelper.CALL_EXECUTE_ERROR.INSUFFICIENT_FUNDS);
      jest.spyOn(ContractCallHelper, "callExecute").mockRejectedValueOnce(error);

      // Mock private saveGMP
      const mockGMPApi = jest.spyOn(AxelarGMPRecoveryAPI.prototype as any, "saveGMP");
      mockGMPApi.mockImplementation(() => Promise.resolve(undefined));

      const sourceTxHash = "0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae";
      const response = await api.execute(sourceTxHash, evmWalletDetails);

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
      const mockApi = jest.spyOn(api, "queryExecuteParams");
      const executeParams = executeParamsStub();
      mockApi.mockResolvedValueOnce({
        status: GMPStatus.DEST_GATEWAY_APPROVED,
        data: executeParams,
      });

      // Mock contract call is successful
      jest.spyOn(ContractCallHelper, "callExecute").mockResolvedValueOnce(contractReceiptStub());

      // Mock private saveGMP
      const mockGMPApi = jest.spyOn(AxelarGMPRecoveryAPI.prototype as any, "saveGMP");
      mockGMPApi.mockImplementation(() => Promise.resolve(undefined));

      const response = await api.execute(
        "0x86e5f91eff5a8a815e90449ca32e02781508f3b94620bbdf521f2ba07c41d9ae",
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
