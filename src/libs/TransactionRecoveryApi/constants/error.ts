import { Contract } from "ethers";
import { EvmChain } from "../../../libs";
import { ExecuteParams } from "../AxelarRecoveryApi";

const metamaskErrorMsg = (e: any) => e.data?.message;

const ethersErrorMsg = (e: any) => e.error?.reason;

const generalErrorMsg = (e: any) => e.message;

export const ErrorMsg = (e: any) => ethersErrorMsg(e) || metamaskErrorMsg(e) || generalErrorMsg(e);

export const InvalidTransactionError = (chain: EvmChain) => ({
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

export const ExecuteError = (e: any, params: ExecuteParams) => {
  const {
    commandId,
    sourceChain,
    sourceAddress,
    payload,
    symbol,
    amount,
    isContractCallWithToken,
  } = params;
  const error = ErrorMsg(e);
  const functionName = isContractCallWithToken ? "executeWithToken" : "execute";

  const data = {
    functionName,
    args: {
      commandId,
      sourceChain,
      sourceAddress,
      payload,
      symbol,
      amount,
    },
  };

  const destContractErrorReasons = ["processing response error", "revert"];
  for (let i = 0; i < destContractErrorReasons.length; i++) {
    if (error.includes(destContractErrorReasons[i])) {
      return {
        success: false,
        error: `Transaction execution was reverted. Please check the implementation of the destination contract's ${
          isContractCallWithToken ? "_executeWithToken" : "_execute"
        } function.`,
        data,
      };
    }
  }

  return {
    success: false,
    error,
    data,
  };
};

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

export const ExecutionRevertedError = (isContractCall: boolean, params: any) => ({
  success: false,
  error: `Transaction execution was reverted. Please check the implementation of the destination contract's ${
    isContractCall ? "_execute" : "_executeWithToken"
  } function.`,
  params,
});
