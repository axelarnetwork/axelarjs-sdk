import {cloneDeep} from "lodash";

export const GREPTCHA_SITE_KEY = "6LcxwsocAAAAANQ1t72JEcligfeSr7SSq_pDC9vR"; //this is intentionally public

const configsMap: { [key: string]: IEnvironmentConfigs } = {};

export type IEthersJsTokenMap = { [tokenKey: string]: string }

interface IEthersJsConfigs {
	tokenAddressMap: IEthersJsTokenMap;
	infuraProvider?: string;
}

export interface IEnvironmentConfigs {
	ethereum: IEthersJsConfigs;
	moonbeam: IEthersJsConfigs;
	avalanche: IEthersJsConfigs;
	fantom: IEthersJsConfigs;
	polygon: IEthersJsConfigs;
	resourceUrl: string;
}

const devnetConfigs: IEnvironmentConfigs = {
	ethereum: { tokenAddressMap: {}, infuraProvider: "wss://ropsten.infura.io/ws/v3/2be110f3450b494f8d637ed7bb6954e3" },
	moonbeam: { tokenAddressMap: {} },
	avalanche: { tokenAddressMap: {} },
	fantom: { tokenAddressMap: {} },
	polygon: { tokenAddressMap: {} },
	resourceUrl: `https://axelar-bridge-devnet.herokuapp.com`
}

const localConfigs: IEnvironmentConfigs = cloneDeep(devnetConfigs);
localConfigs.resourceUrl = `http://localhost:4000`;

const testnetConfigs: IEnvironmentConfigs = {

	ethereum: { tokenAddressMap: {}, infuraProvider: "wss://ropsten.infura.io/ws/v3/2be110f3450b494f8d637ed7bb6954e3" },
	moonbeam: { tokenAddressMap: {} },
	avalanche: { tokenAddressMap: {} },
	fantom: { tokenAddressMap: {} },
	polygon: { tokenAddressMap: {} },
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