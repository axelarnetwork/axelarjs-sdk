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
	resourceUrl: `https://axelar-bridge-devnet.herokuapp.com`
}

const localConfigs: EnvironmentConfigs = cloneDeep(devnetConfigs);

const testnetConfigs: EnvironmentConfigs = cloneDeep(devnetConfigs);
testnetConfigs.resourceUrl = `https://axelar-bridge-testnet.herokuapp.com`;

configsMap["local"] = localConfigs;
configsMap["devnet"] = devnetConfigs;
configsMap["testnet"] = testnetConfigs;

let configToUse: EnvironmentConfigs;

export const getConfigs = (environment: string): EnvironmentConfigs => {
	if (!configToUse) {
		if (!configsMap[environment])
			throw new Error("config environment does not exist");
		configToUse = configsMap[environment];
	}
	return configToUse;
}