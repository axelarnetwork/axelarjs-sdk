import Axelar from "../Axelar";
import { bech32 } from "bech32";
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
      devnet: "terra-2",
      testnet: "terra-2",
      mainnet: "terra-2",
    },
  };

  constructor() {
    super();
  }

  public validateAddress = (address: string) =>
    checkPrefixAndLength("terra", address, 44) || checkPrefixAndLength("terra", address, 64);
}

function checkPrefixAndLength(prefix: string, data: string, length: number): boolean {
  try {
    const vals = bech32.decode(data);
    return vals.prefix === prefix && data.length == length;
  } catch (e) {
    return false;
  }
}
