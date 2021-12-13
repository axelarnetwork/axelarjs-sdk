import {ethers} from "ethers";

type ProviderType =
	| 'jsonRPC'
	| 'infura'
	| 'infuraWS'
	| 'ropsten';

const providers: { [key: string]: (url?: string) => ethers.providers.BaseProvider } = {};

providers.ropsten = (url?: string) => ethers.getDefaultProvider('ropsten');
providers.infura = (url?: string) => new ethers.providers.InfuraProvider('ropsten');
providers.infuraWS = (url?: string) => new ethers.providers.WebSocketProvider(url || "", "ropsten");

export const getEthersJsProvider = (providerType: ProviderType) => {
	if (providerType === 'infuraWS')
		return providers[providerType]("wss://ropsten.infura.io/ws/v3/2be110f3450b494f8d637ed7bb6954e3");
	return providers[providerType]();
}