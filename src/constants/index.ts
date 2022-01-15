import {cloneDeep} from "lodash";
import { Network } from "@ethersproject/networks";

export const GREPTCHA_SITE_KEY = "6LcxwsocAAAAANQ1t72JEcligfeSr7SSq_pDC9vR"; //this is intentionally public

const configsMap: { [environment: string]: EnvironmentConfigs } = {};

export type EthersJsTokenMap = { [tokenKey: string]: string }

export interface EthersJsConfigs {
	tokenAddressMap: EthersJsTokenMap;
	providerOptions: {
		provider: string;
		network?: Network
	}

}

export interface EnvironmentConfigs {
	ethersJsConfigs: { [chain: string]: EthersJsConfigs }
	resourceUrl: string;
}

//https://mumbai.polygonscan.com/apis#rpc
//https://docs.fantom.foundation/tutorials/set-up-metamask-testnet
//https://docs.avax.network/build/tutorials/smart-contracts/deploy-a-smart-contract-on-avalanche-using-remix-and-metamask/
const devnetConfigs: EnvironmentConfigs = {
	ethersJsConfigs: {
		ethereum: { tokenAddressMap: {}, providerOptions: { provider: "wss://ropsten.infura.io/ws/v3/2be110f3450b494f8d637ed7bb6954e3" } },
		moonbeam: { tokenAddressMap: {}, providerOptions: { provider: 'https://rpc.testnet.moonbeam.network', network: {chainId: 1287, name: 'moonbase-alpha'}}},
		avalanche: { tokenAddressMap: {}, providerOptions: { provider: 'https://api.avax-test.network/ext/bc/C/rpc', network: {chainId: 43113, name: 'Avalanche Testnet C-Chain'}}},
		fantom: { tokenAddressMap: {}, providerOptions: { provider: 'https://rpc.testnet.fantom.network', network: {chainId: 4002, name: 'Fantom testnet'}}},
		polygon: { tokenAddressMap: {}, providerOptions: { provider: 'https://rpc-mumbai.maticvigil.com', network: {chainId: 80001, name: 'polygon-testnet'}}},
	},
	resourceUrl: `https://bridge-rest-server.devnet.axelar.dev`
}

const localConfigs: EnvironmentConfigs = cloneDeep(devnetConfigs);

const testnetConfigs: EnvironmentConfigs = cloneDeep(devnetConfigs);
testnetConfigs.resourceUrl = `https://bridge-rest-server.testnet.axelar.dev`;

/* since these tokens are not expected to change, we can set them here so they will not need to be a query*/
const mainnetConfigs: EnvironmentConfigs = {
	ethersJsConfigs: {
		ethereum: {
			tokenAddressMap: {
				"AXL": "0x3eacbDC6C382ea22b78aCc158581A55aaF4ef3Cc",
				"UST": "0x085416975fe14C2A731a97eC38B9bF8135231F62",
				"LUNA": "0x31DAB3430f3081dfF3Ccd80F17AD98583437B213"
			},
			providerOptions: { provider: "wss://mainnet.infura.io/v3/10de1265f1234c93acfec19ca8f4afd7" }
		},
		moonbeam: { tokenAddressMap: {}, providerOptions: { provider: 'https://rpc.api.moonbeam.network', network: {chainId: 1284, name: 'Moonbeam'}}}, //https://docs.moonbeam.network/tokens/connect/metamask/
		avalanche: { tokenAddressMap: {
				"AXL": "0x1B7C03Bc2c25b8B5989F4Bc2872cF9342CEc80AE",
				"UST": "0x260Bbf5698121EB85e7a74f2E45E16Ce762EbE11",
				"LUNA": "0x120AD3e5A7c796349e591F1570D9f7980F4eA9cb"
			},
			providerOptions: { provider: 'https://api.avax.network/ext/bc/C/rpc', network: {chainId: 43114, name: 'Avalanche Mainnet C-Chain'}} //https://support.avax.network/en/articles/4626956-how-do-i-set-up-metamask-on-avalanche
		},
		fantom: { tokenAddressMap: {
				"AXL": "0xE4619601ffF110e649F68FD209080697b8c40DBC",
				"UST": "0x2B9d3F168905067D88d93F094C938BACEe02b0cB",
				"LUNA": "0x5e3C572A97D898Fe359a2Cea31c7D46ba5386895"
			},
			providerOptions: { provider: 'https://rpc.ftm.tools', network: {chainId: 250, name: 'Fantom Opera'}} //https://docs.fantom.foundation/tutorials/set-up-metamask
		},
		polygon: { tokenAddressMap: {
				"AXL": "0x161cE0D2a3F625654abF0098B06e9EAF5f308691",
				"UST": "0xeDDc6eDe8F3AF9B4971e1Fa9639314905458bE87",
				"LUNA": "0xa17927fB75E9faEA10C08259902d0468b3DEad88"
			},
			providerOptions: { provider: 'https://polygon-mainnet.infura.io/v3/10de1265f1234c93acfec19ca8f4afd7', network: {chainId: 137, name: 'polygon-mainnet'}}
		},
	},
	resourceUrl: `https://bridge-rest-server.mainnet.axelar.dev`
}

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
}