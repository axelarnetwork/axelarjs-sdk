import { Contract, ethers } from "ethers";
import { abi as AxelarDepositServiceABI } from "../../artifacts/contracts/deposit-service/AxelarDepositService.sol/AxelarDepositService.json";

export class AxelarDepositServiceAPI {
  private contract: Contract;

  constructor(depositServiceAddress: string, provider?: ethers.providers.Provider) {
    this.contract = new ethers.Contract(depositServiceAddress, AxelarDepositServiceABI, provider);
  }

  static init(provider?: ethers.providers.Provider) {
    return new AxelarDepositServiceAPI("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955", provider);
  }

  connect(provider: ethers.providers.Provider): AxelarDepositServiceAPI {
    this.contract = this.contract.connect(provider);
    return this;
  }

  getErc20DepositAddress(
    refundAddress: string,
    destinationChain: string,
    destinationAddress: string,
    tokenSymbol: string,
    salt?: string
  ) {
    const _salt = salt || ethers.utils.formatBytes32String("0");
    return this.contract.addressForTokenDeposit(
      _salt,
      refundAddress,
      destinationChain,
      destinationAddress,
      tokenSymbol
    );
  }
}
