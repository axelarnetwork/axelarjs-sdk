import { QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { EnvironmentConfigs, getConfigs } from "../../constants";
import { AxelarQueryClientConfig } from "../types";
import { AxelarQueryService, setupQueryExtension } from "./types/index";

export type AxelarQueryClientType = QueryClient & AxelarQueryService;

export class AxelarQueryClient extends QueryClient {
  static async initOrGetAxelarQueryClient(config: AxelarQueryClientConfig) {
    const { axelarRpcUrl, environment } = config;
    const links: EnvironmentConfigs = getConfigs(environment);
    const primaryRpc: string = axelarRpcUrl || links.axelarRpcUrl;
    const fallbacks: string[] = [];
    if (!axelarRpcUrl && environment === "testnet") {
      fallbacks.push(
        "https://axelar-testnet-rpc.axelar-dev.workers.dev",
        "https://axelar-testnet-rpc.qubelabs.io:443"
      );
    }

    const candidates = Array.from(new Set([primaryRpc, ...fallbacks]));
    let lastError: unknown;
    for (const candidate of candidates) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const tm = await Tendermint34Client.connect(candidate);
          // Probe the endpoint to avoid latent 500s after connect
          await tm.status();
          return QueryClient.withExtensions(tm, setupQueryExtension);
        } catch (err) {
          lastError = err;
          if (attempt < 3) await new Promise((r) => setTimeout(r, 250 * attempt));
        }
      }
    }
    throw lastError;
  }
}
