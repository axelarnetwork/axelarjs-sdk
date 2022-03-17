import { AssetInfo, Chain, ChainInfo } from "../../interface";
import { bech32 } from "bech32";
import Axelar from "../Axelar";

export default class Juno extends Axelar implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "JUNO",
    chainName: "Juno",
    estimatedWaitTime: 5,
    fullySupported: true,
    assets: [],
    txFeeInPercent: 0.1,
    module: "axelarnet",
    chainIdentifier: {
      devnet: "juno",
      testnet: "juno",
      mainnet: "juno",
    },
  };

  public validateAddress = (addressInfo: AssetInfo): boolean => {
    if (!addressInfo?.assetAddress) return false;

    try {
      return bech32.decode(addressInfo.assetAddress).prefix === "juno";
    } catch (e) {
      return false;
    }
  };

  constructor() {
    super();
  }
}
