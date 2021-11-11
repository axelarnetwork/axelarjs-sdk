import {cloneDeep} from "lodash";

export const GREPTCHA_SITE_KEY = "6LcxwsocAAAAANQ1t72JEcligfeSr7SSq_pDC9vR"; //this is intentionally public

const configsMap: { [key: string]: IEnvironmentConfigs } = {};

interface IEthersJsTokenMap {
	axelarPHOT: string;
	AXL: string;
	uLUNA: string;
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
			axelarPHOT: "",
			AXL: "",
			uLUNA: ""
		}
	},
	resourceUrl: `https://axelar-bridge-devnet.herokuapp.com`
}
const localConfigs: IEnvironmentConfigs = cloneDeep(devnetConfigs);
localConfigs.resourceUrl = `http://localhost:4000`;

configsMap["devnet"] = devnetConfigs;
configsMap["local"] = localConfigs;

let configToUse: IEnvironmentConfigs;

export const getConfigs = (environment: string) => {
	if (!configToUse) {
		if (!configsMap[environment])
			throw new Error("config environment does not exist");
		configToUse = configsMap[environment];
	}
	return configToUse;
}