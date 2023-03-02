import { ethers } from "ethers";
import { TransactionRequest } from "@ethersproject/providers";
import { EVMClientConfig } from "../../../../libs/types";

export default class EVMClient {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.providers.JsonRpcSigner | ethers.Wallet;

  constructor(config: EVMClientConfig) {
    const { rpcUrl, networkOptions, evmWalletDetails } = config;
    const { privateKey, useWindowEthereum, provider } = evmWalletDetails;
    if (provider) {
      this.provider = provider;
    } else {
      this.provider =
        useWindowEthereum && typeof window !== "undefined" && window?.ethereum
          ? new ethers.providers.Web3Provider(window.ethereum, networkOptions)
          : new ethers.providers.JsonRpcProvider(rpcUrl, networkOptions);
    }
    this.signer = privateKey
      ? new ethers.Wallet(privateKey).connect(this.provider)
      : this.provider.getSigner();
  }

  public getSigner() {
    return this.signer;
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
    return this.provider.sendTransaction(signedTx);
  }
}
