import { AssetInfo, Chain, ChainInfo } from "../../interface";
import { bech32 } from "bech32";
import Axelar from "../Axelar";

export default class Cosmoshub extends Axelar implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "COS",
    chainName: "Cosmoshub",
    estimatedWaitTime: 5,
    fullySupported: true,
    assets: [],
    txFeeInPercent: 0.1,
    module: "axelarnet",
    chainIdentifier: {
      devnet: "cosmoshub",
      testnet: "cosmoshub",
      mainnet: "cosmoshub",
    },
  };

  public validateAddress = (addressInfo: AssetInfo): boolean => {
    if (!addressInfo?.assetAddress) return false;

    try {
      return bech32.decode(addressInfo.assetAddress).prefix === "cosmos";
    } catch (e) {
      return false;
    }
  };

  constructor() {
    super();
  }
}
