import { bech32 } from "bech32";
import { AssetInfo } from "../../assets/types";
import { Chain, ChainInfo } from "../types";

export default class Axelar implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "AXL",
    chainName: "Axelar",
    estimatedWaitTime: 5,
    fullySupported: false,
    assets: [],
    txFeeInPercent: 0.1,
    module: "axelarnet",
    chainIdentifier: {
      devnet: "axelarnet",
      testnet: "axelarnet",
      mainnet: "axelarnet",
    },
  };

  public validateAddress = (address: string): boolean => {
    if (!address) return false;

    try {
      return (
        bech32.decode(address).prefix === this.chainInfo.chainName.toLowerCase()
      );
    } catch (e) {
      return false;
    }
  };
}
