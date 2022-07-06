import { Chain, ChainInfo } from "../types";
import Axelar from "../Axelar";
import { bech32 } from "bech32";

export default class Injective extends Axelar implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "INJ",
    chainName: "Injective",
    estimatedWaitTime: 5,
    fullySupported: true,
    assets: [],
    txFeeInPercent: 0.1,
    module: "axelarnet",
    chainIdentifier: {
      devnet: "injective",
      testnet: "injective",
      mainnet: "injective",
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
