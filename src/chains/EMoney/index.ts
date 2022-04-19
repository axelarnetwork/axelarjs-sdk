import { AssetInfo } from "../../assets/types";
import { Chain, ChainInfo } from "../types";
import { bech32 } from "bech32";
import Axelar from "../Axelar";

export default class EMoney extends Axelar implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "EMONEY",
    chainName: "e-Money",
    estimatedWaitTime: 5,
    fullySupported: true,
    assets: [],
    txFeeInPercent: 0.1,
    module: "axelarnet",
    chainIdentifier: {
      devnet: "e-money",
      testnet: "e-money",
      mainnet: "e-money",
    },
  };

  public validateAddress = (address: string): boolean => {
    if (!address) return false;

    try {
      return bech32.decode(address).prefix === "emoney";
    } catch (e) {
      return false;
    }
  };

  constructor() {
    super();
  }
}
