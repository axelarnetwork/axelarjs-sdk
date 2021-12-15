export const findModuleForChainName = (chainName: string): string | null => {

	const evmModules = ["avalanche", "ethereum", "fantom", "moonbeam", "polygon"],
		axelarnet = ["cosmos", "axelar", "terra"];

	if (evmModules.indexOf(chainName) >= 0)
		return "evm";
	if (axelarnet.indexOf(chainName) >= 0)
		return "axelarnet";

	throw new Error("module not found for: " + chainName);

}