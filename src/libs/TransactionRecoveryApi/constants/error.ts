import { EvmChain } from "../../../constants/EvmChain";
import { ExecuteParams } from "../AxelarRecoveryApi";

const metamaskErrorMsg = (e: any) => e.data?.message;

const ethersErrorMsg = (e: any) => e.error?.reason;

const generalErrorMsg = (e: any) => e.message;

export const ErrorMsg = (e: any) => ethersErrorMsg(e) || metamaskErrorMsg(e) || generalErrorMsg(e);

export const InvalidTransactionError = (chain: EvmChain | string) => ({
  success: false,
  error: `Couldn't find a transaction on ${chain}`,
});

export const NotGMPTransactionError = () => ({
  success: false,
  error: "Not GMP transaction",
});

export const AlreadyExecutedError = () => ({
  success: false,
  error: "Already executed",
});

export const GasPriceAPIError = () => ({
  success: false,
  error: "Couldn't query the gas price",
});

export const AlreadyPaidGasFeeError = () => ({
  success: false,
  error: "Already paid sufficient gas fee",
});

export const ContractCallError = (e: any) => ({
  success: false,
  error: ErrorMsg(e),
});

export const InvalidGasTokenError = () => ({
  success: false,
  error: "Invalid gas token address",
});

export const UnsupportedGasTokenError = (gasTokenAddress: string) => ({
  success: false,
  error: `Token address ${gasTokenAddress} is not supported`,
});

export const NotApprovedError = () => ({
  success: false,
  error: "Transaction has not approved yet",
});

export const GMPQueryError = () => ({
  success: false,
  error: "Couldn't query the transaction details",
});

export const ExecutionRevertedError = (params: ExecuteParams) => {
  const {
    commandId,
    sourceChain,
    sourceAddress,
    payload,
    symbol,
    amount,
    isContractCallWithToken,
  } = params;
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

export const InsufficientFundsError = (params: ExecuteParams) => {
  const {
    commandId,
    sourceChain,
    sourceAddress,
    payload,
    symbol,
    amount,
    isContractCallWithToken,
  } = params;
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
