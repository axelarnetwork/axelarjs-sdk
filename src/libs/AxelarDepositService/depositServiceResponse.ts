import { ethers } from "ethers";

export enum DepositServiceError {
  CANNOT_GET_DEPOSIT_ADDRESS = "Cannot get a deposit address from the Deposit Service contract",
}

export interface DepositServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: DepositServiceError;
}

export const getFailedResponse = (errorMsg: DepositServiceError) => {
  return {
    success: false,
    error: errorMsg,
  };
};

export function getSuccessResponse<T>(data: T) {
  return {
    success: true,
    data: {
      data,
    },
  };
}

export interface Erc20DepositAddressData {
  address: string;
  waitForDeposit: () => Promise<ethers.providers.TransactionReceipt>;
}
