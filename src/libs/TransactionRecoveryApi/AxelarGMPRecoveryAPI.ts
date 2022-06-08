import { loadChains } from "../../chains";
import { ChainInfo } from "../../chains/types";
import { AxelarRecoveryAPIConfig, Environment } from "../types";
import { AxelarRecoveryApi } from "./AxelarRecoveryApi";
import { broadcastCosmosTxBytes } from "./client/helpers/cosmos";

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
      chain: chain.chainIdentifier[this.environment]
    });

    const tx = await broadcastCosmosTxBytes(txBytes, this.axelarRpcUrl);

    return tx;
  }
}
