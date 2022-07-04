const configsMap: { [environment: string]: EnvironmentConfigs } = {};

export interface EnvironmentConfigs {
  resourceUrl: string;
  axelarRpcUrl: string;
  axelarLcdUrl: string;
  axelarCachingServiceUrl: string;
  recoveryApiUrl: string;
}

const localConfigs: EnvironmentConfigs = {
  resourceUrl: `http://localhost:4000`,
  axelarRpcUrl: "https://axelar-testnet-rpc.axelar-dev.workers.dev",
  axelarLcdUrl: "https://axelar-testnet-lcd.axelar-dev.workers.dev",
  axelarCachingServiceUrl: "https://testnet.api.gmp.axelarscan.io",
  recoveryApiUrl: "https://axelar-signing-relayer-testnet.axelar.dev",
};
const devnetConfigs: EnvironmentConfigs = {
  resourceUrl: `https://nest-server-devnet.axelar.dev`,
  axelarRpcUrl: "",
  axelarLcdUrl: "",
  axelarCachingServiceUrl: "https://devnet.api.gmp.axelarscan.io",
  recoveryApiUrl: "",
};
const testnetConfigs: EnvironmentConfigs = {
  resourceUrl: `https://nest-server-testnet.axelar.dev`,
  axelarRpcUrl: "https://axelar-testnet-rpc.axelar-dev.workers.dev",
  axelarLcdUrl: "https://axelar-testnet-lcd.axelar-dev.workers.dev",
  axelarCachingServiceUrl: "https://testnet.api.gmp.axelarscan.io",
  recoveryApiUrl: "https://axelar-signing-relayer-testnet.axelar.dev",
};
const mainnetConfigs: EnvironmentConfigs = {
  resourceUrl: `https://nest-server-mainnet.axelar.dev`,
  axelarRpcUrl: "https://axelar-rpc.quickapi.com",
  axelarLcdUrl: "https://axelar-lcd.quickapi.com",
  axelarCachingServiceUrl: "https://mainnet.api.gmp.axelarscan.io",
  recoveryApiUrl: "https://axelar-signing-relayer-mainnet.axelar.dev",
};

configsMap["local"] = localConfigs;
configsMap["devnet"] = devnetConfigs;
configsMap["testnet"] = testnetConfigs;
configsMap["mainnet"] = mainnetConfigs;

let configToUse: EnvironmentConfigs;

export const getConfigs = (environment: string): EnvironmentConfigs => {
  if (!configToUse) {
    if (!configsMap[environment]) throw new Error("config environment does not exist");
    configToUse = configsMap[environment];
  }
  return configToUse;
};
