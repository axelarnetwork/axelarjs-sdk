import { HttpClient } from "@cosmjs/tendermint-rpc";
import { AxelarTxResponse } from "../../../types";
export declare function createRPCClient(rpcUrl: string): HttpClient;
export declare function broadcastCosmosTx(base64Tx: string, rpcUrl: string): Promise<AxelarTxResponse>;
export declare function broadcastCosmosTxBytes(txBytes: Uint8Array, rpcUrl: string): Promise<AxelarTxResponse>;
//# sourceMappingURL=cosmos.d.ts.map