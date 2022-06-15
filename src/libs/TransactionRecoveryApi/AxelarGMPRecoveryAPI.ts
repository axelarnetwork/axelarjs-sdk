import fetch from "cross-fetch";
import { loadChains } from "../../chains";
import { ChainInfo } from "../../chains/types";
import { AxelarRecoveryAPIConfig, EVMClientConfig, EvmWalletDetails } from "../types";
import { AxelarRecoveryApi, rpcMap } from "./AxelarRecoveryApi";
import EVMClient from "./client/EVMClient";
import { broadcastCosmosTxBytes } from "./client/helpers/cosmos";
import AxelarGMPRecoveryProcessor from "./processors";
import IAxelarExecutable from "../abi/IAxelarExecutable";
import { BigNumber, ContractFunction, ethers } from "ethers";
import IAxelarGasService from "../abi/IAxelarGasService.json";
import { defaultAbiCoder, keccak256, parseEther } from "ethers/lib/utils";

declare const window: Window &
  typeof globalThis & {
    ethereum: any;
  };

export class AxelarGMPRecoveryAPI extends AxelarRecoveryApi {
  private processor: AxelarGMPRecoveryProcessor;
  public constructor(config: AxelarRecoveryAPIConfig) {
    super(config);
    this.processor = new AxelarGMPRecoveryProcessor(this);
  }

  public async saveGMP(
    sourceTransactionHash: string,
    transactionHash: string,
    relayerAddress: string,
    error?: any
  ) {
    return await this.execPost(super.getAxelarCachingServiceUrl, "", {
      method: "saveGMP",
      sourceTransactionHash,
      transactionHash,
      relayerAddress,
      error,
    });
  }

  public async confirmGatewayTx(params: { txHash: string; chain: string }) {
    const chain: ChainInfo = loadChains({
      environment: this.environment,
    }).find((chain) => chain.chainInfo.chainName.toLowerCase() === params.chain.toLowerCase())
      ?.chainInfo as ChainInfo;
    if (!chain) throw new Error("cannot find chain" + params.chain);

    const txBytes = await this.execRecoveryUrlFetch("/confirm_gateway_tx", {
      ...params,
      module: chain.module,
      chain: chain.chainIdentifier[this.environment],
    });

    const tx = await broadcastCosmosTxBytes(txBytes, this.axelarRpcUrl);

    return tx;
  }

  public async manualRelayToDestChain(params: {
    txHash: string;
    src: string;
    dest: string;
    debug?: boolean;
  }): Promise<"triggered relay" | "approved but not executed" | "already executed" | unknown> {
    return await this.processor.process(params);
  }

  public async addNativeGas(
    { gas_paid }: { gas_paid: any },
    cb: any,
    evmWalletOverride?: EvmWalletDetails
  ): Promise<void> {
    try {
      const { address: gasReceiverAddress, chain, logIndex, transactionHash } = gas_paid;
      const { refundAddress } = gas_paid?.returnValues;

      const evmClientConfig: EVMClientConfig = {
        rpcUrl: rpcMap[chain?.toLowerCase()],
        evmWalletDetails: evmWalletOverride || { useWindowEthereum: true },
      };

      const evmClient = new EVMClient(evmClientConfig);
      const signer = evmClient.getSigner();
      const signerAddress: string = await signer.getAddress();
      const contract = new ethers.Contract(gasReceiverAddress, IAxelarGasService.abi, signer);

      let tx;
      try {
        tx = await contract.addNativeGas(
          keccak256(defaultAbiCoder.encode(['string'], [transactionHash])),
          logIndex,
          refundAddress,
          {
            value: parseEther("1.0")
          }
        );
        console.log("tx",tx)
        if (tx.hash) {
          cb({
            status: "pending",
            message: "Wait for confirmation",
            txHash: tx.hash,
          });
        }
        await tx.wait(1);
        if (tx.hash) {
          cb({
            status: "success",
            message: "Execute successful",
            txHash: tx.hash,
          });
          await this.saveGMP(gas_paid?.transactionHash, tx.hash, signerAddress);
        }
      } catch (error: any) {
        await this.saveGMP(gas_paid?.transactionHash, tx?.hash, signerAddress, error);
        cb({
          status: "failed",
          message: error?.reason || error?.data?.message || error?.message,
          txHash: tx?.hash,
        });
      }
    } catch (error: any) {
      cb({
        status: "failed",
        message: error?.reason || error?.data?.message || error?.message,
        txHash: "",
      });
    }
  }

  public async executeManually(
    data: {
      call: any;
      approved: any;
    },
    cb: any
  ): Promise<void> {
    try {
      const { call, approved } = data;
      const { event } = call;
      const { destinationChain, destinationContractAddress, payload } = call?.returnValues;
      const { commandId, sourceChain, sourceAddress, symbol, amount } = approved?.returnValues;

      const evmClientConfig: EVMClientConfig = {
        rpcUrl: rpcMap[destinationChain?.toLowerCase()],
        evmWalletDetails: { useWindowEthereum: true },
      };

      const evmClient = new EVMClient(evmClientConfig);
      const signer = evmClient.getSigner();
      const address: string = await signer.getAddress();

      const contract = new ethers.Contract(
        destinationContractAddress,
        IAxelarExecutable.abi,
        signer
      );

      const methods: { [key: string]: ContractFunction } = {
        ContractCall: () => contract.execute(commandId, sourceChain, sourceAddress, payload),
        ContractCallWithToken: () =>
          contract.executeWithToken(
            commandId,
            sourceChain,
            sourceAddress,
            payload,
            symbol,
            BigNumber.from(amount).toString()
          ),
      };

      if (methods[event]) {
        let tx;
        try {
          tx = await methods[event]();
          if (tx.hash) {
            cb({
              status: "pending",
              message: "Wait for confirmation",
              txHash: tx.hash,
            });
          }
          await tx.wait(1);
          if (tx.hash) {
            cb({
              status: "success",
              message: "Execute successful",
              txHash: tx.hash,
            });
            await this.saveGMP(call?.transactionHash, tx.hash, address);
          }
        } catch (error: any) {
          await this.saveGMP(call?.transactionHash, tx?.hash, address, error);
          cb({
            status: "failed",
            message: error?.reason || error?.data?.message || error?.message,
            txHash: tx?.hash,
          });
        }
      } else {
        console.warn(`method ${event} does not exist!`);
      }
    } catch (error: any) {
      cb({
        status: "failed",
        message: error?.reason || error?.data?.message || error?.message,
        txHash: "",
      });
    }
  }
}
