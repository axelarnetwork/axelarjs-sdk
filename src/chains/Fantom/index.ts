import { Chain, ChainInfo } from "../types";
import Ethereum from "../Ethereum";

export default class Fantom extends Ethereum implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "FTM",
    chainName: "Fantom",
    estimatedWaitTime: 5,
    fullySupported: true,
    assets: [],
    txFeeInPercent: 0.1,
    module: "evm",
    confirmLevel: 3,
    chainIdentifier: {
      devnet: "fantom",
      testnet: "fantom",
      mainnet: "fantom",
    },
  };

  constructor() {
    super();
  }
}
