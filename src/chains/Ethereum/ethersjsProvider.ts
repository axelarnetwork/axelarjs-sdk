import {ethers}     from "ethers";
import {getConfigs} from "../../constants";

type ProviderType =
	| 'jsonRPC'
	| 'infura'
	| 'infuraWS'
	| 'ropsten';

const providers: { [key: string]: (url?: string) => ethers.providers.BaseProvider } = {};

providers.ropsten = (url?: string) => ethers.getDefaultProvider('ropsten');
providers.infura = (url?: string) => new ethers.providers.InfuraProvider('ropsten');
providers.infuraWS = (url?: string) => new ethers.providers.WebSocketProvider(url || "", "ropsten");

export const getEthersJsProvider = (providerType: ProviderType, environment: string) => {
	if (providerType === 'infuraWS') {
		const infuraFromConfigs: string = getConfigs(environment).ethersjsConfigs.infuraProvider;
		const infuraFromEnv: string = process.env.INFURA_PROVIDER as string;
		console.log("providers",infuraFromConfigs,infuraFromEnv);
		return providers[providerType](getConfigs(environment).ethersjsConfigs.infuraProvider);
	}

	return providers[providerType]();
}