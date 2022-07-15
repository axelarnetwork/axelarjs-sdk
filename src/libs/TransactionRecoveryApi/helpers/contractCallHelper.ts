import { Contract, ContractReceipt, ContractTransaction } from "ethers";
import { ExecuteParams } from "../AxelarRecoveryApi";

export enum CALL_EXECUTE_ERROR {
  REVERT = "REVERT",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
}

export async function callExecute(
  params: ExecuteParams,
  contract: Contract
): Promise<ContractReceipt> {
  const {
    commandId,
    isContractCallWithToken,
    payload,
    sourceAddress,
    sourceChain,
    amount,
    symbol,
  } = params;

  let txReceipt: ContractReceipt | undefined;
  if (isContractCallWithToken) {
    // Checking if the destination contract call reverted
    const estimatedGas = await contract.estimateGas
      .executeWithToken(commandId, sourceChain, sourceAddress, payload, symbol, amount)
      .catch(() => undefined);
    if (!estimatedGas) throw new Error(CALL_EXECUTE_ERROR.REVERT);

    txReceipt = contract
      .executeWithToken(commandId, sourceChain, sourceAddress, payload, symbol, amount)
      .then((tx: ContractTransaction) => tx.wait())
      .catch(() => undefined);
  } else {
    // Checking if the destination contract call reverted
    const estimatedGas = await contract.estimateGas
      .execute(commandId, sourceChain, sourceAddress, payload)
      .catch(() => undefined);
    if (!estimatedGas) throw new Error(CALL_EXECUTE_ERROR.REVERT);

    txReceipt = contract
      .execute(commandId, sourceChain, sourceAddress, payload)
      .then((tx: ContractTransaction) => tx.wait())
      .catch(() => undefined);
  }

  if (!txReceipt) throw new Error(CALL_EXECUTE_ERROR.INSUFFICIENT_FUNDS);
  return txReceipt;
}
