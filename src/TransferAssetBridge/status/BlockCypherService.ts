import {WaitingService}                     from "./WaitingService";
import {poll}                               from "./utils";
import {BlockCypherResponse, ITokenAddress} from "../../interface";
import {StatusResponse}                     from "../index";

export default class BlockCypherService extends WaitingService {

	private maxPollingAttempts: number = 2;
	private pollingInterval: number = 5000;

	constructor(depositAddress: string) {
		super(6, depositAddress);
	}

	public async wait(depositAddress: ITokenAddress, interimStatusCb?: StatusResponse) {
		console.log("block cypher service is polling", depositAddress.tokenAddress);
		const canhsBTCTestAddress: string = 'moHY7VwRYhoNK5QwU4WpePWR8mhLb3DtpL';
		const url = `https://api.blockcypher.com/v1/btc/test3/addrs/${canhsBTCTestAddress}`; //TODO: use a real deposit address in devnet, i.e. depositAddress.sourceTokenDepositAddress
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
		return !res.unconfirmed_txrefs && (res.txrefs[0].confirmations >= this.numConfirmations);
	}
}