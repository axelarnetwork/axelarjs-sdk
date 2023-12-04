const configsMap: { [environment: string]: EnvironmentConfigs } = {};

export interface EnvironmentConfigs {
  resourceUrl: string;
  axelarRpcUrl: string;
  axelarLcdUrl: string;
  axelarGMPApiUrl: string;
  axelarscanBaseApiUrl: string;
  depositServiceUrl: string;
  recoveryApiUrl: string;
  axelarCrosschainApiUrl: string;
  axelarscanUrl: string;
  wssStatus: string;
}

const localConfigs: EnvironmentConfigs = {
  resourceUrl: "http://localhost:4000",
  axelarRpcUrl: "https://axelar-testnet-rpc.axelar-dev.workers.dev",
  axelarLcdUrl: "https://axelar-testnet-lcd.axelar-dev.workers.dev",
  axelarGMPApiUrl: "https://testnet.api.gmp.axelarscan.io",
  axelarscanBaseApiUrl: "",
  depositServiceUrl: "https://deposit-service-devnet-release.devnet.axelar.dev",
  recoveryApiUrl: "https://axelar-signing-relayer-testnet.axelar.dev",
  axelarCrosschainApiUrl: "https://testnet.api.axelarscan.io/cross-chain",
  axelarscanUrl: "https://testnet.axelarscan.io",
  wssStatus: "",
};
const devnetConfigs: EnvironmentConfigs = {
  resourceUrl: "https://nest-server-devnet.axelar.dev",
  axelarRpcUrl: "",
  axelarLcdUrl: "",
  axelarGMPApiUrl: "https://devnet.api.gmp.axelarscan.io",
  axelarscanBaseApiUrl: "",
  depositServiceUrl: "https://deposit-service-devnet-release.devnet.axelar.dev",
  recoveryApiUrl: "",
  axelarCrosschainApiUrl: "",
  axelarscanUrl: "",
  wssStatus: "",
};
const testnetConfigs: EnvironmentConfigs = {
  resourceUrl: "https://nest-server-testnet.axelar.dev",
  axelarRpcUrl: "https://rpc-axelar-testnet.imperator.co:443", // "https://testnet.rpc.axelar.dev/chain/axelar",
  axelarLcdUrl: "https://lcd-axelar-testnet.imperator.co",
  depositServiceUrl: "https://deposit-service.testnet.axelar.dev",
  axelarGMPApiUrl: "https://testnet.api.gmp.axelarscan.io",
  axelarscanBaseApiUrl: "https://testnet.api.axelarscan.io",
  recoveryApiUrl: "https://axelar-signing-relayer-testnet.axelar.dev",
  axelarCrosschainApiUrl: "https://testnet.api.axelarscan.io/cross-chain",
  axelarscanUrl: "https://testnet.axelarscan.io",
  wssStatus: "wss://gopr1yb0jj.execute-api.us-east-2.amazonaws.com/Test",
};
const mainnetConfigs: EnvironmentConfigs = {
  resourceUrl: "https://nest-server-mainnet.axelar.dev",
  axelarRpcUrl: "https://mainnet.rpc.axelar.dev/chain/axelar",
  axelarLcdUrl: "https://lcd-axelar.imperator.co",
  axelarGMPApiUrl: "https://api.gmp.axelarscan.io",
  axelarscanBaseApiUrl: "https://api.axelarscan.io",
  depositServiceUrl: "https://deposit-service.mainnet.axelar.dev",
  recoveryApiUrl: "https://axelar-signing-relayer-mainnet.axelar.dev",
  axelarCrosschainApiUrl: "https://api.axelarscan.io/cross-chain",
  axelarscanUrl: "https://axelarscan.io",
  wssStatus: "wss://t36nphohri.execute-api.us-east-2.amazonaws.com/Prod",
};

configsMap["local"] = localConfigs;
configsMap["devnet"] = devnetConfigs;
configsMap["testnet"] = testnetConfigs;
configsMap["mainnet"] = mainnetConfigs;

export const getConfigs = (environment: string): EnvironmentConfigs => {
  const configToUse = configsMap[environment];
  if (!configToUse)
    throw new Error(`config environment does not exist for environment: ${environment}`);
  return configToUse;
};

export * from "./EvmChain";
export * from "./GasToken";
