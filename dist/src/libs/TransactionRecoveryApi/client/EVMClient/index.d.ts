import { ethers } from "ethers";
import { TransactionRequest } from "@ethersproject/providers";
import { EVMClientConfig } from "../../../../libs/types";
export default class EVMClient {
    private provider;
    private signer;
    constructor(config: EVMClientConfig);
    getSigner(): ethers.Wallet | ethers.providers.JsonRpcSigner;
    broadcastToGateway(gatewayAddress: string, opts: TransactionRequest): Promise<ethers.providers.TransactionResponse>;
    buildUnsignedTx(gatewayAddress: string, opts: TransactionRequest): TransactionRequest;
    broadcastSignedTx(signedTx: string): Promise<ethers.providers.TransactionResponse>;
}
//# sourceMappingURL=index.d.ts.map