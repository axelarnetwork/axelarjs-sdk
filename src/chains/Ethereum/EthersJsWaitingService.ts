import {Contract, ethers}                                   from "ethers";
import {formatEther}                                        from "ethers/lib/utils";
import {BaseWaitingService}                                 from "../models/BaseWaitingService";
import {getEthersJsProvider}                                from "./ethersjsProvider";
import {IAssetInfo, IBlockchainWaitingService, IChainInfo}  from "../../interface";
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

	constructor(assetInfo: IAssetInfo) {
		super(30, assetInfo.assetAddress as string);
	}

	public async build(chainInfo: IChainInfo, assetInfo: IAssetInfo, environment: string): Promise<EthersJsWaitingService> {
		const api: EthersJsWaitingService = new EthersJsWaitingService(assetInfo);
		await api.init(chainInfo, assetInfo, environment);
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

	private async init(chainInfo: IChainInfo, assetInfo: IAssetInfo, environment: string) {

		const configs: IEnvironmentConfigs = getConfigs(environment);
		const tokenAddressMap: IEthersJsTokenMap = configs?.ethersjsConfigs?.tokenAddressMap;
		const tokenSymbol: keyof IEthersJsTokenMap = assetInfo.assetSymbol as keyof IEthersJsTokenMap;
		const depositAddress: string = assetInfo.assetAddress as string;

		let tokenContract: string;
		if (tokenAddressMap[tokenSymbol]) {
			tokenContract = tokenAddressMap[tokenSymbol] as string;
		} else {
			const endpoint = `/getTokenAddress?module=evm&chain=ethereum&asset=${assetInfo.common_key}`;
			const resourceUrl: string = configs.resourceUrl;
			const response = await new RestServices(resourceUrl).get(endpoint);
			tokenContract = response.data;
			tokenAddressMap[tokenSymbol] = tokenContract;
		}

		console.log("EthersJsWaitingService token contract for " + tokenSymbol + ": ", tokenContract);

		this.provider = getEthersJsProvider("infura");
		this.tokenContract = new ethers.Contract(tokenContract, abi, this.provider);
		this.filter = this.tokenContract.filters.Transfer(null, depositAddress); //filter all transfers TO my address
	}

}