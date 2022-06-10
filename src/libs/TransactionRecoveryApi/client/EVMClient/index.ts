import { ethers } from "ethers";
import { TransactionRequest } from "@ethersproject/providers";
import { EVMClientConfig } from "src/libs/types";

declare const window: Window &
  typeof globalThis & {
    ethereum: any;
  };

export default class EVMClient {
  private provider!: ethers.providers.JsonRpcProvider;
  private signer!: ethers.providers.JsonRpcSigner | ethers.Wallet;

  constructor(config: EVMClientConfig) {
    const { rpcUrl, networkOptions, evmWalletDetails } = config;
    const { mnemonic, useWindowEthereum } = evmWalletDetails;
    this.provider =
      useWindowEthereum && window?.ethereum
        ? new ethers.providers.Web3Provider(window.ethereum, networkOptions)
        : new ethers.providers.JsonRpcProvider(rpcUrl, networkOptions);
    this.signer = mnemonic
      ? ethers.Wallet.fromMnemonic(mnemonic).connect(this.provider)
      : this.provider.getSigner();
  }

  public async broadcastToGateway(gatewayAddress: string, opts: TransactionRequest) {
    const { data, maxFeePerGas, maxPriorityFeePerGas } = opts;
    const txRequest: TransactionRequest = {
      ...opts,
      to: gatewayAddress,
      data: `0x${data}`,
      maxPriorityFeePerGas: maxPriorityFeePerGas || ethers.utils.parseUnits("30", "gwei"),
      maxFeePerGas: maxFeePerGas || ethers.utils.parseUnits("60", "gwei"),
    };
    await this.signer.estimateGas(txRequest);
    const tx = await this.signer.sendTransaction(txRequest);
    await tx.wait(1);
    return tx;
  }

  public buildUnsignedTx(gatewayAddress: string, opts: TransactionRequest): TransactionRequest {
    const { data, maxFeePerGas, maxPriorityFeePerGas } = opts;
    const txRequest: TransactionRequest = {
      ...opts,
      to: gatewayAddress,
      data: `0x${data}`,
      maxPriorityFeePerGas: maxPriorityFeePerGas || ethers.utils.parseUnits("30", "gwei"),
      maxFeePerGas: maxFeePerGas || ethers.utils.parseUnits("60", "gwei"),
    };
    return txRequest;
  }

  public async broadcastSignedTx(signedTx: string): Promise<ethers.providers.TransactionResponse> {
    return await this.provider.sendTransaction(signedTx);
  }
}
