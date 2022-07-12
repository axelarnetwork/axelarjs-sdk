import { Contract, ContractReceipt, ContractTransaction } from "ethers";
import { ExecuteParams } from "../AxelarRecoveryApi";

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

  const revertMsg = "execution reverted";

  if (isContractCallWithToken) {
    // Checking if the destination contract call reverted
    const estimatedGas = await contract.estimateGas
      .executeWithToken(commandId, sourceChain, sourceAddress, payload, symbol, amount)
      .catch(() => undefined);

    if (!estimatedGas) throw new Error(revertMsg);

    return contract
      .executeWithToken(commandId, sourceChain, sourceAddress, payload, symbol, amount)
      .then((tx: ContractTransaction) => {
        return tx.wait();
      });
  } else {
    // Checking if the destination contract call reverted
    const estimatedGas = await contract.estimateGas
      .execute(commandId, sourceChain, sourceAddress, payload)
      .catch(() => undefined);
    if (!estimatedGas) throw new Error(revertMsg);

    return contract
      .execute(commandId, sourceChain, sourceAddress, payload)
      .then((tx: ContractTransaction) => tx.wait());
  }
}
