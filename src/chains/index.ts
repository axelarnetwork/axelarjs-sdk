import {AssetInfo, Chain}       from "../interface";
import Axelar                   from "./Axelar";
import Ethereum                 from "./Ethereum";
import Avalanche                from "./Avalanche";
import Terra                    from "./Terra";
import {allAssets, AssetConfig} from "../assets";
import Fantom                   from "./Fantom";
import Polygon                  from "./Polygon";
import Moonbeam                 from "./Moonbeam";

const rawChains: Chain[] = [
	new Axelar(),
	new Avalanche(),
	new Ethereum(),
	new Fantom(),
	new Moonbeam(),
	new Polygon(),
	new Terra()
];

/*push assets to supported chains*/
rawChains.forEach(({chainInfo}) => {

	const filteredAssetList: AssetConfig[] = allAssets
	.filter(({chain_aliases}) => Object.keys(chain_aliases).indexOf(chainInfo.chainName.toLowerCase()) > -1);

	const assetsList: AssetInfo[] = [];

	filteredAssetList.forEach((asset) => {
		const assetToPush: AssetInfo = asset.chain_aliases[chainInfo.chainName.toLowerCase()]
		assetToPush.common_key = asset.common_key;
		assetToPush.native_chain = asset.native_chain;
		assetToPush.decimals = asset.decimals;
		assetsList.push(assetToPush);
	});

	chainInfo.assets = assetsList;

})

export {rawChains as ChainList};