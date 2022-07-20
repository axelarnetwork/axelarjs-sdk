import { Chain, ChainInfo } from "../types";
import Ethereum from "../Ethereum";

export default class Aurora extends Ethereum implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "AURORA",
    chainName: "Aurora",
    estimatedWaitTime: 5,
    fullySupported: true,
    assets: [],
    txFeeInPercent: 0.1,
    module: "evm",
    confirmLevel: 6,
    chainIdentifier: {
      devnet: "aurora",
      testnet: "aurora",
      mainnet: "aurora",
    },
  };

  constructor() {
    super();
  }
}
