import { Provider, TransactionRequest } from "@ethersproject/abstract-provider";
import { ethers, Signer, UnsignedTransaction } from "ethers";
import { TxOption } from "./types";

export default class GatewayTx {
  public txRequest: TransactionRequest;
  public provider: Provider;

  constructor(
    unsignedTx: UnsignedTransaction,
    provider: ethers.providers.Provider
  ) {
    this.txRequest = {
      to: unsignedTx.to,
      data: unsignedTx.data,
      value: unsignedTx.value,
    };
    this.provider = provider;
  }

  send(signer: Signer, txOption?: TxOption) {
    const txRequest = {
      ...this.txRequest,
      ...txOption,
    };

    return signer.sendTransaction(txRequest);
  }

  estimateGas() {
    return this.provider.estimateGas(this.txRequest);
  }
}