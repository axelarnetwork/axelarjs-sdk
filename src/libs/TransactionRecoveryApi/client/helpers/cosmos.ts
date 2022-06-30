import { HttpClient } from "@cosmjs/tendermint-rpc";
import { DeliverTxResponse, StargateClient } from "@cosmjs/stargate";
import { fromBase64, toHex } from "@cosmjs/encoding";

export function createRPCClient(rpcUrl: string) {
  return new HttpClient(rpcUrl);
}

export async function broadcastCosmosTx(
  base64Tx: string,
  rpcUrl: string
): Promise<DeliverTxResponse> {
  const txBytes = fromBase64(base64Tx);
  console.log(txBytes)
  const cosmjs = await StargateClient.connect(rpcUrl);
  return await cosmjs.broadcastTx(txBytes);
}

export async function broadcastCosmosTxBytes(
  txBytes: Uint8Array,
  rpcUrl: string
): Promise<DeliverTxResponse> {
  const cosmjs = await StargateClient.connect(rpcUrl);
  return await cosmjs.broadcastTx(txBytes);
}