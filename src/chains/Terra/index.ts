import { AssetInfo } from "../../assets/types";
import Axelar from "../Axelar";
import { AccAddress } from "@terra-money/terra.js";
import { Chain, ChainInfo } from "../types";

export default class Terra extends Axelar implements Chain {
  public chainInfo: ChainInfo = {
    chainSymbol: "Terra",
    chainName: "Terra",
    estimatedWaitTime: 5,
    fullySupported: true,
    assets: [],
    txFeeInPercent: 0.1,
    module: "axelarnet",
    chainIdentifier: {
      devnet: "terra",
      testnet: "terra",
      mainnet: "terra",
    },
  };

  constructor() {
    super();
  }

  public validateAddress = (address: string) => AccAddress.validate(address);
}
