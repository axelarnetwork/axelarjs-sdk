import { Chain, ChainInfo } from "../types";
import Axelar from "../Axelar";
import { bech32 } from "bech32";
import { AssetInfo } from "../../assets/types";

export default class Osmosis extends Axelar implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "OSMO",
    chainName: "Osmosis",
    estimatedWaitTime: 5,
    fullySupported: true,
    assets: [],
    txFeeInPercent: 0.1,
    module: "axelarnet",
    chainIdentifier: {
      devnet: "osmosis",
      testnet: "osmosis-2",
      mainnet: "osmosis",
    },
  };

  constructor() {
    super();
  }

  public validateAddress = (address: string): boolean => {
    if (!address) return false;

    try {
      return (
        bech32.decode(address).prefix ===
        this.chainInfo.chainSymbol.toLowerCase()
      );
    } catch (e) {
      return false;
    }
  };
}
