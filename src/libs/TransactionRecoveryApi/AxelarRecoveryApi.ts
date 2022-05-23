import { EnvironmentConfigs, getConfigs } from "src/constants";
import { AxelarRecoveryAPIConfig, Environment } from "../types";

export abstract class AxelarRecoveryApi {
    readonly environment: Environment;
    readonly recoveryApiUrl: string;
    readonly axelarRpcUrl: string;
  
    public constructor(config: AxelarRecoveryAPIConfig) {
      const { environment } = config;
      const links: EnvironmentConfigs = getConfigs(environment);
      this.recoveryApiUrl = links.recoveryApiUrl;
      this.axelarRpcUrl = links.axelarRpcUrl;
    }

    public async createPendingTransfers() {}

    public async signCommands() {}

    public async queryBatchedCommands() {}

}