import { HttpClient } from "@cosmjs/tendermint-rpc";
import { DeliverTxResponse, StargateClient } from "@cosmjs/stargate";
import { fromBase64 } from "@cosmjs/encoding";
import { AxelarTxResponse } from "../../../types";

export function createRPCClient(rpcUrl: string) {
  return new HttpClient(rpcUrl);
}

export async function broadcastCosmosTx(
  base64Tx: string,
  rpcUrl: string
): Promise<AxelarTxResponse> {
  const txBytes = fromBase64(base64Tx);
  const cosmjs = await StargateClient.connect(rpcUrl);
  return cosmjs.broadcastTx(txBytes).then(convertToAxelarTxResponse);
}

export async function broadcastCosmosTxBytes(
  txBytes: Uint8Array,
  rpcUrl: string
): Promise<AxelarTxResponse> {
  const cosmjs = await StargateClient.connect(rpcUrl);
  return cosmjs.broadcastTx(txBytes).then(convertToAxelarTxResponse);
}

function convertToAxelarTxResponse(response: DeliverTxResponse): AxelarTxResponse {
  return {
    ...response,
    rawLog: response.rawLog || "[]",
  };
}
