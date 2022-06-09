import { isAddress as isValidEVMAddress } from "ethers/lib/utils";
import { Chain, ChainInfo } from "../types";

export default class Binance implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "BSC",
    chainName: "Binance",
    estimatedWaitTime: 15,
    fullySupported: false,
    assets: [],
    txFeeInPercent: 0.1,
    module: "evm",
    confirmLevel: 25,
    chainIdentifier: {
      devnet: "binance",
      testnet: "binance",
      mainnet: "binance",
    },
  };

  constructor() {}

  public validateAddress = (address: string) => isValidEVMAddress(address);
}
