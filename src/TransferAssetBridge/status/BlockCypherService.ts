import {WaitingService}              from "./WaitingService";
import {poll}                                from "./utils";
import {BlockCypherResponse, StatusResponse} from "../../interface";
import {IAsset, ISupportedChainType}         from "../../constants";

export default class BlockCypherService extends WaitingService {

	private maxPollingAttempts: number = 2;
	private pollingInterval: number = 300000;

	constructor(chainInfo: ISupportedChainType, assetInfo: IAsset) {
		super(6, assetInfo.assetAddress as string);
	}

	public async wait(depositAddress: IAsset, interimStatusCb: StatusResponse): Promise<any> {
		console.log("block cypher service is polling", depositAddress.assetAddress);
		const url = `https://api.blockcypher.com/v1/btc/test3/addrs/${depositAddress.assetAddress}`;
		const asyncRequest = (attempts: number) => new Promise((res, rej) => {
			fetch(url, {
				headers: {'Accept': "*/*"}
			})
			.then((response: any) => response.json())
			.then((data: BlockCypherResponse) => {
				data.axelarRequiredNumConfirmations = this.numConfirmations;
				interimStatusCb && interimStatusCb(data);
				res(data);
			})
			.catch((err: any) => {
				rej(err);
			})
		});

		return await poll({
			asyncRequest,
			validate: this.validate.bind(this),
			interval: this.pollingInterval,
			maxAttempts: this.maxPollingAttempts
		});

	}

	private validate(res: BlockCypherResponse): boolean {
		return !res.unconfirmed_txrefs && (res.txrefs?.length < 0 && res.txrefs[0].confirmations >= this.numConfirmations);
	}
}