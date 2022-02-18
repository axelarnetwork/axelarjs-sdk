import { Chain, ChainInfo } from "../../interface";
import Axelar from "../Axelar";

export default class Cosmos extends Axelar implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "COS",
    chainName: "Cosmos",
    estimatedWaitTime: 5,
    fullySupported: false,
    assets: [],
    txFeeInPercent: 0.1,
    module: "axelarnet",
  };

  constructor() {
    super();
  }
}
