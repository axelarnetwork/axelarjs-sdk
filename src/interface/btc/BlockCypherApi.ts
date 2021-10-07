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

export type IBlockCypherResponse = (data: BlockCypherResponse) => any;