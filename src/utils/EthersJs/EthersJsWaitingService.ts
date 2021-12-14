import {Contract, ethers}                                   from "ethers";
import {formatEther}                                        from "ethers/lib/utils";
import {BaseWaitingService}                                from "../../chains/models/BaseWaitingService";
import {getEthersJsProvider, ProviderType}                 from "./ethersjsProvider";
import {IAssetInfo, IBlockchainWaitingService, IChainInfo} from "../../interface";
import {getConfigs, IEnvironmentConfigs, IEthersJsTokenMap} from "../../constants";
import {RestServices}                                       from "../../services/RestServices";

const abi: string[] = [
	"function name() view returns (string)",
	"function symbol() view returns (string)",
	"function balanceOf(address) view returns (uint)",
	"event Transfer(address indexed from, address indexed to, uint amount)"
];

export default class EthersJsWaitingService extends BaseWaitingService implements IBlockchainWaitingService {

	private provider!: ethers.providers.BaseProvider;
	private tokenContract!: Contract;
	private filter!: ethers.EventFilter;

	constructor(chainInfo: IChainInfo, assetInfo: IAssetInfo) {
		super(30, assetInfo.assetAddress as string);
	}

	public async build(chainInfo: IChainInfo, assetInfo: IAssetInfo, environment: string, providerType: ProviderType): Promise<EthersJsWaitingService> {
		const api: EthersJsWaitingService = new EthersJsWaitingService(chainInfo, assetInfo);
		await api.init(chainInfo, assetInfo, environment, providerType);
		return api;
	}

	public async wait(address: string, cb: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.tokenContract.once(this.filter, (from: any, to: any, amount: any, event: any) => {
				console.log(`Incoming amount of: ${formatEther(amount)}, from: ${from}.`, event);
				event.axelarRequiredNumConfirmations = this.numConfirmations;
				cb(event);
				resolve(event);
			});
		});
	}

	private async init(chainInfo: IChainInfo, assetInfo: IAssetInfo, environment: string, providerType: ProviderType) {

		const configs: IEnvironmentConfigs = getConfigs(environment);
		const { tokenAddressMap } = (configs as any)[chainInfo.chainName.toLowerCase()];
		const tokenSymbol: keyof IEthersJsTokenMap = assetInfo.assetSymbol as keyof IEthersJsTokenMap;
		const depositAddress: string = assetInfo.assetAddress as string;

		let tokenContract: string;
		if (tokenAddressMap[tokenSymbol]) {
			tokenContract = tokenAddressMap[tokenSymbol] as string;
		} else {
			const endpoint = `/getTokenAddress?module=evm&chain=${chainInfo?.chainName?.toLowerCase()}&asset=${assetInfo.common_key}`;
			const resourceUrl: string = configs.resourceUrl;
			const response = await new RestServices(resourceUrl).get(endpoint);
			tokenContract = response.data;
			tokenAddressMap[tokenSymbol] = tokenContract;
		}

		console.log("EthersJsWaitingService token contract for " + tokenSymbol + ": ", tokenContract + " on: " + chainInfo.chainName);

		this.provider = getEthersJsProvider(providerType);
		this.tokenContract = new ethers.Contract(tokenContract, abi, this.provider);
		this.filter = this.tokenContract.filters.Transfer(null, depositAddress); //filter all transfers TO my address
	}

}