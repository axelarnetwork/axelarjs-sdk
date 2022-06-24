import { EvmChain } from "src/libs/types";

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
  error: e.message,
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
