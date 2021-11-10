import {IAssetInfo, IChain}      from "../interface";
import Axelar                    from "./Axelar";
import Ethereum                  from "./Ethereum";
import Avalanche                 from "./Avalanche";
import Terra                     from "./Terra";
import {allAssets, IAssetConfig} from "../constants/assetsPerEnvironment";

const rawChains: IChain[] = [
	new Axelar(),
	new Avalanche(),
	new Ethereum(),
	new Terra()
];

rawChains.forEach(({chainInfo}) => {

	const filteredAssetList: IAssetConfig[] = allAssets
	.filter(({chain_aliases}) => Object.keys(chain_aliases).indexOf(chainInfo.chainName.toLowerCase()) > -1);

	const assetsList: IAssetInfo[] = [];

	filteredAssetList.forEach((asset) => {
		const assetToPush: IAssetInfo = asset.chain_aliases[chainInfo.chainName.toLowerCase()]
		assetToPush.common_key = asset.common_key;
		assetToPush.native_chain = asset.native_chain;
		assetsList.push(assetToPush);
	});

	chainInfo.assets = assetsList;

})

export {rawChains as ChainList};