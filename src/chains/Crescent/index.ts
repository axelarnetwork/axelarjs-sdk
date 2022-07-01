import { Chain, ChainInfo } from "../types";
import { bech32 } from "bech32";
import Axelar from "../Axelar";

export default class Crescent extends Axelar implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "CRE",
    chainName: "Crescent",
    estimatedWaitTime: 5,
    fullySupported: true,
    assets: [],
    txFeeInPercent: 0.1,
    module: "axelarnet",
    chainIdentifier: {
      devnet: "crescent",
      testnet: "crescent",
      mainnet: "crescent",
    },
  };

  public validateAddress = (address: string): boolean => {
    if (!address) return false;

    try {
      return bech32.decode(address).prefix === "cre";
    } catch (e) {
      return false;
    }
  };

  constructor() {
    super();
  }
}
