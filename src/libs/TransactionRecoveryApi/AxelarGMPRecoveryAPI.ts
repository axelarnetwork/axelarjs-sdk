import { loadChains } from "../../chains";
import { ChainInfo } from "../../chains/types";
import { AxelarRecoveryAPIConfig } from "../types";
import { AxelarRecoveryApi } from "./AxelarRecoveryApi";
import { broadcastCosmosTxBytes } from "./client/helpers/cosmos";
import AxelarGMPRecoveryProcessor from "./processors";

export class AxelarGMPRecoveryAPI extends AxelarRecoveryApi {
  private processor: AxelarGMPRecoveryProcessor;
  public constructor(config: AxelarRecoveryAPIConfig) {
    super(config);
    this.processor = new AxelarGMPRecoveryProcessor(this);
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
}
