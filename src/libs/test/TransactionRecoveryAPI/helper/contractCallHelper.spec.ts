import { callExecute, CALL_EXECUTE_ERROR } from "../../../TransactionRecoveryApi/helpers";
import { contractReceiptStub, executeParamsStub } from "../../stubs";
import { EvmChain } from "../../../types";
import IAxelarExecutable from "../../../abi/IAxelarExecutable";
import { ethers, Wallet } from "ethers";
import { fork } from "../../testUtils/localChain";
import type { Mock } from "vitest";

describe.skip("contractCallHelper", () => {
  describe("callExecute", () => {
    let mockWait: Mock<any, any>;
    const stub = executeParamsStub();

    beforeEach(() => {
      mockWait = vitest.fn().mockResolvedValueOnce(contractReceiptStub());
    });

    test("it should call 'executeWithToken' given 'isContractCallWithToken' is true", async () => {
      stub.isContractCallWithToken = true;

      // Mock contract's executeWithTokenFunction
      const mockExecuteWithToken = vitest.fn().mockResolvedValueOnce({ wait: mockWait });
      const contract: any = {
        executeWithToken: mockExecuteWithToken,
        estimateGas: {
          executeWithToken: vitest.fn().mockResolvedValueOnce(ethers.BigNumber.from(100000)),
        },
      };

      await callExecute(stub, contract, 100000);

      expect(mockExecuteWithToken).toHaveBeenCalledWith(
        stub.commandId,
        stub.sourceChain,
        stub.sourceAddress,
        stub.payload,
        stub.symbol,
        stub.amount,
        {
          gasLimit: ethers.BigNumber.from(200000),
        }
      );
      expect(mockWait).toBeCalledTimes(1);
    });

    test("it should call 'execute' given 'isContractCallWithToken' is false", async () => {
      const stub = executeParamsStub();

      // Mock contract's execute function
      const mockExecute = vitest.fn().mockResolvedValueOnce({ wait: mockWait });
      const contract: any = {
        execute: mockExecute,
        estimateGas: {
          execute: vitest.fn().mockResolvedValueOnce(ethers.BigNumber.from(100000)),
        },
      };

      stub.isContractCallWithToken = false;
      await callExecute(stub, contract);

      expect(mockExecute).toHaveBeenCalledWith(
        stub.commandId,
        stub.sourceChain,
        stub.sourceAddress,
        stub.payload,
        {
          gasLimit: ethers.BigNumber.from(100000),
        }
      );
      expect(mockWait).toBeCalledTimes(1);
    });

    test("it should return 'tx reverted' error when the destination contract logic is failed", async () => {
      const chain = EvmChain.AVALANCHE;
      const destinationContractAddress = "0x065fD4a0eDeCD51360b511fd9B1F1Abe4f920fd1";
      const impersonateAccount = "0x0000000000000000000000000000000000000000";
      const provider = fork(chain, {
        impersonateAccounts: [impersonateAccount],
      });
      const contract = new ethers.Contract(
        destinationContractAddress,
        IAxelarExecutable.abi,
        provider
      );

      return callExecute(
        {
          commandId: "0x37a8ff7cc5cd6ec5ff3a043c1e30e7ebde9539cb2f12c36cb7fd6dac30c54c5c",
          sourceChain: "Moonbeam",
          sourceAddress: "0xcAF6bF8231Fbad0619A88cCDa469ef7Ef757f604",
          payload:
            "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a411977dd24f1547065c6630e468a43275cb4d7f000000000000000000000000d54c1b20ffb06e9d229395abb45a064026fedea8",
          symbol: "aUSDC",
          amount: "5800000",
          isContractCallWithToken: true,
          destinationChain: chain,
          destinationContractAddress: contract.address,
          srcTxInfo: {
            transactionHash: "0x",
            transactionIndex: 0,
            logIndex: 0,
          },
        },
        contract
      ).catch((err) => expect(err).toEqual(new Error(CALL_EXECUTE_ERROR.REVERT)));
    });

    test("it should return 'insufficient funds' error when the caller has insufficient funds", async () => {
      const chain = EvmChain.AVALANCHE;
      const destinationContractAddress = "0x065fD4a0eDeCD51360b511fd9B1F1Abe4f920fd1";
      const signerAddress = Wallet.createRandom().address;
      const provider = fork(chain, {
        impersonateAccounts: [signerAddress],
        blockNumber: 2490220, // A block number after approve transaction.
      });
      const signer = provider.getSigner(signerAddress);
      const contract = new ethers.Contract(
        destinationContractAddress,
        IAxelarExecutable.abi,
        signer
      );

      return callExecute(
        {
          commandId: "0xcf3eef6939a392b4ea9726830bf87bf4b5a4f6939ac3a062b0095944bc97278d",
          sourceChain: "Avalanche",
          sourceAddress: "0xebDF3AAc44eE77b1b194965dEA863d77BB9EB131",
          srcTxInfo: {
            transactionHash: "0x",
            transactionIndex: 0,
            logIndex: 0,
          },
          payload:
            "0x0000000000000000000000000000000000000000000000000000000000000080365c0fd1705722cf3f1559c9ac62918ff591ad896aa545826a5a995e18260f80000000000000000000000000d36aac0c9676e984d72823fb662ce94d3ab5e55100000000000000000000000000000000000000000000000000000000000000c400000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000d34007bb8a54b2fbb1d6647c5aba04d507abd21d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f75f62464fb6ae6e7088b76457e164eecfb07db40000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000012438ed17390000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000d36aac0c9676e984d72823fb662ce94d3ab5e5510000000000000000000000000000000000000000000000000000000062d11f2a0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000d34007bb8a54b2fbb1d6647c5aba04d507abd21d000000000000000000000000372d0695e75563d9180f8ce31c9924d7e8aaac47000000000000000000000000a1cf442e73045f1ea9960499fc8771454a01019d00000000000000000000000000000000000000000000000000000000",
          symbol: "UST",
          amount: "300000",
          isContractCallWithToken: true,
          destinationChain: chain,
          destinationContractAddress: contract.address,
        },
        contract
      ).catch((err) => expect(err).toEqual(new Error(CALL_EXECUTE_ERROR.INSUFFICIENT_FUNDS)));
    });

    test("it should return ContractReceipt when the caller has sufficient funds and destination contract logic is legit", async () => {
      const chain = EvmChain.AVALANCHE;
      const destinationContractAddress = "0x065fD4a0eDeCD51360b511fd9B1F1Abe4f920fd1";
      const signerAddress = "0x0000000000000000000000000000000000000000";
      const provider = fork(chain, {
        impersonateAccounts: [signerAddress],
        blockNumber: 2490220, // A block number after approve transaction.
      });
      const signer = provider.getSigner(signerAddress);
      const contract = new ethers.Contract(
        destinationContractAddress,
        IAxelarExecutable.abi,
        signer
      );

      const response = await callExecute(
        {
          commandId: "0xcf3eef6939a392b4ea9726830bf87bf4b5a4f6939ac3a062b0095944bc97278d",
          sourceChain: "Avalanche",
          sourceAddress: "0xebDF3AAc44eE77b1b194965dEA863d77BB9EB131",
          srcTxInfo: {
            transactionHash: "0x",
            transactionIndex: 0,
            logIndex: 0,
          },
          payload:
            "0x0000000000000000000000000000000000000000000000000000000000000080365c0fd1705722cf3f1559c9ac62918ff591ad896aa545826a5a995e18260f80000000000000000000000000d36aac0c9676e984d72823fb662ce94d3ab5e55100000000000000000000000000000000000000000000000000000000000000c400000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000d34007bb8a54b2fbb1d6647c5aba04d507abd21d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f75f62464fb6ae6e7088b76457e164eecfb07db40000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000012438ed17390000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000d36aac0c9676e984d72823fb662ce94d3ab5e5510000000000000000000000000000000000000000000000000000000062d11f2a0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000d34007bb8a54b2fbb1d6647c5aba04d507abd21d000000000000000000000000372d0695e75563d9180f8ce31c9924d7e8aaac47000000000000000000000000a1cf442e73045f1ea9960499fc8771454a01019d00000000000000000000000000000000000000000000000000000000",
          symbol: "UST",
          amount: "300000",
          isContractCallWithToken: true,
          destinationChain: chain,
          destinationContractAddress: contract.address,
        },
        contract
      );

      expect(response).toBeDefined();
    });
  });
});
