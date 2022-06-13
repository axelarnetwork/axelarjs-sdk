import { asyncRetry, sleep } from "../../utils";
import { loadChains } from "../../chains";
import { ChainInfo } from "../../chains/types";
import { AxelarRecoveryAPIConfig } from "../types";
import { AxelarRecoveryApi, GMPStatus, GMPStatusResponse } from "./AxelarRecoveryApi";
import { broadcastCosmosTxBytes } from "./client/helpers/cosmos";
import { BatchedCommandsResponse } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/query";

export class AxelarGMPRecoveryAPI extends AxelarRecoveryApi {
  public constructor(config: AxelarRecoveryAPIConfig) {
    super(config);
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
    const { txHash, src, dest, debug } = params;

    const res: GMPStatusResponse = await this.queryTransactionStatus(txHash);

    if (res.status === GMPStatus.EXECUTED) return "already executed";
    if (res.status === GMPStatus.APPROVED) return "approved but not executed";

    try {
      const confirmTx = await this.confirmGatewayTx({ txHash, chain: src });
      if (debug) console.log("confirmedTx", confirmTx);
      await sleep(2);

      const crt = await this.createPendingTransfers({ chain: dest });
      if (debug) console.log("pendingTransfer", crt);
      await sleep(2);

      const sc = await this.signCommands({ chain: dest });
      if (debug) console.log("signedCommand", sc);
      await sleep(2);

      const batched = await asyncRetry(
        () => this.queryBatchedCommands({ chain: dest, id: "" }),
        (res: BatchedCommandsResponse) =>
          res && res.executeData !== null && res.executeData.length > 0,
        undefined,
        30,
        5
      );
      if (debug) console.log("batchedCommand", batched);
      await sleep(2);

      const broadcasted = await this.sendEvmTxToRelayer(dest, batched.executeData);
      if (debug) console.log("broadcastedMsg", broadcasted);

      return "triggered relay";
    } catch (e) {
      console.log(e);
      return e;
    }
  }
}
