import { Environment } from "src/libs/types";
import AxelarRpcClient from "../client/AxelarRpcClient";
import { JsonRpcRequest } from "@cosmjs/json-rpc";
import { DeliverTxResponse } from "@cosmjs/stargate";

export async function getConfirmedTx(txHash: string, depositAddress: string, environment: Environment): Promise<DeliverTxResponse | null> {
    const client = AxelarRpcClient.getOrCreate(environment);
    const query = confirmDepositRequest(txHash, depositAddress)
    const transactions = await client.query(query);

    if (!transactions.length) {
      return null;
    }
    const tx = transactions[0];
    const broadcastTx = convertRpcTxToBroadcastTxSuccess(tx);
    return broadcastTx;
  }

  export function confirmDepositRequest(txHash: string, depositAddress: string): JsonRpcRequest {
    const baseRequest = createBaseRequest();
    const isEvmTx = txHash.startsWith("0x");
    const query = isEvmTx
      ? `message.action='ConfirmERC20Deposit' AND depositConfirmation.txID='${txHash}'`
      : `message.action='ConfirmDeposit' AND depositConfirmation.depositAddress='${depositAddress}'`;
    return {
      ...baseRequest,
      params: {
        ...baseRequest.params,
        query
      }
    };
  }

  function createBaseRequest(): JsonRpcRequest {
    return {
      jsonrpc: "2.0",
      id: 1,
      method: "tx_search",
      params: {
        per_page: "10",
        order_by: "desc"
      }
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertRpcTxToBroadcastTxSuccess(tx: any): DeliverTxResponse {
  return {
    height: parseInt(tx.height),
    transactionHash: tx.hash,
    gasUsed: parseInt(tx.tx_result.gas_used),
    gasWanted: parseInt(tx.tx_result.gas_wanted),
    data: tx.tx_result.data,
    rawLog: tx.tx_result.log,
    code: 0
  };
}