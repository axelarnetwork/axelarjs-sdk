import fetch from "cross-fetch";
import { loadChains } from "../../chains";
import { ChainInfo } from "../../chains/types";
import { EnvironmentConfigs, getConfigs } from "../../constants";
import { AxelarRecoveryAPIConfig, Environment } from "../types";
import { broadcastCosmosTxBytes } from "./client/helpers/cosmos";
import { AxelarQueryClient, AxelarQueryClientType } from "../AxelarQueryClient";
import EVMClient from "./client/EVMClient";

const rpcMap: { [key: string]: string } = {
  fantom: "https://rpc.testnet.fantom.network",
  polygon: "https://polygon-mumbai.infura.io/v3/467477790bfa4b7684be1336e789a068",
  moonbeam: "https://rpc.api.moonbase.moonbeam.network",
  avalanche: "https://api.avax-test.network/ext/bc/C/rpc",
  ethereum: "https://ropsten.infura.io/v3/467477790bfa4b7684be1336e789a068",
};

export class AxelarRecoveryApi {
  readonly environment: Environment;
  readonly recoveryApiUrl: string;
  readonly axelarRpcUrl: string;
  readonly config: AxelarRecoveryAPIConfig;
  protected axelarQuerySvc: AxelarQueryClientType | null = null;
  protected evmClient: EVMClient;

  public constructor(config: AxelarRecoveryAPIConfig) {
    const { environment } = config;
    const links: EnvironmentConfigs = getConfigs(environment);
    this.recoveryApiUrl = links.recoveryApiUrl;
    this.axelarRpcUrl = links.axelarRpcUrl;
    this.environment = environment;
    this.config = config;
  }

  public async createPendingTransfers(params: { chain: string }) {
    const chain: ChainInfo = loadChains({
      environment: this.environment,
    }).find((chain) => chain.chainInfo.chainName.toLowerCase() === params.chain.toLowerCase())
      ?.chainInfo as ChainInfo;
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

  public async queryBatchedCommands({ chain, id }: { chain: string; id?: string }) {
    if (!this.axelarQuerySvc)
      this.axelarQuerySvc = await AxelarQueryClient.initOrGetAxelarQueryClient(this.config);
    return await this.axelarQuerySvc.evm.BatchedCommands({ chain, id: id || "" });
  }

  public async queryGatewayAddress({ chain }: { chain: string }) {
    if (!this.axelarQuerySvc)
      this.axelarQuerySvc = await AxelarQueryClient.initOrGetAxelarQueryClient(this.config);
    return await this.axelarQuerySvc.evm.GatewayAddress({ chain });
  }

  public async broadcastEvmTx(chain: string, data: string) {
    const gatewayInfo = await this.queryGatewayAddress({ chain })
    const evmClient = new EVMClient({
      rpcUrl: rpcMap[chain],
      evmWalletDetails: { useWindowEthereum: true },
    });

    return await evmClient.broadcastToGateway(gatewayInfo.address, { data });
  }

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
