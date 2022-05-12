const configsMap: { [environment: string]: EnvironmentConfigs } = {};

export interface EnvironmentConfigs {
  resourceUrl: string;
  axelarRpcUrl: string;
  axelarLcdUrl: string;
  axelarCachingServiceUrl: string;
}

const localConfigs: EnvironmentConfigs = {
  resourceUrl: `http://localhost:4000`,
  axelarRpcUrl: "https://axelartest-rpc.quickapi.com",
  axelarLcdUrl: "https://axelartest-lcd.quickapi.com",
  axelarCachingServiceUrl: "https://testnet.api.gmp.axelarscan.io"
};
const devnetConfigs: EnvironmentConfigs = {
  resourceUrl: `https://nest-server-devnet.axelar.dev`,
  axelarRpcUrl: "",
  axelarLcdUrl: "",
  axelarCachingServiceUrl: "https://devnet.api.gmp.axelarscan.io"
};
const testnetConfigs: EnvironmentConfigs = {
  resourceUrl: `https://nest-server-testnet.axelar.dev`,
  axelarRpcUrl: "https://axelartest-rpc.quickapi.com",
  axelarLcdUrl: "https://axelartest-lcd.quickapi.com",
  axelarCachingServiceUrl: "https://testnet.api.gmp.axelarscan.io"
};
const mainnetConfigs: EnvironmentConfigs = {
  resourceUrl: `https://nest-server-mainnet.axelar.dev`,
  axelarRpcUrl: "https://axelar-rpc.quickapi.com",
  axelarLcdUrl: "https://axelar-lcd.quickapi.com",
  axelarCachingServiceUrl: "https://mainnet.api.gmp.axelarscan.io"
};

configsMap["local"] = localConfigs;
configsMap["devnet"] = devnetConfigs;
configsMap["testnet"] = testnetConfigs;
configsMap["mainnet"] = mainnetConfigs;

let configToUse: EnvironmentConfigs;

export const getConfigs = (environment: string): EnvironmentConfigs => {
  if (!configToUse) {
    if (!configsMap[environment])
      throw new Error("config environment does not exist");
    configToUse = configsMap[environment];
  }
  return configToUse;
};
