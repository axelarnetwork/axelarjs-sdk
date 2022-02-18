import WaitingService from "./WaitingService";
import { AssetInfo, Chain, ChainInfo } from "../../interface";
import { bech32 } from "bech32";

export default class Axelar implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "AXL",
    chainName: "Axelar",
    estimatedWaitTime: 5,
    fullySupported: false,
    assets: [],
    txFeeInPercent: 0.1,
    module: "axelarnet",
  };

  public validateAddress = (addressInfo: AssetInfo): boolean => {
    if (!addressInfo?.assetAddress) return false;

    try {
      return (
        bech32.decode(addressInfo.assetAddress).prefix ===
        this.chainInfo.chainName.toLowerCase()
      );
    } catch (e) {
      return false;
    }
  };

  public waitingService = (chainInfo: ChainInfo, assetInfo: AssetInfo) =>
    new WaitingService(chainInfo, assetInfo);
}
