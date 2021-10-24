import {ethers}                                            from "ethers";
import {formatEther}                                       from "ethers/lib/utils";
import {BaseWaitingService}                                from "../models/BaseWaitingService";
import {getEthersJsProvider}                               from "../../TransferAssetBridge/status/utils/ethersjsProvider";
import {IAssetInfo, IBlockchainWaitingService, IChainInfo} from "../../interface";

const axelarBTCTokenAddr: string = '0xEA3f4398DA7Ec007683b46AF7961feD202c92c6F';
const uphotonTokenAddr: string = "0xb1bfDBcd65292792f8fB4036a718e1b5C01fec0C";
const uaxlTokenAddr: string = "0xa27cf99806Cc295fA90f2b6E8b46830BeDd3Be24";

const tokenAddressMap: { [key: string]: string } = {};
tokenAddressMap.btc = axelarBTCTokenAddr;
tokenAddressMap.uphoton = uphotonTokenAddr;
tokenAddressMap.uaxl = uaxlTokenAddr;

const abi: string[] = [
	"function name() view returns (string)",
	"function symbol() view returns (string)",
	"function balanceOf(address) view returns (uint)", 	// Get the account balance
	"event Transfer(address indexed from, address indexed to, uint amount)" 	// An event triggered whenever anyone transfers to someone else, IERC20.sol
];

export default class WaitingService extends BaseWaitingService implements IBlockchainWaitingService {

	private provider;
	private tokenContract;
	private filter: any;

	constructor(chainInfo: IChainInfo, assetInfo: IAssetInfo) {
		console.log("chain info and asset info", chainInfo, assetInfo);
		const tokenContract: string = tokenAddressMap[assetInfo.assetSymbol?.toLowerCase() as string] || "";
		const depositAddress: string = assetInfo.assetAddress as string;
		super(30, depositAddress);
		this.provider = getEthersJsProvider("infura");
		this.tokenContract = new ethers.Contract(tokenContract, abi, this.provider);
		this.filter = this.tokenContract.filters.Transfer(null, depositAddress); //filter all transfers TO my address
	}

	public async wait(address: string, cb: any): Promise<any> {

		console.log("waiting on ethers", address);

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