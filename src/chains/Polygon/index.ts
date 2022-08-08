import { Chain, ChainInfo } from "../types";
import Ethereum from "../Ethereum";

export default class Polygon extends Ethereum implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "POLYGON",
    chainName: "Polygon",
    estimatedWaitTime: 5,
    fullySupported: true,
    assets: [],
    txFeeInPercent: 0.1,
    module: "evm",
    confirmLevel: 135,
    chainIdentifier: {
      devnet: "polygon",
      testnet: "polygon",
      mainnet: "polygon",
    },
  };

  constructor() {
    super();
  }
}
