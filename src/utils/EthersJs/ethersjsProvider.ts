import {ethers} from "ethers";

export type ProviderType =
	| 'jsonRPC'
	| 'infura'
	| 'infuraWS'
	| 'moonbeam'
	| 'avalanche'
	| 'fantom'
	| 'polygon'
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

providers.polygon = (url?: string) => new ethers.providers.StaticJsonRpcProvider(
	'https://rpc-mumbai.maticvigil.com', //https://mumbai.polygonscan.com/apis#rpc
	{
		chainId: 80001,
		name: 'polygon-testnet'
	}
);
providers.avalanche = (url?: string) => new ethers.providers.StaticJsonRpcProvider(
	'https://api.avax-test.network/ext/bc/C/rpc', //https://docs.avax.network/build/tutorials/smart-contracts/deploy-a-smart-contract-on-avalanche-using-remix-and-metamask/
	{
		chainId: 43113,
		name: 'Avalanche Testnet C-Chain'
	}
);

providers.fantom = (url?: string) => new ethers.providers.StaticJsonRpcProvider(
	'https://rpc.testnet.fantom.network', //https://docs.fantom.foundation/tutorials/set-up-metamask-testnet
	{
		chainId: 4002,
		name: 'Fantom testnet'
	}
);

providers.moonbeamWS = (url?: string) => new ethers.providers.WebSocketProvider(url || "");

export const getEthersJsProvider = (providerType: ProviderType, environment: string) => {
	if (providerType === 'infuraWS')
		return providers[providerType]("wss://ropsten.infura.io/ws/v3/2be110f3450b494f8d637ed7bb6954e3");
	if (providerType === 'moonbeamWS')
		return providers[providerType]("wss://wss-relay.testnet.moonbeam.network");
	return providers[providerType]();
}