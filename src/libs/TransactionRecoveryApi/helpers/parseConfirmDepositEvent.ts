import { DeliverTxResponse } from "@cosmjs/stargate";
import { AxelarRetryResponse, ConfirmDepositResponse, RetryErrorRecovery } from "../interface";
import { ethers } from "ethers";
import { getAmountFromAmountSymbol } from "./getAmountFromAmountSymbol";
import { getSymbolFromAmountSymbol } from "./getSymbolFromAmountSymbol";

export function parseConfirmDepositCosmosResponse(
  tx: DeliverTxResponse
): AxelarRetryResponse<ConfirmDepositResponse> {
  const hash = tx.transactionHash;
  try {
    const log = JSON.parse(tx.rawLog || "");
    const eventKeys = ["chain", "amount", "depositAddress", "transferID"];
    const targetEvent = log[0].events.find(
      (event: any) => event.type === "depositConfirmation"
    );
    const attributes = targetEvent.attributes;
    const events: { [key: string]: any } = {};
    for (const attribute of attributes) {
      if (eventKeys.indexOf(attribute.key) > -1) {
        events[attribute.key] = attribute;
      }
    }
    const commandId = ethers.utils
      .hexZeroPad(
        ethers.utils.hexlify(parseInt(events["transferID"].value)),
        32
      )
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
        depositToken: events["tokenAddress"]?.value
      }
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
        retry: RetryErrorRecovery.REFETCH
      };
    }
    return null;
  };
  
  const alreadyConfirmedErrorHandler = (tx: DeliverTxResponse): AxelarRetryResponse<any> | null => {
    if ( (tx && tx.rawLog) &&
      (tx.rawLog?.indexOf("already burned") > -1 ||
      tx.rawLog?.indexOf("already confirmed") > -1 ||
      tx.rawLog?.indexOf("cannot delete existing poll") > -1)
    ) {
      return {
        status: false,
        data: null,
        error: tx.rawLog,
        retry: RetryErrorRecovery.SKIP
      };
    }
    return null;
  };
  
  const depositNotArrivedYetErrorHandler = (tx: DeliverTxResponse): AxelarRetryResponse<any> | null => {
    if (tx && tx.rawLog && tx.rawLog?.indexOf("holds no fund") > -1) {
      return {
        status: false,
        data: null,
        error: tx.rawLog,
        retry: RetryErrorRecovery.REBROADCAST
      };
    }
    return null;
  };