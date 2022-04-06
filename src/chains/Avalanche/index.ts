import { Chain, ChainInfo } from "../types";
import Ethereum from "../Ethereum";

export default class Avalanche extends Ethereum implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "AVAX",
    chainName: "Avalanche",
    estimatedWaitTime: 5,
    fullySupported: true,
    assets: [],
    txFeeInPercent: 0.1,
    module: "evm",
    confirmLevel: 12,
    chainIdentifier: {
      devnet: "avalanche",
      testnet: "avalanche",
      mainnet: "avalanche",
    },
  };

  constructor() {
    super();
  }
}
