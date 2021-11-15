import {ethers}                                            from "ethers";
import {formatEther}                                       from "ethers/lib/utils";
import {BaseWaitingService}                                from "../models/BaseWaitingService";
import {getEthersJsProvider}                               from "../../TransferAssetBridge/status/utils/ethersjsProvider";
import {IAssetInfo, IBlockchainWaitingService, IChainInfo}  from "../../interface";
import {getConfigs, IEnvironmentConfigs, IEthersJsTokenMap} from "../../constants";

const abi: string[] = [
	"function name() view returns (string)",
	"function symbol() view returns (string)",
	"function balanceOf(address) view returns (uint)", 	// Get the account balance
	"event Transfer(address indexed from, address indexed to, uint amount)" 	// An event triggered whenever anyone transfers to someone else, IERC20.sol
];

export default class EthersJsWaitingService extends BaseWaitingService implements IBlockchainWaitingService {

	private provider;
	private tokenContract;
	private filter: any;

	constructor(chainInfo: IChainInfo, assetInfo: IAssetInfo, environment: string) {

		super(30, assetInfo.assetAddress as string);

		const configs: IEnvironmentConfigs = getConfigs(environment);
		const tokenAddressMap: IEthersJsTokenMap = configs?.ethersjsConfigs?.tokenAddressMap;
		const tokenSymbol: keyof IEthersJsTokenMap = assetInfo.assetSymbol as keyof IEthersJsTokenMap;

		const tokenContract: string = tokenAddressMap[tokenSymbol] || "";
		const depositAddress: string = assetInfo.assetAddress as string;

		this.provider = getEthersJsProvider("infura");
		this.tokenContract = new ethers.Contract(tokenContract, abi, this.provider);
		this.filter = this.tokenContract.filters.Transfer(null, depositAddress); //filter all transfers TO my address

	}

	public async wait(address: string, cb: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.tokenContract.once(this.filter, (from, to, amount, event) => {
				console.log(`Incoming amount of: ${formatEther(amount)}, from: ${from}.`, event);
				event.axelarRequiredNumConfirmations = this.numConfirmations;
				cb(event);
				resolve(event);
			});
		});
	}

}