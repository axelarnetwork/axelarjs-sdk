import { Contract, ContractReceipt, ContractTransaction } from "ethers";
import { ExecuteParams } from "../AxelarRecoveryApi";

export function callExecute(params: ExecuteParams, contract: Contract): Promise<ContractReceipt> {
  const {
    commandId,
    isContractCallWithToken,
    payload,
    sourceAddress,
    sourceChain,
    amount,
    symbol,
  } = params;

  if (isContractCallWithToken) {
    return contract
      .executeWithToken(commandId, sourceChain, sourceAddress, payload, symbol, amount)
      .then((tx: ContractTransaction) => tx.wait());
  } else {
    return contract
      .execute(commandId, sourceChain, sourceAddress, payload)
      .then((tx: ContractTransaction) => tx.wait());
  }
}
