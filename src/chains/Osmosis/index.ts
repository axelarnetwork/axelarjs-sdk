import { AssetInfo, Chain, ChainInfo } from "../../interface";
import Axelar from "../Axelar";
import { bech32 } from "bech32";

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

  public validateAddress = (addressInfo: AssetInfo): boolean => {
    if (!addressInfo?.assetAddress) return false;

    try {
      return (
        bech32.decode(addressInfo.assetAddress).prefix ===
        this.chainInfo.chainSymbol.toLowerCase()
      );
    } catch (e) {
      return false;
    }
  };
}
