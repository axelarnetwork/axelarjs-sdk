import { bech32 } from "bech32";
import { AssetInfo } from "../../assets/types";
import { Chain, ChainInfo } from "../types";
import Axelar from "../Axelar";

export default class Secret extends Axelar implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "SECRET",
    chainName: "Secret",
    estimatedWaitTime: 5,
    fullySupported: true,
    assets: [],
    txFeeInPercent: 0.1,
    module: "axelarnet",
    chainIdentifier: {
      devnet: "secret",
      testnet: "secret",
      mainnet: "secret",
    },
  };

  public validateAddress = (address: string): boolean => {
    if (!address) return false;

    try {
      return bech32.decode(address).prefix === "secret";
    } catch (e) {
      return false;
    }
  };

  constructor() {
    super();
  }
}
