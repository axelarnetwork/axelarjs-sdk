import {ethers} from "ethers";

export type ProviderType =
	| 'jsonRPC'
	| 'infura'
	| 'infuraWS'
	| 'moonbeam'
	| 'moonbeamWS'
	| 'ropsten';

const providers: { [key: string]: (url?: string) => ethers.providers.BaseProvider } = {};

providers.ropsten = (url?: string) => ethers.getDefaultProvider('ropsten');
providers.infura = (url?: string) => new ethers.providers.InfuraProvider('ropsten');
providers.infuraWS = (url?: string) => new ethers.providers.WebSocketProvider(url || "");
providers.moonbeam = (url?: string) => new ethers.providers.StaticJsonRpcProvider('https://rpc.testnet.moonbeam.network', {
	chainId: 1287,
	name: 'moonbase-alpha'
});

providers.moonbeamWS = (url?: string) => new ethers.providers.WebSocketProvider(url || "");

export const getEthersJsProvider = (providerType: ProviderType) => {
	if (providerType === 'infuraWS')
		return providers[providerType]("wss://ropsten.infura.io/ws/v3/2be110f3450b494f8d637ed7bb6954e3");
	if (providerType === 'moonbeamWS')
		return providers[providerType]("wss://wss-relay.testnet.moonbeam.network");
	return providers[providerType]();
}