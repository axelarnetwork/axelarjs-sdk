import {ethers}     from "ethers";
import { Network } from "@ethersproject/networks";
import {getConfigs} from "../../constants";

export type ProviderType =
	| 'ethereum'
	| 'moonbeam'
	| 'avalanche'
	| 'fantom'
	| 'polygon';

const providers: { [key: string]: (provider: string, networkOptions?: Network | undefined) => ethers.providers.BaseProvider } = {};

providers.ethereum = (provider: string) => new ethers.providers.WebSocketProvider(provider);
providers.avalanche = (provider: string, networkOptions: Network | undefined) => new ethers.providers.StaticJsonRpcProvider(provider, networkOptions);
providers.moonbeam = (provider: string, networkOptions: Network | undefined) => new ethers.providers.StaticJsonRpcProvider(provider, networkOptions);
providers.polygon = (provider: string, networkOptions: Network | undefined) => new ethers.providers.StaticJsonRpcProvider(provider, networkOptions);
providers.fantom = (provider: string, networkOptions: Network | undefined) => new ethers.providers.StaticJsonRpcProvider(provider, networkOptions);

export const getEthersJsProvider = (providerType: ProviderType, environment: string) => {

	const provider: string = getConfigs(environment).ethersJsConfigs[providerType as string]?.providerOptions.provider as string;
	const networkOptions: Network | undefined = getConfigs(environment).ethersJsConfigs[providerType as string]?.providerOptions.network;

	if (providers[providerType])
		return providers[providerType](provider, networkOptions);

	throw new Error(`provider not found for: ${providerType} in ${environment}`);
}