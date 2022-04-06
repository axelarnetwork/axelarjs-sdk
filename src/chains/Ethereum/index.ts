import { isAddress as isValidEVMAddress } from "ethers/lib/utils";
import { Chain, ChainInfo } from "../types";

export default class Ethereum implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "ETH",
    chainName: "Ethereum",
    estimatedWaitTime: 15,
    fullySupported: true,
    assets: [],
    txFeeInPercent: 0.1,
    module: "evm",
    confirmLevel: 40,
    chainIdentifier: {
      devnet: "ethereum",
      testnet: "ethereum",
      mainnet: "ethereum",
    },
  };

  constructor() {}

  public validateAddress = (address: string) => isValidEVMAddress(address);
}
