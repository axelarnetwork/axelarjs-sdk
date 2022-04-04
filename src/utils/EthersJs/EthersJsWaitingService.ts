import { Contract, ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { BaseWaitingService } from "../../chains/models/BaseWaitingService";
import { getEthersJsProvider, ProviderType } from "./ethersjsProvider";
import {
  BlockchainWaitingService,
  ChainInfo,
  AssetAndChainInfo,
} from "../../chains/types";
import {
  EnvironmentConfigs,
  EthersJsConfigs,
  EthersJsTokenMap,
  getConfigs,
} from "../../constants";
import { RestService } from "../../services/RestService";
import { SocketService } from "../../services/SocketService";
import { AssetInfo } from "../../assets/types";

const abi: string[] = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint)",
  "event Transfer(address indexed from, address indexed to, uint amount)",
];

/**
 * @deprecated The class should not be used and will soon be removed
 */
export default class EthersJsWaitingService
  extends BaseWaitingService
  implements BlockchainWaitingService
{
  private provider!: ethers.providers.BaseProvider;
  private tokenContract!: Contract;
  private filter!: ethers.EventFilter;

  constructor(chainInfo: ChainInfo, assetInfo: AssetInfo) {
    super(chainInfo.confirmLevel as number, assetInfo.assetAddress as string);
  }

  public async build(
    chainInfo: ChainInfo,
    assetInfo: AssetInfo,
    environment: string,
    providerType: ProviderType
  ): Promise<EthersJsWaitingService> {
    const api: EthersJsWaitingService = new EthersJsWaitingService(
      chainInfo,
      assetInfo
    );
    await api.init(chainInfo, assetInfo, environment, providerType);
    return api;
  }

  public async wait(
    assetAndChainInfo: AssetAndChainInfo,
    interimStatusCb: any,
    clientSocketConnect: SocketService
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.tokenContract.once(
        this.filter,
        (from: any, to: any, amount: any, event: any) => {
          console.log(
            `Incoming amount of: ${formatEther(amount)}, from: ${from}.`,
            event
          );
          event.axelarRequiredNumConfirmations = this.numConfirmations;
          interimStatusCb(event);
          resolve(event);
        }
      );
    });
  }

  private async init(
    chainInfo: ChainInfo,
    assetInfo: AssetInfo,
    environment: string,
    providerType: ProviderType
  ) {
    const configs: EnvironmentConfigs = getConfigs(environment);
    const ethersJsConfigs: { [chain: string]: EthersJsConfigs } =
      configs.ethersJsConfigs;
    const { tokenAddressMap } =
      ethersJsConfigs[chainInfo.chainName.toLowerCase()];
    const tokenSymbol: keyof EthersJsTokenMap =
      assetInfo.assetSymbol as keyof EthersJsTokenMap;
    const depositAddress: string = assetInfo.assetAddress as string;

    let tokenContract: string;
    if (tokenAddressMap[tokenSymbol]) {
      tokenContract = tokenAddressMap[tokenSymbol] as string;
    } else {
      const endpoint = `/token-address?module=evm&chain=${chainInfo?.chainName?.toLowerCase()}&asset=${
        assetInfo.common_key
      }`;
      const resourceUrl: string = configs.resourceUrl;
      const response = await new RestService(resourceUrl).get(endpoint);
      tokenContract = response.data;
      tokenAddressMap[tokenSymbol] = tokenContract;
    }

    console.log(
      "EthersJsWaitingService token contract for " + tokenSymbol + ": ",
      tokenContract + " on: " + chainInfo.chainName
    );

    this.provider = getEthersJsProvider(providerType, environment);
    this.tokenContract = new ethers.Contract(tokenContract, abi, this.provider);
    this.filter = this.tokenContract.filters.Transfer(null, depositAddress); //filter all transfers TO my address
  }
}
