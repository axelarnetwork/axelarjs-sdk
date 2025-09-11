import { Environment } from "../../../libs/types";
import { JsonRpcRequest } from "@cosmjs/json-rpc";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { AxelarRetryResponse, ConfirmDepositResponse } from "../interface";
export declare function parseConfirmDepositCosmosResponse(tx: DeliverTxResponse): AxelarRetryResponse<ConfirmDepositResponse>;
export declare function parseConfirmDepositEvmResponse(tx: DeliverTxResponse): AxelarRetryResponse<ConfirmDepositResponse>;
export declare function getConfirmedTx(txHash: string, depositAddress: string, environment: Environment): Promise<DeliverTxResponse | null>;
export declare function confirmDepositRequest(txHash: string, depositAddress: string): JsonRpcRequest;
export declare function createBaseRequest(): JsonRpcRequest;
export declare function convertRpcTxToBroadcastTxSuccess(tx: any): DeliverTxResponse;
export declare function getAmountFromAmountSymbol(amountSymbol: string): string;
export declare function getSymbolFromAmountSymbol(amountSymbol: string): string;
//# sourceMappingURL=axelarHelper.d.ts.map