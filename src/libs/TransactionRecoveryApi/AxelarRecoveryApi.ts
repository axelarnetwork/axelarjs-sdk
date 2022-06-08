import { loadChains } from "../../chains";
import { ChainInfo } from "../../chains/types";
import { EnvironmentConfigs, getConfigs } from "../../constants";
import { AxelarRecoveryAPIConfig, Environment } from "../types";
import { broadcastCosmosTxBytes } from "./client/helpers/cosmos";
import fetch from "cross-fetch";

export class AxelarRecoveryApi {
  readonly environment: Environment;
  readonly recoveryApiUrl: string;
  readonly axelarRpcUrl: string;

  public constructor(config: AxelarRecoveryAPIConfig) {
    const { environment } = config;
    const links: EnvironmentConfigs = getConfigs(environment);
    this.recoveryApiUrl = links.recoveryApiUrl;
    this.axelarRpcUrl = links.axelarRpcUrl;
    this.environment = environment;
  }

  public async createPendingTransfers(params: { chain: string }) {
    const chain: ChainInfo = loadChains({
      environment: this.environment,
    }).find(
      (chain) => chain.chainInfo.chainName.toLowerCase() === params.chain.toLowerCase()
    )?.chainInfo as ChainInfo;
    if (!chain) throw new Error("cannot find chain" + params.chain);

    const txBytes = await this.execFetch("/create_pending_transfers", {
      ...params,
      chain: params.chain,
      module: chain.module,
    });

    return await broadcastCosmosTxBytes(txBytes, this.axelarRpcUrl);
  }

  public async executePendingTransfers(params: { chain: string }) {
    const chain: ChainInfo = loadChains({
      environment: this.environment,
    }).find((chain) => chain.chainInfo.chainName.toLowerCase() === params.chain.toLowerCase())
      ?.chainInfo as ChainInfo;
    if (!chain) throw new Error("cannot find chain" + params.chain);

    const txBytes = await this.execFetch("/execute_pending_transfers", {
      ...params,
      module: chain.module,
    });

    return await broadcastCosmosTxBytes(txBytes, this.axelarRpcUrl);
  }

  public async signCommands(params: { chain: string }) {
    const chain: ChainInfo = loadChains({
      environment: this.environment,
    }).find((chain) => chain.chainInfo.chainName.toLowerCase() === params.chain.toLowerCase())
      ?.chainInfo as ChainInfo;
    if (!chain) throw new Error("cannot find chain" + params.chain);

    const txBytes = await this.execFetch("/sign_commands", {
      ...params,
      module: chain.module,
    });

    return await broadcastCosmosTxBytes(txBytes, this.axelarRpcUrl);
  }

  public async queryBatchedCommands() {}

  public async execFetch(endpoint: string, params: any) {
    return await fetch(this.recoveryApiUrl + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })
      .then((res) => res.json())
      .then((res) => res.data);
  }
}
