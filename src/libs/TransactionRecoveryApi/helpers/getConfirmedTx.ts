import { Environment } from "src/libs/types";
import AxelarRpcClient from "../client/AxelarRpcClient";

export async function getConfirmedTx(txHash: string, depositAddress: string, environment: Environment) {
    const client = AxelarRpcClient.getOrCreate();
    const transactions = await client.query(confirmDepositRequest(txHash, depositAddress));
  
    if (!transactions.length) {
      return null;
    }
    const tx = transactions[0];
    const broadcastTx = convertRpcTxToBroadcastTxSuccess(tx);
    return broadcastTx;
  }