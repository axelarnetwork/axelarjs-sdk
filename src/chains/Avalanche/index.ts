import { Chain, ChainInfo } from "../../interface";
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
  };

  constructor() {
    super();
    this.providerType = "avalanche";
  }
}
