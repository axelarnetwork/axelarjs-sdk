import { asyncRetry, sleep } from "../../utils";
import { loadChains } from "../../chains";
import { ChainInfo } from "../../chains/types";
import { AxelarRecoveryAPIConfig } from "../types";
import { AxelarRecoveryApi } from "./AxelarRecoveryApi";
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

    const txBytes = await this.execFetch("/confirm_gateway_tx", {
      ...params,
      module: chain.module,
      chain: chain.chainIdentifier[this.environment],
    });

    const tx = await broadcastCosmosTxBytes(txBytes, this.axelarRpcUrl);

    return tx;
  }

  public async forceRelayToDestChain(params: { txHash: string; src: string; dest: string; debug?: boolean }) {
    const { txHash, src, dest, debug } = params;

    try {
      const confirmTx = await this.confirmGatewayTx({ txHash, chain: src });
      if (debug) console.log("confirmTx", confirmTx);

      await sleep(2);

      const crt = await this.createPendingTransfers({ chain: dest });
      if (debug) console.log("crt", crt);

      await sleep(2);

      const sc = await this.signCommands({ chain: dest });
      if (debug) console.log("sc", sc);

      await sleep(2);

      const batched = await asyncRetry(
        () => this.queryBatchedCommands({ chain: dest, id: "" }),
        (res: BatchedCommandsResponse) =>
          res && res.executeData !== null && res.executeData.length > 0,
        undefined,
        30,
        5
      );
      if (debug) console.log("batched", batched);

      await sleep(2);

      const broadcasted = await this.sendEvmTxToRelayer(dest, batched.executeData);
      if (debug) console.log("broadcasted", broadcasted);
    } catch (e) {
      console.log(e);
    }
  }
}
