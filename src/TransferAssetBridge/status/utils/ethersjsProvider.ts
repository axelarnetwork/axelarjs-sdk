import {ethers} from "ethers";

type ProviderType =
	| 'jsonRPC'
	| 'infura'
	| 'ropsten';

const providers: { [key: string]: ethers.providers.BaseProvider } = {};

providers.ropsten = ethers.getDefaultProvider('ropsten');
providers.infura = new ethers.providers.InfuraProvider('ropsten');

export const getEthersJsProvider = (providerType: ProviderType) => {
	return providers[providerType];
}