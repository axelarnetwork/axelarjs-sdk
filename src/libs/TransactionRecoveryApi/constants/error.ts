import { Contract } from "ethers";
import { EvmChain } from "../../../libs";

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
  error: e.error.reason,
});

export const ExecuteError = (e: any, contract: Contract, isContractCallWithToken: boolean) => {
  const functionName = isContractCallWithToken ? "executeWithToken" : "execute";
  const { commandId, sourceChain, sourceAddress, payload, tokenSymbol, amount } =
    contract.interface.decodeFunctionData(functionName, e.error.transaction.data);

  const reason =
    e.error.reason === "execution reverted"
      ? `Transaction execution was reverted. Please check the implementation of the destination contract's ${
          isContractCallWithToken ? "_executeWithToken" : "_execute"
        } function.`
      : e.error.reason;

  return {
    success: false,
    error: reason,
    data: {
      functionName,
      args: {
        commandId,
        sourceChain,
        sourceAddress,
        payload,
        tokenSymbol,
        amount: amount.toString(),
      },
    },
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
