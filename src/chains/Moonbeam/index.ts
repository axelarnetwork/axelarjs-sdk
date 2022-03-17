import { Chain, ChainInfo } from "../types";
import Ethereum from "../Ethereum";

export default class Moonbeam extends Ethereum implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "MOONBEAM",
    chainName: "Moonbeam",
    estimatedWaitTime: 5,
    fullySupported: true,
    assets: [],
    txFeeInPercent: 0.1,
    module: "evm",
    confirmLevel: 6,
    chainIdentifier: {
      devnet: "moonbeam",
      testnet: "moonbeam",
      mainnet: "moonbeam",
    },
  };

  constructor() {
    super();
    this.providerType = "moonbeam";
  }
}
