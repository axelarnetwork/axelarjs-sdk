import { ethers } from "ethers";
import {
  ApproveTxArgs,
  CallContractTxArgs,
  CallContractWithTokenTxArgs,
  Environment,
  SendTokenArgs,
} from "./types";

import erc20Abi from "./abi/erc20Abi.json";
import { GatewayTx } from "./GatewayTx";
import { AxelarQueryClient, AxelarQueryClientType } from "./AxelarQueryClient";
import { EvmChain } from "../constants/EvmChain";

export const AXELAR_GATEWAY: Record<Environment, Partial<Record<EvmChain, string>>> = {
  [Environment.MAINNET]: {
    [EvmChain.ETHEREUM]: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
    [EvmChain.AVALANCHE]: "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78",
    [EvmChain.BNBCHAIN]: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
    [EvmChain.FANTOM]: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
    [EvmChain.POLYGON]: "0x6f015F16De9fC8791b234eF68D486d2bF203FBA8",
    [EvmChain.MOONBEAM]: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
    [EvmChain.ARBITRUM]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.AURORA]: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
    [EvmChain.BASE]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.CELO]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.KAVA]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.OPTIMISM]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.FILECOIN]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.MANTLE]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.SCROLL]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.CENTRIFUGE]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  },
  [Environment.TESTNET]: {
    [EvmChain.ETHEREUM]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.AVALANCHE]: "0xC249632c2D40b9001FE907806902f63038B737Ab",
    [EvmChain.BASE]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.BNBCHAIN]: "0x4D147dCb984e6affEEC47e44293DA442580A3Ec0",
    [EvmChain.FANTOM]: "0x97837985Ec0494E7b9C71f5D3f9250188477ae14",
    [EvmChain.POLYGON]: "0xBF62ef1486468a6bd26Dd669C06db43dEd5B849B",
    [EvmChain.POLYGON_ZKEVM]: "0x999117D44220F33e0441fbAb2A5aDB8FF485c54D",
    [EvmChain.MOONBEAM]: "0x5769D84DD62a6fD969856c75c7D321b84d455929",
    [EvmChain.ARBITRUM]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.AURORA]: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
    [EvmChain.CELO]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.KAVA]: "0xC8D18F85cB0Cee5C95eC29c69DeaF6cea972349c",
    [EvmChain.OPTIMISM]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.LINEA]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.FILECOIN]: "0x999117D44220F33e0441fbAb2A5aDB8FF485c54D",
    [EvmChain.MANTLE]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.SCROLL]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.SEPOLIA]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.IMMUTABLE]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.CENTRIFUGE_TESTNET]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    [EvmChain.ARBITRUM_SEPOLIA]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  },
  [Environment.DEVNET]: {
    [EvmChain.ETHEREUM]: "0x7358799e0c8250f0B7D1164824F6Dd5bA31C9Cd6",
    [EvmChain.AVALANCHE]: "0x4ffb57Aea2295d663B03810a5802ef2Bc322370D",
    [EvmChain.MOONBEAM]: "0x1b23BE90a16efe8fD3008E742dDd9531dC5845b0",
  },
};

export class AxelarGateway {
  private contract: ethers.Contract;
  private provider: ethers.providers.Provider;
  private gatewayAddress: string;

  /**
   * @param contractAddress axelar gateway's contract address.
   * @param provider evm provider to read value from the contract.
   */
  constructor(gatewayAddress: string, provider: ethers.providers.Provider) {
    this.provider = provider;
    this.gatewayAddress = gatewayAddress;
    this.contract = new ethers.Contract(
      gatewayAddress,
      [
        "event ContractCallWithToken(address indexed _from, string _sourceChain, string _destinationChain, bytes32 _txHash, bytes _data, string _token, uint256 _amount)",
        "event ContractCall(address indexed sender,string destinationChain,string destinationContractAddress,bytes32 indexed payloadHash,bytes payload)",
        "function callContract(string calldata destinationChain, string calldata contractAddress, bytes calldata payload) external",
        "function callContractWithToken(string calldata destinationChain, string calldata contractAddress, bytes calldata payload, string calldata symbol, uint256 amount) external",
        "function sendToken(string calldata destinationChain, string calldata destinationAddress, string calldata symbol, uint256 amount) external",
        "function tokenFrozen(string calldata symbol) external view returns (bool)",
        "function isCommandExecuted(bytes32 commandId) view returns (bool)",
        "function tokenAddresses(string calldata symbol) view returns (address)",
      ],
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
  static async create(
    env: Environment,
    chain: EvmChain,
    provider: ethers.providers.Provider
  ): Promise<AxelarGateway> {
    let gatewayAddr = AXELAR_GATEWAY[env][chain];
    if (!gatewayAddr) {
      const api: AxelarQueryClientType = await AxelarQueryClient.initOrGetAxelarQueryClient({
        environment: env,
      });
      gatewayAddr = (await api.evm.GatewayAddress({ chain }))?.address;
    }
    return new AxelarGateway(gatewayAddr as string, provider);
  }

  async createCallContractTx(args: CallContractTxArgs): Promise<GatewayTx> {
    const unsignedTx = await this.contract.populateTransaction.callContract(
      args.destinationChain,
      args.destinationContractAddress,
      args.payload
    );

    return new GatewayTx(unsignedTx, this.provider);
  }

  get getGatewayAddress() {
    return this.gatewayAddress;
  }

  async createCallContractWithTokenTx(args: CallContractWithTokenTxArgs): Promise<GatewayTx> {
    const unsignedTx = await this.contract.populateTransaction.callContractWithToken(
      args.destinationChain,
      args.destinationContractAddress,
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
    const erc20Contract = new ethers.Contract(tokenAddress, erc20Abi, this.provider);
    const unsignedTx = await erc20Contract.populateTransaction.approve(
      this.contract.address,
      args.amount || ethers.constants.MaxUint256
    );

    return new GatewayTx(unsignedTx, this.provider);
  }

  getAllowance(tokenAddress: string, signerAddress: string): Promise<number> {
    const erc20Contract = new ethers.Contract(tokenAddress, erc20Abi, this.provider);
    return erc20Contract.allowance(signerAddress, this.contract.address);
  }

  isTokenFrozen(symbol: string): Promise<boolean> {
    return this.contract.tokenFrozen(symbol);
  }

  isCommandExecuted(commandId: string): Promise<boolean> {
    return this.contract.isCommandExecuted(commandId);
  }

  getTokenAddress(symbol: string): Promise<string> {
    return this.contract.tokenAddresses(symbol);
  }

  async getERC20TokenContract(tokenSymbol: string): Promise<ethers.Contract> {
    return new ethers.Contract(await this.getTokenAddress(tokenSymbol), erc20Abi, this.provider);
  }

  getContract(): ethers.Contract {
    return this.contract;
  }
}
