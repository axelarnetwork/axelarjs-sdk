import { QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { EnvironmentConfigs, getConfigs } from "../../constants";
import { AxelarQueryClientConfig } from "../types";
import { AxelarQueryService, setupQueryExtension } from "./types/index";

export type AxelarQueryClientType = QueryClient & AxelarQueryService;

let instance: AxelarQueryClientType;

export class AxelarQueryClient extends QueryClient {
  static async initOrGetAxelarQueryClient(config: AxelarQueryClientConfig) {
    if (!instance) {
      const { axelarRpcUrl, environment } = config;
      const links: EnvironmentConfigs = getConfigs(environment);
      const rpc: string = axelarRpcUrl || links.axelarRpcUrl;
      instance = QueryClient.withExtensions(
        await Tendermint34Client.connect(rpc),
        setupQueryExtension
      );
    }
    return instance;
  }
}
