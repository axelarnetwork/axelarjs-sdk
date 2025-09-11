import { BigNumber } from "ethers";
import Long from "long";
import { EvmChain } from "../../../constants/EvmChain";
export declare const uuidStub: () => string;
export declare const ethAddressStub: () => string;
export declare const terraAddressStub: () => string;
export declare const activeChainsStub: () => string[];
export declare const otcStub: () => {
    otc: string;
    validationMsg: string;
};
export declare const batchCommandStub: () => {
    data: string;
    status: string;
    key_id: string;
    execute_data: string;
    prev_batched_commands_id: string;
    command_ids: string[];
    batch_id: string;
    chain: string;
    id: string;
};
export declare const findEventAndConfirmStub: () => {
    success: boolean;
    errorMessage: undefined;
    infoLogs: string[];
    commandId: string;
    confirmTx: {
        height: number;
        code: number;
        transactionHash: string;
        rawLog: any;
        gasUsed: bigint;
        gasWanted: bigint;
        events: never[];
        msgResponses: never[];
        txIndex: number;
    };
    eventResponse: {
        event: {
            chain: string;
            txId: Buffer;
            index: Long;
            status: number;
            tokenSent: undefined;
            contractCall: undefined;
            contractCallWithToken: undefined;
            transfer: undefined;
            tokenDeployed: undefined;
            multisigOwnershipTransferred: undefined;
            multisigOperatorshipTransferred: undefined;
        };
    };
};
export declare const apiErrorStub: () => {
    message: string;
    uncaught: boolean;
    fullMessage: string;
};
export declare const roomIdStub: () => {
    roomId: string;
};
export declare const depositAddressPayloadStub: () => {
    fromChain: string;
    toChain: string;
    asset: string;
    publicAddress: string;
    destinationAddress: string;
    signature: string;
};
export declare const linkEventStub: () => {
    Type: string;
    Attributes: {
        asset: string;
        depositAddress: string;
        destinationAddress: string;
        destinationChain: string;
        module: string;
        sourceChain: string;
    };
    Height: number;
    newRoomId: string;
};
export declare const newRoomIdStub: () => string;
export declare const executeParamsStub: () => {
    commandId: string;
    destinationChain: EvmChain;
    destinationContractAddress: string;
    isContractCallWithToken: boolean;
    payload: string;
    sourceAddress: string;
    sourceChain: EvmChain;
    srcTxInfo: {
        transactionHash: string;
        transactionIndex: number;
        logIndex: number;
    };
    amount: string;
    symbol: string;
};
export declare const contractReceiptStub: () => {
    transactionHash: string;
    blockHash: string;
    from: string;
    to: string;
    confirmations: number;
    gasUsed: BigNumber;
    effectiveGasPrice: BigNumber;
    cumulativeGasUsed: BigNumber;
    logs: never[];
    logsBloom: string;
    contractAddress: string;
    byzantium: boolean;
    blockNumber: number;
    type: number;
    transactionIndex: number;
};
export declare const evmEventStubResponse: () => {
    success: boolean;
    errorMessage: string;
    commandId: string;
    infoLog: string;
    eventResponse: {
        event: {
            chain: string;
            txId: Buffer;
            index: Long;
            status: number;
            tokenSent: undefined;
            contractCall: undefined;
            contractCallWithToken: undefined;
            transfer: undefined;
            tokenDeployed: undefined;
            multisigOwnershipTransferred: undefined;
            multisigOperatorshipTransferred: undefined;
        };
    };
};
export declare const chainInfoStub: () => {
    id: string;
    assets: never[];
    rpc: never[];
    chainSymbol: string;
    chainName: string;
    fullySupported: boolean;
    estimatedWaitTime: number;
    txFeeInPercent: number;
    module: string;
    chainIdentifier: {
        "devnet-amplifier": string;
        testnet: string;
        mainnet: string;
    };
    nativeAsset: string[];
    addressPrefix: string;
    confirmLevel: number;
};
export declare const axelarTxResponseStub: (rawLog?: any) => {
    height: number;
    code: number;
    transactionHash: string;
    rawLog: any;
    gasUsed: bigint;
    gasWanted: bigint;
    events: never[];
    msgResponses: never[];
    txIndex: number;
};
export declare const batchedCommandResponseStub: (executeData?: string) => {
    executeData: string;
    id: string;
    status: number;
    data: string;
    keyId: string;
    signature: never[];
    prevBatchedCommandsId: string;
    commandIds: never[];
};
export declare const transferResponseExecutedStub: () => {
    source: {
        id: string;
        type: string;
        status_code: number;
        status: string;
        height: number;
        created_at: {
            ms: number;
            hour: number;
            day: number;
            week: number;
            month: number;
            quarter: number;
            year: number;
        };
        sender_chain: string;
        sender_address: string;
        recipient_address: string;
        amount: number;
        denom: string;
        original_sender_chain: string;
        original_recipient_chain: string;
        recipient_chain: string;
        fee: number;
        amount_received: number;
        value: number;
    };
    link: {
        recipient_chain: string;
        denom: string;
        txhash: string;
        height: number;
        sender_chain: string;
        deposit_address: string;
        type: string;
        original_sender_chain: string;
        original_recipient_chain: string;
        sender_address: string;
        recipient_address: string;
        price: number;
        id: string;
    };
    confirm_deposit: {
        amount: string;
        status_code: number;
        recipient_chain: string;
        module: string;
        deposit_address: string;
        created_at: {
            week: number;
            hour: number;
            month: number;
            year: number;
            ms: number;
            day: number;
            quarter: number;
        };
        transfer_id: number;
        type: string;
        sender_chain: string;
        id: string;
        denom: string;
        user: string;
        status: string;
        height: number;
    };
    sign_batch: {
        chain: string;
        command_id: string;
        logIndex: number;
        batch_id: string;
        block_timestamp: number;
        created_at: {
            week: number;
            hour: number;
            month: number;
            year: number;
            ms: number;
            day: number;
            quarter: number;
        };
        executed: boolean;
        transactionIndex: number;
        transfer_id: number;
        transactionHash: string;
    };
    id: string;
    status: string;
}[];
export declare const getFeeStub: () => {
    method: string;
    params: {
        method: string;
        sourceChain: string;
        destinationChain: string;
        sourceTokenAddress: string;
    };
    result: {
        base_fee: number;
        source_token: {
            contract_address: string;
            symbol: string;
            name: string;
            decimals: number;
            token_price: {
                usd: number;
            };
            gas_price: string;
        };
        source_base_fee: number;
        source_base_fee_string: string;
        destination_native_token: {
            contract_address: string;
            name: string;
            symbol: string;
            decimals: number;
            token_price: {
                usd: number;
            };
            gas_price: string;
        };
        destination_base_fee: number;
    };
    time_spent: number;
};
//# sourceMappingURL=index.d.ts.map