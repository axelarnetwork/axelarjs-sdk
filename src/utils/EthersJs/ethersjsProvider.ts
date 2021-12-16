import {ethers}     from "ethers";
import {getConfigs} from "../../constants";

export type ProviderType =
	| 'jsonRPC'
	| 'infura'
	| 'infuraWS'
	| 'moonbeam'
	| 'avalanche'
	| 'fantom'
	| 'polygon'
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

	if (providerType === 'infuraWS') {
		const infuraFromConfigs: string = getConfigs(environment).ethereum.infuraProvider as string;
		const infuraFromEnv: string = process.env.INFURA_PROVIDER as string;
		console.log("providers",infuraFromConfigs,infuraFromEnv);
		return providers[providerType](infuraFromConfigs);
	}

	return providers[providerType]();

}