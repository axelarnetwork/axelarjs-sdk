import { TransactionRequest } from "@ethersproject/abstract-provider";
import { ethers, Signer, UnsignedTransaction } from "ethers";
import { TxOption } from "./types";
export declare class GatewayTx {
    txRequest: TransactionRequest;
    private provider;
    constructor(unsignedTx: UnsignedTransaction, provider: ethers.providers.Provider);
    send(signer: Signer, txOption?: TxOption): Promise<ethers.providers.TransactionResponse>;
    estimateGas(): Promise<ethers.BigNumber>;
}
//# sourceMappingURL=GatewayTx.d.ts.map