import { Chain, ChainInfo } from "../types";
import Axelar from "../Axelar";
import { bech32 } from "bech32";

export default class Kujira extends Axelar implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "KUJIRA",
    chainName: "Kujira",
    estimatedWaitTime: 5,
    fullySupported: true,
    assets: [],
    txFeeInPercent: 0.1,
    module: "axelarnet",
    chainIdentifier: {
      devnet: "kujira",
      testnet: "kujira",
      mainnet: "kujira",
    },
  };

  constructor() {
    super();
  }

  public validateAddress = (address: string): boolean => {
    if (!address) return false;

    try {
      return bech32.decode(address).prefix === this.chainInfo.chainSymbol.toLowerCase();
    } catch (e) {
      return false;
    }
  };
}
