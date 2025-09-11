import { EvmChain } from "../../../constants/EvmChain";
import { ExecuteParams } from "../AxelarRecoveryApi";
export declare const ErrorMsg: (e: any) => any;
export declare const InvalidTransactionError: (chain: EvmChain | string) => {
    success: boolean;
    error: string;
};
export declare const NotGMPTransactionError: () => {
    success: boolean;
    error: string;
};
export declare const AlreadyExecutedError: () => {
    success: boolean;
    error: string;
};
export declare const GasPriceAPIError: () => {
    success: boolean;
    error: string;
};
export declare const AlreadyPaidGasFeeError: () => {
    success: boolean;
    error: string;
};
export declare const ContractCallError: (e: any) => {
    success: boolean;
    error: any;
};
export declare const InvalidGasTokenError: () => {
    success: boolean;
    error: string;
};
export declare const UnsupportedGasTokenError: (gasTokenAddress: string) => {
    success: boolean;
    error: string;
};
export declare const NotApprovedError: () => {
    success: boolean;
    error: string;
};
export declare const GMPQueryError: () => {
    success: boolean;
    error: string;
};
export declare const ExecutionRevertedError: (params: ExecuteParams) => {
    success: boolean;
    error: string;
    data: {
        functionName: string;
        args: {
            commandId: string;
            sourceChain: string;
            sourceAddress: string;
            payload: string;
            symbol: string | undefined;
            amount: string | undefined;
        };
    };
};
export declare const InsufficientFundsError: (params: ExecuteParams) => {
    success: boolean;
    error: string;
    data: {
        functionName: string;
        args: {
            commandId: string;
            sourceChain: string;
            sourceAddress: string;
            payload: string;
            symbol: string | undefined;
            amount: string | undefined;
        };
    };
};
//# sourceMappingURL=error.d.ts.map