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
		ethereum: { tokenAddressMap: {
				"AXL": "0xBf96Dfc6AE44e880681b7221deE21E900BC0F21c",
				"UST": "0x5f1E1bdc2c73EFA2eEEe6b30128d968791D1c55C",
				"LUNA": "0xB7454D02D4190dAe72be2051482aCF044435C5D8"
			},
			providerOptions: { provider: "https://ropsten.infura.io/v3/467477790bfa4b7684be1336e789a068" } },
		moonbeam: { tokenAddressMap: {
				"AXL": "0xa9d0D7b596AC9F1704E886892870daB084ECd220",
				"UST": "0x1c84ea8C5Fd26f8e49aF418De742982980d88593",
				"LUNA": "0x3a89372397265fAFd704fb8DA373926901CEFA19"
			},
			providerOptions: { provider: 'https://rpc.api.moonbase.moonbeam.network', network: {chainId: 1287, name: 'moonbase-alpha'}}},
		avalanche: { tokenAddressMap: {
				"AXL": "0x5a3cF244040Ab7C8e6B192E8eb8eF6C78C9D612b",
				"UST": "0x0749e7902520ab6b3DBD28a1203A2d358700655e",
				"LUNA": "0x28EE721a8128ee8ff57f14b131535E05b88fd636"
			},
			providerOptions: { provider: 'https://api.avax-test.network/ext/bc/C/rpc', network: {chainId: 43113, name: 'Avalanche Testnet C-Chain'}}},
		fantom: { tokenAddressMap: {
				"AXL": "0x0efE77aEf986684650c84C149e0e37196D9b7abc",
				"UST": "0x243615425b166719A13875A5Dc044094DDF3dA4d",
				"LUNA": "0x79e1b09d919AE79D039BB81BEB7c53C70f95719B"
			},
			providerOptions: { provider: 'https://rpc.testnet.fantom.network', network: {chainId: 4002, name: 'Fantom testnet'}}},
		polygon: { tokenAddressMap: {
				"AXL": "0x578aBd5AD95D0e85CB9b508295D4bC1B35496f8a",
				"UST": "0x1912e95A44960c785e96d43651660aF55cA84ab8",
				"LUNA": "0xaf11e7D46A146256D9178251CBe8A1e5E6218f90"
			},
			providerOptions: { provider: 'https://polygon-mumbai.infura.io/v3/467477790bfa4b7684be1336e789a068', network: {chainId: 80001, name: 'polygon-testnet'}}},
	},
	resourceUrl: `https://bridge-rest-server.devnet.axelar.dev`
}

const localConfigs: EnvironmentConfigs = cloneDeep(devnetConfigs);
localConfigs.resourceUrl = 'http://localhost:4000';
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
			providerOptions: { provider: "https://mainnet.infura.io/v3/467477790bfa4b7684be1336e789a068" }
		},
		moonbeam: { tokenAddressMap: {
				"AXL": "0x3eacbDC6C382ea22b78aCc158581A55aaF4ef3Cc",
				"UST": "0x085416975fe14C2A731a97eC38B9bF8135231F62",
				"LUNA": "0x31DAB3430f3081dfF3Ccd80F17AD98583437B213"
			}, providerOptions: { provider: 'https://rpc.api.moonbeam.network', network: {chainId: 1284, name: 'Moonbeam'}}}, //https://docs.moonbeam.network/tokens/connect/metamask/
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
			providerOptions: { provider: 'https://withered-divine-waterfall.fantom.quiknode.pro', network: {chainId: 250, name: 'Fantom Opera'}}
		},
		polygon: { tokenAddressMap: {
				"AXL": "0x161cE0D2a3F625654abF0098B06e9EAF5f308691",
				"UST": "0xeDDc6eDe8F3AF9B4971e1Fa9639314905458bE87",
				"LUNA": "0xa17927fB75E9faEA10C08259902d0468b3DEad88"
			},
			providerOptions: { provider: 'https://polygon-mainnet.infura.io/v3/467477790bfa4b7684be1336e789a068', network: {chainId: 137, name: 'polygon-mainnet'}}
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