"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsufficientFundsError = exports.ExecutionRevertedError = exports.GMPQueryError = exports.NotApprovedError = exports.UnsupportedGasTokenError = exports.InvalidGasTokenError = exports.ContractCallError = exports.AlreadyPaidGasFeeError = exports.GasPriceAPIError = exports.AlreadyExecutedError = exports.NotGMPTransactionError = exports.InvalidTransactionError = exports.ErrorMsg = void 0;
const metamaskErrorMsg = (e) => { var _a; return (_a = e.data) === null || _a === void 0 ? void 0 : _a.message; };
const ethersErrorMsg = (e) => { var _a; return (_a = e.error) === null || _a === void 0 ? void 0 : _a.reason; };
const generalErrorMsg = (e) => e.message;
const ErrorMsg = (e) => ethersErrorMsg(e) || metamaskErrorMsg(e) || generalErrorMsg(e);
exports.ErrorMsg = ErrorMsg;
const InvalidTransactionError = (chain) => ({
    success: false,
    error: `Couldn't find a transaction on ${chain}`,
});
exports.InvalidTransactionError = InvalidTransactionError;
const NotGMPTransactionError = () => ({
    success: false,
    error: "Not GMP transaction",
});
exports.NotGMPTransactionError = NotGMPTransactionError;
const AlreadyExecutedError = () => ({
    success: false,
    error: "Already executed",
});
exports.AlreadyExecutedError = AlreadyExecutedError;
const GasPriceAPIError = () => ({
    success: false,
    error: "Couldn't query the gas price",
});
exports.GasPriceAPIError = GasPriceAPIError;
const AlreadyPaidGasFeeError = () => ({
    success: false,
    error: "Already paid sufficient gas fee",
});
exports.AlreadyPaidGasFeeError = AlreadyPaidGasFeeError;
const ContractCallError = (e) => ({
    success: false,
    error: (0, exports.ErrorMsg)(e),
});
exports.ContractCallError = ContractCallError;
const InvalidGasTokenError = () => ({
    success: false,
    error: "Invalid gas token address",
});
exports.InvalidGasTokenError = InvalidGasTokenError;
const UnsupportedGasTokenError = (gasTokenAddress) => ({
    success: false,
    error: `Token address ${gasTokenAddress} is not supported`,
});
exports.UnsupportedGasTokenError = UnsupportedGasTokenError;
const NotApprovedError = () => ({
    success: false,
    error: "Transaction has not approved yet",
});
exports.NotApprovedError = NotApprovedError;
const GMPQueryError = () => ({
    success: false,
    error: "Couldn't query the transaction details",
});
exports.GMPQueryError = GMPQueryError;
const ExecutionRevertedError = (params) => {
    const { commandId, sourceChain, sourceAddress, payload, symbol, amount, isContractCallWithToken, } = params;
    const functionName = isContractCallWithToken ? "executeWithToken" : "execute";
    return {
        success: false,
        error: `Transaction execution was reverted. Please check the implementation of the destination contract's ${functionName} function.`,
        data: {
            functionName,
            args: {
                commandId,
                sourceChain,
                sourceAddress,
                payload,
                symbol,
                amount,
            },
        },
    };
};
exports.ExecutionRevertedError = ExecutionRevertedError;
const InsufficientFundsError = (params) => {
    const { commandId, sourceChain, sourceAddress, payload, symbol, amount, isContractCallWithToken, } = params;
    const functionName = isContractCallWithToken ? "executeWithToken" : "execute";
    return {
        success: false,
        error: "Insufficient funds to pay for transaction gas cost",
        data: {
            functionName,
            args: {
                commandId,
                sourceChain,
                sourceAddress,
                payload,
                symbol,
                amount,
            },
        },
    };
};
exports.InsufficientFundsError = InsufficientFundsError;
//# sourceMappingURL=error.js.map