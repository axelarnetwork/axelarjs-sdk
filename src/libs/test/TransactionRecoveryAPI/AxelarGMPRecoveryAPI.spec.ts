import { AxelarGMPRecoveryAPI } from "../../TransactionRecoveryApi/AxelarGMPRecoveryAPI";
import { Environment, EvmChain, GasToken } from "../../types";
import { createNetwork, utils } from "@axelar-network/axelar-local-dev";
import { Contract, ContractReceipt, ContractTransaction, ethers, Wallet } from "ethers";
import { deployContract } from "@axelar-network/axelar-local-dev/dist/utils";
import DistributionExecutable from "../abi/DistributionExecutable.json";
import GasServiceAbi from "../../abi/IAxelarGasService.json";
import { AxelarQueryAPI } from "../../AxelarQueryAPI";
import { findContractEvent, getLogIndexFromTxReceipt } from "../../TransactionRecoveryApi/helpers";
import { Interface } from "ethers/lib/utils";
import { GAS_RECEIVER } from "../../TransactionRecoveryApi/constants/contract";

describe("AxelarDepositRecoveryAPI", () => {
  const { setLogger } = utils;
  setLogger(() => null);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("confirmGatewayTx", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    test("It should confirm a gateway tx", async () => {
      const testParamsAxelarnet = {
        txHash: "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503",
        chain: "Avalanche",
      };
      const confirmation = await api.confirmGatewayTx(testParamsAxelarnet);
      console.log("confirmation", confirmation);
      expect(confirmation).toBeTruthy();
    }, 60000);
  });

  describe("calculateWantedGasFee", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

    let contract: Contract;
    let userWallet: Wallet;
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
      contract = await deployContract(userWallet, DistributionExecutable, args as any);

      // Send USDC to the user wallet for testing
      await srcChain.giveToken(userWallet.address, tokenSymbol, BigInt("10000000"));

      // Approve token before running any test
      await srcChain.usdc
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
      const wantedGasFee = await api.calculateWantedGasFee(
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

      return expect(wantedGasFee).toBe(ethers.BigNumber.from(gasRequired).sub(gasPaid).toString());
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
      const wantedGasFee = await api.calculateWantedGasFee(
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
      usdc = srcChain.usdc;
      const args = [srcChain.gateway.address, srcChain.gasReceiver.address];

      // Deploy test contract
      contract = await deployContract(userWallet, DistributionExecutable, args as any);

      // Send USDC to the user wallet for testing
      await srcChain.giveToken(userWallet.address, tokenSymbol, BigInt("10000000"));

      // Approve token before running any test
      await srcChain.usdc
        .connect(userWallet)
        .approve(contract.address, ethers.constants.MaxUint256)
        .then((tx: ContractTransaction) => tx.wait(1));

      // This is a hacky way to set the gas receiver constant object to local gas receiver contract address
      GAS_RECEIVER[Environment.TESTNET][chain] = gasReceiverContract.address;
    });

    test("it shouldn't call 'addNativeGas' given tx is already executed", async () => {
      // Override the provider and wallet to use data from the local network
      const addNativeGasOptions = {
        evmWalletDetails: {
          useWindowEthereum: false,
          privateKey: userWallet.privateKey,
          provider,
        },
      };

      const gasPaid = ethers.utils.parseEther("0.000001");

      // Send transaction at the source chain with some gas.
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

      // Mock that this transaction is already executed.
      jest.spyOn(api, "isExecuted").mockReturnValueOnce(Promise.resolve(true));

      // Call addNativeGas function
      const response = await api.addNativeGas(
        EvmChain.AVALANCHE,
        tx.transactionHash,
        addNativeGasOptions
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe("Already executed");
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
      expect(response.success).toBe(false);
      expect(response.error).toBe(`Couldn't find a transaction on ${chain}`);
    });

    test("it shouldn't call 'addNativeGas' given tx is not gmp call", async () => {
      // Override the provider and wallet to use data from the local network
      const addNativeGasOptions = {
        evmWalletDetails: {
          useWindowEthereum: false,
          privateKey: userWallet.privateKey,
          provider,
        },
      };

      // Sending non-gmp transaction
      const notGmpTx = await usdc
        .connect(userWallet)
        .transfer("0x0000000000000000000000000000000000000001", "1")
        .then((tx: ContractTransaction) => tx.wait());

      // Call addNativeGas function and passing non-gmp tx hash
      const response = await api.addNativeGas(
        chain,
        notGmpTx.transactionHash, // random tx hash
        addNativeGasOptions
      );

      // Validate response
      expect(response.success).toBe(false);
      expect(response.error).toBe("Invalid GMP transaction");
    });

    test("it shouldn't call 'addNativeGas' given gas is already overpaid", async () => {
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

      // Call addNativeGas function
      const response = await api.addNativeGas(chain, tx.transactionHash, addNativeGasOptions);

      expect(response.success).toBe(false);
      expect(response.error).toBe("Already paid sufficient gas fee");
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

      // Override the provider and wallet to use data from the local network
      const addNativeGasOptions = {
        evmWalletDetails: {
          useWindowEthereum: false,
          privateKey: userWallet.privateKey,
          provider,
        },
        amount: gasPaid.toString(),
      };

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
      const response = await api.addNativeGas(chain, tx.transactionHash, addNativeGasOptions);

      expect(response.success).toBe(true);
    });

    test("it should call 'addNativeGas' successfully", async () => {
      // Override the provider and wallet to use data from the local network
      const addNativeGasOptions = {
        evmWalletDetails: {
          useWindowEthereum: false,
          privateKey: userWallet.privateKey,
          provider,
        },
      };

      const gasPaid = ethers.utils.parseEther("0.000001");

      // Send transaction at the source chain with some gas.
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
      const _expectedGasFee = await api.calculateWantedGasFee(
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
});
