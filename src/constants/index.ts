import {cloneDeep} from "lodash";

export const GREPTCHA_SITE_KEY = "6LcxwsocAAAAANQ1t72JEcligfeSr7SSq_pDC9vR"; //this is intentionally public

const configsMap: { [key: string]: IEnvironmentConfigs } = {};

export type IEthersJsTokenMap = {
	AXL: string | null;
}

interface IEthersJsConfigs {
	tokenAddressMap: IEthersJsTokenMap;
}

export interface IEnvironmentConfigs {
	ethersjsConfigs: IEthersJsConfigs;
	resourceUrl: string;
}

const devnetConfigs: IEnvironmentConfigs = {
	ethersjsConfigs: {
		tokenAddressMap: {
			AXL: null,
		}
	},
	resourceUrl: `https://rest-server-devnet.bridge.axelar.dev`
}

const localConfigs: IEnvironmentConfigs = cloneDeep(devnetConfigs);
localConfigs.resourceUrl = `http://localhost:4000`;

const testnetConfigs: IEnvironmentConfigs = {
	ethersjsConfigs: {
		tokenAddressMap: {
			AXL: "",
		}
	},
	resourceUrl: `https://rest-server-testnet.bridge.axelar.dev`
}

configsMap["local"] = localConfigs;
configsMap["devnet"] = devnetConfigs;
configsMap["testnet"] = testnetConfigs;

let configToUse: IEnvironmentConfigs;

export const getConfigs = (environment: string): IEnvironmentConfigs => {
	if (!configToUse) {
		if (!configsMap[environment])
			throw new Error("config environment does not exist");
		configToUse = configsMap[environment];
	}
	return configToUse;
}