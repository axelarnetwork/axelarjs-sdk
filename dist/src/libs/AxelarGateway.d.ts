import { ethers } from "ethers";
import { ApproveTxArgs, CallContractTxArgs, CallContractWithTokenTxArgs, Environment, SendTokenArgs } from "./types";
import { GatewayTx } from "./GatewayTx";
import { EvmChain } from "../constants/EvmChain";
export declare const AXELAR_GATEWAY: Record<Environment, Partial<Record<EvmChain, string>>>;
export declare class AxelarGateway {
    private contract;
    private provider;
    private gatewayAddress;
    /**
     * @param contractAddress axelar gateway's contract address.
     * @param provider evm provider to read value from the contract.
     */
    constructor(gatewayAddress: string, provider: ethers.providers.Provider);
    /**
     * A convinient method to create AxelarGateway instance from our gateway contract that currently deployed on mainnet and testnet.
     *
     * @param env This value will be used in pair with `chain` in order to find corresponding `AxelarGateway` contract address.
     * @param chain This value will be used in pair with `env` in order to find corresponding `AxelarGateway` contract address.
     * @param provider evm provider to read value from the contract.
     * @returns AxelarGateway instance
     */
    static create(env: Environment, chain: EvmChain, provider: ethers.providers.Provider): Promise<AxelarGateway>;
    createCallContractTx(args: CallContractTxArgs): Promise<GatewayTx>;
    get getGatewayAddress(): string;
    createCallContractWithTokenTx(args: CallContractWithTokenTxArgs): Promise<GatewayTx>;
    createSendTokenTx(args: SendTokenArgs): Promise<GatewayTx>;
    createApproveTx(args: ApproveTxArgs): Promise<GatewayTx>;
    getAllowance(tokenAddress: string, signerAddress: string): Promise<number>;
    isTokenFrozen(symbol: string): Promise<boolean>;
    isCommandExecuted(commandId: string): Promise<boolean>;
    getTokenAddress(symbol: string): Promise<string>;
    getERC20TokenContract(tokenSymbol: string): Promise<ethers.Contract>;
    getContract(): ethers.Contract;
}
//# sourceMappingURL=AxelarGateway.d.ts.map