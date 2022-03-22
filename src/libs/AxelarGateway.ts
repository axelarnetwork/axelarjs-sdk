import { ethers } from "ethers";
import {
  ApproveTxArgs,
  CallContractTxArgs,
  CallContractWithTokenTxArgs,
  Environment,
  EvmChain,
  SendTokenArgs,
} from "./types";
import axelarGatewayAbi from "./abi/axelarGatewayAbi.json";
import erc20Abi from "./abi/erc20Abi.json";
import { GatewayTx } from "./GatewayTx";

const config: Record<Environment, Record<EvmChain, string>> = {
  [Environment.MAINNET]: {
    [EvmChain.ETHEREUM]: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
    [EvmChain.AVALANCHE]: "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78",
    [EvmChain.FANTOM]: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
    [EvmChain.POLYGON]: "0x6f015F16De9fC8791b234eF68D486d2bF203FBA8",
    [EvmChain.MOONBEAM]: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
  },
  [Environment.TESTNET]: {
    [EvmChain.ETHEREUM]: "0xBC6fcce7c5487d43830a219CA6E7B83238B41e71",
    [EvmChain.AVALANCHE]: "0xC249632c2D40b9001FE907806902f63038B737Ab",
    [EvmChain.FANTOM]: "0x97837985Ec0494E7b9C71f5D3f9250188477ae14",
    [EvmChain.POLYGON]: "0xBF62ef1486468a6bd26Dd669C06db43dEd5B849B",
    [EvmChain.MOONBEAM]: "0x5769D84DD62a6fD969856c75c7D321b84d455929",
  },
};

export class AxelarGateway {
  private contract: ethers.Contract;
  private provider: ethers.providers.Provider;

  /**
   * @param contractAddress axelar gateway's contract address.
   * @param provider evm provider to read value from the contract.
   */
  constructor(contractAddress: string, provider: ethers.providers.Provider) {
    this.provider = provider;
    this.contract = new ethers.Contract(
      contractAddress,
      axelarGatewayAbi,
      provider
    );
  }

  /**
   * A convinient method to create AxelarGateway instance from our gateway contract that currently deployed on mainnet and testnet.
   *
   * @param env This value will be used in pair with `chain` in order to find corresponding `AxelarGateway` contract address.
   * @param chain This value will be used in pair with `env` in order to find corresponding `AxelarGateway` contract address.
   * @param provider evm provider to read value from the contract.
   * @returns AxelarGateway instance
   */
  static create(
    env: Environment,
    chain: EvmChain,
    provider: ethers.providers.Provider
  ): AxelarGateway {
    return new AxelarGateway(config[env][chain], provider);
  }

  async createCallContractTx(args: CallContractTxArgs): Promise<GatewayTx> {
    const unsignedTx = await this.contract.populateTransaction.callContract(
      args.destinationChain,
      args.contractAddress,
      args.payload
    );

    return new GatewayTx(unsignedTx, this.provider);
  }

  async createCallContractWithTokenTx(
    args: CallContractWithTokenTxArgs
  ): Promise<GatewayTx> {
    const unsignedTx =
      await this.contract.populateTransaction.callContractWithToken(
        args.destinationChain,
        args.contractAddress,
        args.payload,
        args.symbol,
        args.amount
      );

    return new GatewayTx(unsignedTx, this.provider);
  }

  async createSendTokenTx(args: SendTokenArgs): Promise<GatewayTx> {
    const unsignedTx = await this.contract.populateTransaction.sendToken(
      args.destinationChain,
      args.destinationAddress,
      args.symbol,
      args.amount
    );

    return new GatewayTx(unsignedTx, this.provider);
  }

  async createApproveTx(args: ApproveTxArgs): Promise<GatewayTx> {
    const tokenAddress = args.tokenAddress;
    const erc20Contract = new ethers.Contract(
      tokenAddress,
      erc20Abi,
      this.provider
    );
    const unsignedTx = await erc20Contract.populateTransaction.approve(
      args.spender,
      args.amount || ethers.constants.MaxUint256
    );

    return new GatewayTx(unsignedTx, this.provider);
  }

  getAllowance(tokenAddress: string, signerAddress: string): Promise<number> {
    const erc20Contract = new ethers.Contract(
      tokenAddress,
      erc20Abi,
      this.provider
    );
    return erc20Contract.allowance(signerAddress, this.contract.address);
  }

  isTokenFrozen(symbol: string): Promise<boolean> {
    return this.contract.tokenFrozen(symbol);
  }

  isCommandExecuted(commandId: string): Promise<boolean> {
    return this.contract.isCommandExecuted(commandId);
  }

  getTokenAddress(symbol: string) {
    return this.contract.tokenAddresses(symbol);
  }
}
