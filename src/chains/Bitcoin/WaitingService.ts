import {BaseWaitingService}                                                from "../models/BaseWaitingService";
import {poll}                                                              from "../utils/poll";
import {AssetAndChainInfo, AssetInfo, BlockchainWaitingService, ChainInfo} from "../../interface";
import {SocketServices}                                                    from "../../services/SocketServices";

export interface UnconfirmedTxRef {
	address: string;
	confirmations: number;
	double_spend: boolean;
	preference: string; //"low"
	received: string; //"2021-09-29T01:49:51.656Z"
	spent: boolean;
	tx_hash: string;
	tx_input_n: number;
	tx_output_n: number;
	value: number;
}

export interface TxRef {
	block_height: number;
	confirmations: number
	confirmed: string; //"2021-09-23T16:05:05Z"
	double_spend: boolean;
	ref_balance: number;
	spent: boolean;
	tx_hash: string;
	tx_input_n: number;
	tx_output_n: number;
	value: number;
}

export interface BlockCypherResponse {
	axelarRequiredNumConfirmations: number;
	address: string;
	balance: number;
	final_balance: number;
	final_n_tx: number;
	n_tx: number;
	total_received: number;
	total_sent: number;
	tx_url: string;
	txrefs: TxRef[];
	unconfirmed_balance: 100000
	unconfirmed_n_tx: 1
	unconfirmed_txrefs: UnconfirmedTxRef[]
}

export type StatusResponse = BlockCypherResponseCallback
	| (() => void);

export type BlockCypherResponseCallback = (data: BlockCypherResponse) => any;

export class WaitingService extends BaseWaitingService implements BlockchainWaitingService {

	private maxPollingAttempts: number = 2;
	private pollingInterval: number = 300000;

	constructor(chainInfo: ChainInfo, assetInfo: AssetInfo) {
		super(6, assetInfo.assetAddress as string);
		console.log("waiting service constructor");
	}

	public async wait(assetAndChainInfo: AssetAndChainInfo, interimStatusCb: any, clientSocketConnect: SocketServices): Promise<void> {
		const depositAddress = assetAndChainInfo.assetInfo;
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

		await poll({
			asyncRequest,
			validate: this.validate.bind(this),
			interval: this.pollingInterval,
			maxAttempts: this.maxPollingAttempts
		});
	}

	private validate(res: BlockCypherResponse): boolean {
		return !res.unconfirmed_txrefs
			&& (res.txrefs?.length < 0
				&& res.txrefs[0].confirmations >= this.numConfirmations
			);
	}

}

