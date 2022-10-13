const configsMap: { [environment: string]: EnvironmentConfigs } = {};

export interface EnvironmentConfigs {
  resourceUrl: string;
  axelarRpcUrl: string;
  axelarLcdUrl: string;
  axelarGMPApiUrl: string;
  depositServiceUrl: string;
  recoveryApiUrl: string;
  axelarCrosschainApiUrl: string;
  axelarscanUrl: string;
}

const localConfigs: EnvironmentConfigs = {
  resourceUrl: `http://localhost:4000`,
  axelarRpcUrl: "https://axelar-testnet-rpc.axelar-dev.workers.dev",
  axelarLcdUrl: "https://axelar-testnet-lcd.axelar-dev.workers.dev",
  axelarGMPApiUrl: "https://testnet.api.gmp.axelarscan.io",
  depositServiceUrl: "https://deposit-service-devnet-release.devnet.axelar.dev",
  recoveryApiUrl: "https://axelar-signing-relayer-testnet.axelar.dev",
  axelarCrosschainApiUrl: "https://testnet.api.axelarscan.io/cross-chain",
  axelarscanUrl: "https://testnet.axelarscan.io",
};
const devnetConfigs: EnvironmentConfigs = {
  resourceUrl: `https://nest-server-devnet.axelar.dev`,
  axelarRpcUrl: "",
  axelarLcdUrl: "",
  axelarGMPApiUrl: "https://devnet.api.gmp.axelarscan.io",
  depositServiceUrl: "https://deposit-service-devnet-release.devnet.axelar.dev",
  recoveryApiUrl: "",
  axelarCrosschainApiUrl: "",
  axelarscanUrl: "",
};
const testnetConfigs: EnvironmentConfigs = {
  resourceUrl: `https://nest-server-testnet.axelar.dev`,
  axelarRpcUrl: "https://axelar-testnet-rpc.axelar-dev.workers.dev",
  axelarLcdUrl: "https://axelar-testnet-lcd.axelar-dev.workers.dev",
  depositServiceUrl: "https://deposit-service.testnet.axelar.dev",
  axelarGMPApiUrl: "https://testnet.api.gmp.axelarscan.io",
  recoveryApiUrl: "https://axelar-signing-relayer-testnet.axelar.dev",
  axelarCrosschainApiUrl: "https://testnet.api.axelarscan.io/cross-chain",
  axelarscanUrl: "https://testnet.axelarscan.io",
};
const mainnetConfigs: EnvironmentConfigs = {
  resourceUrl: `https://nest-server-mainnet.axelar.dev`,
  axelarRpcUrl: "https://axelar-rpc.quickapi.com",
  axelarLcdUrl: "https://axelar-lcd.quickapi.com",
  axelarGMPApiUrl: "https://api.gmp.axelarscan.io",
  depositServiceUrl: "https://deposit-service.mainnet.axelar.dev",
  recoveryApiUrl: "https://axelar-signing-relayer-mainnet.axelar.dev",
  axelarCrosschainApiUrl: "https://api.axelarscan.io/cross-chain",
  axelarscanUrl: "https://axelarscan.io",
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
