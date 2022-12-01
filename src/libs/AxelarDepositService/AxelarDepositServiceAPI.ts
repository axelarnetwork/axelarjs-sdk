import { ethers } from "ethers";
import { abi as AxelarDepositServiceABI } from "../../../artifacts/contracts/deposit-service/AxelarDepositService.sol/AxelarDepositService.json";
import {
  getFailedResponse,
  DepositServiceError,
  DepositServiceResponse,
  Erc20DepositAddressData,
} from "./depositServiceResponse";
import { Environment } from "../types";
import { throwIfInvalidChainIds } from "../../utils";
import { loadChains } from "../../chains";
import { ChainInfo } from "../../chains/types";

export class AxelarDepositServiceAPI {
  private environment: Environment;
  private chains: ChainInfo[];
  private provider?: ethers.providers.Provider;

  constructor(environment: Environment, chains: ChainInfo[], provider?: ethers.providers.Provider) {
    this.environment = environment;
    this.chains = chains;
    this.provider = provider;
  }

  /**
   * Initialize the deposit service API
   * @param environment
   * @param provider
   * @returns the deposit service API
   */
  static async init(environment: Environment, provider?: ethers.providers.Provider) {
    const chains = await loadChains({ environment });

    return new AxelarDepositServiceAPI(environment, chains, provider);
  }

  /**
   * Re-initilize the deposit service API with the provider, others remain the same
   * @param provider
   * @returns the deposit service API
   */
  connect(provider: ethers.providers.Provider): AxelarDepositServiceAPI {
    return new AxelarDepositServiceAPI(this.environment, this.chains, provider);
  }

  /**
   * Get the deposit service contract addressa
   * @param chainId - the chain id
   * @returns the deposit service contract address
   */
  getDepositServiceContractAddress(chainId: string) {
    const chainInfo = this.chains.find((chain) => chain.id === chainId);

    if (!chainInfo) {
      throw new Error(`Invalid chainId ${chainId}`);
    }

    return chainInfo.depositService;
  }

  /**
   * Get the erc20 deposit address
   * @param sourceChainId - the source chain id
   * @param destinationChainId - the chain where the token will be deposited
   * @param destinationAddress - the address to receive the tokens
   * @param tokenSymbol - the token symbol
   * @param refundAddress - optional refund address
   * @param salt - optional salt default to zero
   * @returns the erc20 deposit address
   */
  async getErc20DepositAddress(
    sourceChainId: string,
    destinationChainId: string,
    destinationAddress: string,
    tokenSymbol: string,
    refundAddress: string,
    salt?: string
  ): Promise<DepositServiceResponse<Erc20DepositAddressData>> {
    await throwIfInvalidChainIds([sourceChainId, destinationChainId], this.environment);

    // the default salt is zero bytes32 to keep it simple for recovery
    const _salt = salt || ethers.utils.formatBytes32String("0");

    const depositServiceAddress = this.getDepositServiceContractAddress(sourceChainId);

    const contract = new ethers.Contract(
      depositServiceAddress,
      AxelarDepositServiceABI,
      this.provider
    );

    const depositAddress = await contract
      .addressForTokenDeposit(
        _salt,
        refundAddress,
        destinationChainId,
        destinationAddress,
        tokenSymbol
      )
      .catch((e: any) => console.log(e));

    if (!depositAddress) return getFailedResponse(DepositServiceError.CANNOT_GET_DEPOSIT_ADDRESS);

    return {
      success: true,
      data: {
        address: depositAddress,
        waitForDeposit: () => {
          return this.waitForErc20Deposit(depositAddress, sourceChainId, tokenSymbol);
        },
      },
    };
  }

  /**
   * wait for the erc20 deposit to be made to the deposit address
   * @param depositAddress - the deposit address
   * @param tokenSymbol - the token symbol
   * @returns the transaction receipt
   */
  waitForErc20Deposit(depositAddress: string, chainId: string, tokenSymbol: string) {
    const assetInfo = this.chains
      .find((chain) => chain.id === chainId)
      ?.assets.find((asset) => asset.assetSymbol === tokenSymbol);

    const erc20Address = assetInfo?.assetAddress;

    if (!erc20Address) throw new Error(`Invalid token symbol ${tokenSymbol}`);

    return new Promise<ethers.providers.TransactionReceipt>((resolve) => {
      const filter = {
        address: erc20Address,
        topics: [
          ethers.utils.id("Transfer(address,address,uint256)"),
          null,
          ethers.utils.hexZeroPad(depositAddress, 32),
        ],
      };

      this.provider?.once(filter, (tx: ethers.providers.TransactionReceipt) => {
        resolve(tx);
      });
    });
  }
}
