const configsMap: { [environment: string]: EnvironmentConfigs } = {};

export interface EnvironmentConfigs {
  resourceUrl: string;
}

const localConfigs: EnvironmentConfigs = {
  resourceUrl: `http://localhost:4000`,
};
const devnetConfigs: EnvironmentConfigs = {
  resourceUrl: `https://nest-server-devnet.axelar.dev`,
};
const testnetConfigs: EnvironmentConfigs = {
  resourceUrl: `https://nest-server-testnet.axelar.dev`,
};
const mainnetConfigs: EnvironmentConfigs = {
  resourceUrl: `https://nest-server-mainnet.axelar.dev`,
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
