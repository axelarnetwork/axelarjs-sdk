import { OTC } from "../services/types";
import { RestService, SocketService } from "../services";
import { AxelarAssetTransferConfig, Environment, TxOption } from "./types";
import { ethers, Signer } from "ethers";
import { AxelarQueryAPI } from "./AxelarQueryAPI";
import { EncodeObject, OfflineDirectSigner } from "@cosmjs/proto-signing";
import { StdFee } from "@cosmjs/stargate";
interface GetDepositAddressOptions {
    _traceId?: string;
    shouldUnwrapIntoNative?: boolean;
    refundAddress?: string;
    erc20DepositAddressType?: "network" | "offline";
}
interface EVMSendTokenOptions {
    signer: Signer;
    provider: ethers.providers.Provider;
    txOptions?: TxOption;
    approveSendForMe?: boolean;
}
export type PopulateTransactionParams = SendTokenParams | undefined;
interface CosmosSendTokenOptions {
    cosmosDirectSigner: OfflineDirectSigner;
    rpcUrl: string;
    timeoutHeight?: any;
    timeoutTimestamp?: number | undefined;
    fee: StdFee | "auto" | number;
}
interface GetDepositAddressParams {
    fromChain: string;
    toChain: string;
    destinationAddress: string;
    asset: string;
    options?: GetDepositAddressOptions;
}
export interface SendTokenParams {
    fromChain: string;
    toChain: string;
    destinationAddress: string;
    asset: {
        denom?: string;
        symbol?: string;
    };
    amountInAtomicUnits: string;
    options?: {
        evmOptions?: EVMSendTokenOptions;
        cosmosOptions?: CosmosSendTokenOptions;
    };
}
export declare class AxelarAssetTransfer {
    readonly environment: Environment;
    readonly resourceUrl: string;
    readonly api: RestService;
    readonly depositServiceApi: RestService;
    readonly axelarQueryApi: AxelarQueryAPI;
    private evmDenomMap;
    private staticInfo;
    private chains;
    constructor(config: AxelarAssetTransferConfig);
    getDepositAddressForNativeWrap(fromChain: string, toChain: string, destinationAddress: string, refundAddress?: string): Promise<string>;
    getDepositAddressForNativeUnwrap(fromChain: string, toChain: string, destinationAddress: string, fromChainModule?: "evm" | "axelarnet", refundAddress?: string): Promise<string>;
    getOfflineDepositAddressForERC20Transfer(fromChain: string, toChain: string, destinationAddress: string, fromChainModule: ("evm" | "axelarnet") | undefined, tokenSymbol: string, refundAddress?: string): Promise<string>;
    getDepositAddressFromRemote(type: "erc20" | "wrap" | "unwrap", fromChain: string | undefined, toChain: string | undefined, destinationAddress: string, refundAddress: string, hexSalt: string, tokenSymbol?: string | undefined): Promise<{
        address: string;
    }>;
    validateOfflineDepositAddress(wrapOrUnWrap: "wrap" | "unwrap", fromChain: string, toChain: string, destinationAddress: string, refundAddress: string, hexSalt: string): Promise<string>;
    /**
     * @param {Object}  requestParams
     * @param {string}  requestParams.fromChain - Source chain identifier eg: avalanche, moonbeam ethereum-2, terra-2 ...
     * @param {string}  requestParams.toChain - Destination chain identifier eg: avalanche, moonbeam ethereum-2, terra-2 ...
     * @param {string}  requestParams.destinationAddress - Address where the asset should be transferred to on the destination chain
     * @param {Object}  requestParams.options
     */
    sendToken(requestParams: SendTokenParams): Promise<import("@cosmjs/stargate").DeliverTxResponse | ethers.providers.TransactionResponse>;
    sendTokenFromEvmChain(requestParams: SendTokenParams): Promise<ethers.providers.TransactionResponse>;
    private getChains;
    sendTokenFromCosmosChain(requestParams: SendTokenParams): Promise<import("@cosmjs/stargate").DeliverTxResponse>;
    populateUnsignedTx(): {
        sendToken: (params: SendTokenParams) => Promise<any>;
        getTx(): EncodeObject[];
    };
    private generateUnsignedSendTokenTx;
    /**
     * @param {Object}  requestParams
     * @param {string}  requestParams.fromChain - Source chain identifier eg: avalanche, moonbeam ethereum-2, terra-2 ...
     * @param {string}  requestParams.toChain - Destination chain identifier eg: avalanche, moonbeam ethereum-2, terra-2 ...
     * @param {string}  requestParams.destinationAddress - Address where the asset should be transferred to on the destination chain
     * @param {string}  requestParams.asset - Asset denomination eg: uausdc, uaxl ... If the asset specific is native cxy (e.g. ETH, AVAX, etc), the ERC20 version of the asset will appear on the dest chain
     * @param {Object}  requestParams.options
     * @param {string}  requestParams.options._traceId
     * @param {boolean} requestParams.options.shouldUnwrapIntoNative - when sending wrapped native asset back to its home chain (e.g. WETH back to Ethereum), specify "true" to receive native ETH; otherwise will received ERC20 version
     * @param {string}  requestParams.options.refundAddress - recipient where funds can be refunded if wrong ERC20 asset is deposited; ONLY AVAILABLE FOR WRAP/UNWRAP SERVICE
     */
    getDepositAddress(requestParamsOrFromChain: GetDepositAddressParams | string, _toChain?: string, _destinationAddress?: string, _asset?: string, _options?: GetDepositAddressOptions): Promise<string>;
    getOneTimeCode(signerAddress: string, traceId: string): Promise<OTC>;
    getInitRoomId(fromChain: string, toChain: string, destinationAddress: string, asset: string, publicAddress: string, signature: string, traceId: string): Promise<string>;
    getLinkEvent(roomId: string, sourceChain: string, destinationChain: string, destinationAddress: string): Promise<string>;
    getSocketService(): SocketService;
    extractDepositAddress(roomId: string): any;
    getERC20Denom(chainId: string): Promise<string>;
    getStaticInfo(): Promise<Record<string, any>>;
}
export {};
//# sourceMappingURL=AxelarAssetTransfer.d.ts.map