import { Environment } from "../../../libs/types";
import AxelarRpcClient from "../client/AxelarRpcClient";
import { JsonRpcRequest } from "@cosmjs/json-rpc";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { AxelarRetryResponse, ConfirmDepositResponse, RetryErrorRecovery } from "../interface";
import { ethers } from "ethers";

export function parseConfirmDepositCosmosResponse(
  tx: DeliverTxResponse
): AxelarRetryResponse<ConfirmDepositResponse> {
  const hash = tx.transactionHash;
  try {
    const log = JSON.parse(tx.rawLog || "");
    const eventKeys = ["chain", "amount", "depositAddress", "transferID"];
    const targetEvent = log[0].events.find((event: any) => event.type === "depositConfirmation");
    const attributes = targetEvent.attributes;
    const events: { [key: string]: any } = {};
    for (const attribute of attributes) {
      if (eventKeys.indexOf(attribute.key) > -1) {
        events[attribute.key] = attribute;
      }
    }
    const commandId = ethers.utils
      .hexZeroPad(ethers.utils.hexlify(parseInt(events["transferID"].value)), 32)
      .slice(2);

    return {
      status: true,
      error: null,
      data: {
        hash,
        chain: "axelar",
        height: tx.height,
        depositTxHash: null,
        amount: getAmountFromAmountSymbol(events["amount"]?.value),
        depositAddress: events["depositAddress"]?.value,
        depositToken: getSymbolFromAmountSymbol(events["amount"]?.value),
        commandId,
      },
    };
  } catch (e) {
    let errorResponse: AxelarRetryResponse<any> | null;
    errorResponse = accountMismatchErrorHandler(tx);
    errorResponse = alreadyConfirmedErrorHandler(tx);
    errorResponse = depositNotArrivedYetErrorHandler(tx);

    if (errorResponse) return errorResponse;
    throw e;
  }
}

export function parseConfirmDepositEvmResponse(
  tx: DeliverTxResponse
): AxelarRetryResponse<ConfirmDepositResponse> {
  const hash = tx.transactionHash;
  try {
    const log = JSON.parse(tx.rawLog || "");
    const eventKeys = ["module", "chain", "txID", "amount", "depositAddress", "tokenAddress"];
    const attributes = log[0].events[0].attributes;
    const events: { [key: string]: any } = {};
    for (const attribute of attributes) {
      if (eventKeys.indexOf(attribute.key) > -1) {
        events[attribute.key] = attribute;
      }
    }

    return {
      status: true,
      error: null,
      data: {
        hash,
        chain: (events["chain"] || events["module"])?.value,
        height: tx.height,
        amount: events["amount"]?.value,
        depositTxHash: events["txID"]?.value,
        depositAddress: events["depositAddress"]?.value,
        depositToken: events["tokenAddress"]?.value,
      },
    };
  } catch (e) {
    let errorResponse;
    errorResponse = accountMismatchErrorHandler(tx);
    errorResponse = alreadyConfirmedErrorHandler(tx);

    if (errorResponse) return errorResponse;
    throw e;
  }
}

const accountMismatchErrorHandler = (tx: DeliverTxResponse): AxelarRetryResponse<any> | null => {
  if (tx && tx.rawLog && tx.rawLog.indexOf("sequence") > -1) {
    return {
      status: false,
      data: null,
      error: tx.rawLog,
      retry: RetryErrorRecovery.REFETCH,
    };
  }
  return null;
};

const alreadyConfirmedErrorHandler = (tx: DeliverTxResponse): AxelarRetryResponse<any> | null => {
  if (
    tx &&
    tx.rawLog &&
    (tx.rawLog?.indexOf("already burned") > -1 ||
      tx.rawLog?.indexOf("already confirmed") > -1 ||
      tx.rawLog?.indexOf("cannot delete existing poll") > -1)
  ) {
    return {
      status: false,
      data: null,
      error: tx.rawLog,
      retry: RetryErrorRecovery.SKIP,
    };
  }
  return null;
};

const depositNotArrivedYetErrorHandler = (
  tx: DeliverTxResponse
): AxelarRetryResponse<any> | null => {
  if (tx && tx.rawLog && tx.rawLog?.indexOf("holds no fund") > -1) {
    return {
      status: false,
      data: null,
      error: tx.rawLog,
      retry: RetryErrorRecovery.REBROADCAST,
    };
  }
  return null;
};

export async function getConfirmedTx(
  txHash: string,
  depositAddress: string,
  environment: Environment
): Promise<DeliverTxResponse | null> {
  const client = AxelarRpcClient.getOrCreate(environment);
  const query = confirmDepositRequest(txHash, depositAddress);
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
      query,
    },
  };
}

export function createBaseRequest(): JsonRpcRequest {
  return {
    jsonrpc: "2.0",
    id: 1,
    method: "tx_search",
    params: {
      per_page: "10",
      order_by: "desc",
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertRpcTxToBroadcastTxSuccess(tx: any): DeliverTxResponse {
  return {
    height: parseInt(tx.height),
    transactionHash: tx.hash,
    gasUsed: parseInt(tx.tx_result.gas_used),
    gasWanted: parseInt(tx.tx_result.gas_wanted),
    data: tx.tx_result.data,
    rawLog: tx.tx_result.log,
    code: 0,
    events: [],
    msgResponses: [],
    txIndex: 0,
  };
}

export function getAmountFromAmountSymbol(amountSymbol: string) {
  if (amountSymbol.indexOf("ibc") > -1) {
    return amountSymbol.split("ibc")[0];
  } else {
    return amountSymbol.replace(/[^0-9]/g, "");
  }
}

export function getSymbolFromAmountSymbol(amountSymbol: string) {
  if (amountSymbol.indexOf("ibc") > -1) {
    return "ibc" + amountSymbol.split("ibc")[1];
  } else {
    return amountSymbol.replace(/[^a-z]/g, "");
  }
}
