import { HttpClient } from "@cosmjs/tendermint-rpc";
import { DeliverTxResponse, StargateClient } from "@cosmjs/stargate";
import { fromBase64, toHex } from "@cosmjs/encoding";

export function createRPCClient(rpcUrl: string) {
  return new HttpClient(rpcUrl);
}

export async function broadcastCosmosTx(base64Tx: string, rpcUrl: string): Promise<DeliverTxResponse> {
    const txBytes = fromBase64(base64Tx);
    const cosmjs = await StargateClient.connect(rpcUrl);
    return cosmjs.broadcastTx(txBytes);
  }