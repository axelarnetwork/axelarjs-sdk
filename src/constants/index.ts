import {cloneDeep} from "lodash";

export const GREPTCHA_SITE_KEY = "6LcxwsocAAAAANQ1t72JEcligfeSr7SSq_pDC9vR"; //this is intentionally public

const configsMap: { [key: string]: IEnvironmentConfigs } = {};

export type IEthersJsTokenMap = { [tokenKey: string]: string }

interface IEthersJsConfigs {
	tokenAddressMap: IEthersJsTokenMap;
}

export interface IEnvironmentConfigs {
	ethereum: IEthersJsConfigs;
	moonbeam: IEthersJsConfigs;
	resourceUrl: string;
}

const devnetConfigs: IEnvironmentConfigs = {
	ethereum: { tokenAddressMap: {} },
	moonbeam: { tokenAddressMap: {} },
	resourceUrl: `https://axelar-bridge-devnet.herokuapp.com`
}

const localConfigs: IEnvironmentConfigs = cloneDeep(devnetConfigs);
localConfigs.resourceUrl = `http://localhost:4000`;

const testnetConfigs: IEnvironmentConfigs = {
	ethereum: { tokenAddressMap: {} },
	moonbeam: { tokenAddressMap: {} },
	resourceUrl: `https://axelar-bridge-testnet.herokuapp.com`
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