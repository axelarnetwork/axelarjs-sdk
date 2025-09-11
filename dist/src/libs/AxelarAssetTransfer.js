"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxelarAssetTransfer = void 0;
const uuid_1 = require("uuid");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const utils_1 = require("ethers/lib/utils");
const types_1 = require("../services/types");
const services_1 = require("../services");
const utils_2 = require("../utils");
const constants_1 = require("../constants");
const types_2 = require("./types");
const DepositReceiver_json_1 = __importDefault(require("../../artifacts/contracts/deposit-service/DepositReceiver.sol/DepositReceiver.json"));
const ReceiverImplementation_json_1 = __importDefault(require("../../artifacts/contracts/deposit-service/ReceiverImplementation.sol/ReceiverImplementation.json"));
const s3_1 = __importDefault(require("./TransactionRecoveryApi/constants/s3"));
const ethers_1 = require("ethers");
const chains_1 = require("../chains");
const AxelarQueryAPI_1 = require("./AxelarQueryAPI");
const stargate_1 = require("@cosmjs/stargate");
const tx_1 = require("cosmjs-types/ibc/applications/transfer/v1/tx");
const AxelarGateway_1 = require("./AxelarGateway");
const erc20Abi_json_1 = __importDefault(require("./abi/erc20Abi.json"));
const { HashZero } = ethers_1.constants;
class AxelarAssetTransfer {
    constructor(config) {
        this.evmDenomMap = {};
        const configs = (0, constants_1.getConfigs)(config.environment);
        this.environment = config.environment;
        this.resourceUrl = configs.resourceUrl;
        // handle resource url overwrite (for tests)
        if (config.overwriteResourceUrl)
            this.resourceUrl = config.overwriteResourceUrl;
        this.api = new services_1.RestService(this.resourceUrl);
        this.depositServiceApi = new services_1.RestService(configs.depositServiceUrl);
        const links = (0, constants_1.getConfigs)(config.environment);
        this.axelarQueryApi = new AxelarQueryAPI_1.AxelarQueryAPI({
            environment: config.environment,
            axelarRpcUrl: links.axelarRpcUrl,
            axelarLcdUrl: links.axelarLcdUrl,
        });
    }
    getDepositAddressForNativeWrap(fromChain, toChain, destinationAddress, refundAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, utils_2.throwIfInvalidChainIds)([fromChain, toChain], this.environment);
            yield this.axelarQueryApi.throwIfInactiveChains([fromChain, toChain]);
            const _refundAddress = refundAddress ||
                (yield this.axelarQueryApi.getContractAddressFromConfig(fromChain, "default_refund_collector"));
            const { address } = yield this.getDepositAddressFromRemote("wrap", fromChain, toChain, destinationAddress, _refundAddress, HashZero);
            const expectedAddress = yield this.validateOfflineDepositAddress("wrap", fromChain, toChain, destinationAddress, _refundAddress, HashZero);
            if (address !== expectedAddress)
                throw new Error("Deposit address mismatch");
            return address;
        });
    }
    getDepositAddressForNativeUnwrap(fromChain_1, toChain_1, destinationAddress_1) {
        return __awaiter(this, arguments, void 0, function* (fromChain, toChain, destinationAddress, fromChainModule = "evm", refundAddress) {
            yield (0, utils_2.throwIfInvalidChainIds)([fromChain, toChain], this.environment);
            yield this.axelarQueryApi.throwIfInactiveChains([fromChain, toChain]);
            const _refundAddress = refundAddress ||
                (yield this.axelarQueryApi.getContractAddressFromConfig(fromChainModule === "evm" ? fromChain : toChain, "default_refund_collector"));
            const { address: unwrapAddress } = yield this.getDepositAddressFromRemote("unwrap", undefined, toChain, destinationAddress, _refundAddress, HashZero);
            const expectedAddress = yield this.validateOfflineDepositAddress("unwrap", fromChain, toChain, destinationAddress, _refundAddress, HashZero);
            if (unwrapAddress !== expectedAddress)
                throw new Error("Deposit address mismatch");
            const denom = yield this.getERC20Denom(toChain);
            const finalDepositAddress = yield this.getDepositAddress(fromChain, toChain, unwrapAddress, denom);
            return finalDepositAddress;
        });
    }
    getOfflineDepositAddressForERC20Transfer(fromChain_1, toChain_1, destinationAddress_1) {
        return __awaiter(this, arguments, void 0, function* (fromChain, toChain, destinationAddress, fromChainModule = "evm", tokenSymbol, refundAddress) {
            yield (0, utils_2.throwIfInvalidChainIds)([fromChain, toChain], this.environment);
            yield this.axelarQueryApi.throwIfInactiveChains([fromChain, toChain]);
            const _refundAddress = refundAddress ||
                (yield this.axelarQueryApi.getContractAddressFromConfig(fromChainModule === "evm" ? fromChain : toChain, "default_refund_collector"));
            const { address } = yield this.getDepositAddressFromRemote("erc20", fromChain, toChain, destinationAddress, _refundAddress, HashZero, tokenSymbol);
            return address;
        });
    }
    getDepositAddressFromRemote(type_1, fromChain_1, toChain_1, destinationAddress_1, refundAddress_1, hexSalt_1) {
        return __awaiter(this, arguments, void 0, function* (type, fromChain, toChain, destinationAddress, refundAddress, hexSalt, tokenSymbol = undefined) {
            const endpoint = `/deposit/${type}`;
            if (fromChain) {
                yield (0, utils_2.throwIfInvalidChainIds)([fromChain], this.environment);
                yield this.axelarQueryApi.throwIfInactiveChains([fromChain]);
            }
            if (toChain) {
                yield (0, utils_2.throwIfInvalidChainIds)([toChain], this.environment);
                yield this.axelarQueryApi.throwIfInactiveChains([toChain]);
            }
            return this.depositServiceApi
                .post(endpoint, {
                salt: hexSalt,
                source_chain: fromChain,
                destination_chain: toChain,
                destination_address: destinationAddress,
                refund_address: refundAddress,
                token_symbol: tokenSymbol,
            })
                .then((res) => ({ address: res.address.toLowerCase() }))
                .catch(() => ({ address: "" }));
        });
    }
    validateOfflineDepositAddress(wrapOrUnWrap, fromChain, toChain, destinationAddress, refundAddress, hexSalt) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, utils_2.throwIfInvalidChainIds)([fromChain, toChain], this.environment);
            yield this.axelarQueryApi.throwIfInactiveChains([fromChain, toChain]);
            const receiverInterface = new utils_1.Interface(ReceiverImplementation_json_1.default.abi);
            const functionData = wrapOrUnWrap === "wrap"
                ? receiverInterface.encodeFunctionData("receiveAndSendNative", [
                    refundAddress,
                    toChain.toLowerCase(),
                    destinationAddress,
                ])
                : receiverInterface.encodeFunctionData("receiveAndUnwrapNative", [
                    refundAddress,
                    destinationAddress,
                ]);
            const address = (0, utils_1.getCreate2Address)(yield this.axelarQueryApi.getContractAddressFromConfig(wrapOrUnWrap === "wrap" ? fromChain : toChain, "deposit_service"), hexSalt, (0, utils_1.keccak256)((0, utils_1.solidityPack)(["bytes", "bytes"], [
                DepositReceiver_json_1.default.bytecode,
                utils_1.defaultAbiCoder.encode(["bytes", "address"], [functionData, refundAddress]),
            ])));
            return address.toLowerCase();
        });
    }
    /**
     * @param {Object}  requestParams
     * @param {string}  requestParams.fromChain - Source chain identifier eg: avalanche, moonbeam ethereum-2, terra-2 ...
     * @param {string}  requestParams.toChain - Destination chain identifier eg: avalanche, moonbeam ethereum-2, terra-2 ...
     * @param {string}  requestParams.destinationAddress - Address where the asset should be transferred to on the destination chain
     * @param {Object}  requestParams.options
     */
    sendToken(requestParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fromChain, toChain, asset } = requestParams;
            yield (0, utils_2.throwIfInvalidChainIds)([fromChain, toChain], this.environment);
            const chainList = yield this.getChains();
            const srcChainInfo = chainList.find((ch) => ch.id === fromChain.toLowerCase());
            if (!(asset === null || asset === void 0 ? void 0 : asset.denom) && !(asset === null || asset === void 0 ? void 0 : asset.symbol))
                throw new Error("need to specify an asset");
            if (!srcChainInfo)
                throw new Error("cannot find chain" + fromChain);
            return srcChainInfo.module === "evm"
                ? this.sendTokenFromEvmChain(requestParams)
                : this.sendTokenFromCosmosChain(requestParams);
        });
    }
    sendTokenFromEvmChain(requestParams) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            if (!((_b = (_a = requestParams === null || requestParams === void 0 ? void 0 : requestParams.options) === null || _a === void 0 ? void 0 : _a.evmOptions) === null || _b === void 0 ? void 0 : _b.provider))
                throw `need a provider`;
            if (!((_d = (_c = requestParams === null || requestParams === void 0 ? void 0 : requestParams.options) === null || _c === void 0 ? void 0 : _c.evmOptions) === null || _d === void 0 ? void 0 : _d.signer))
                throw `need a signer`;
            if (!((_e = requestParams.asset) === null || _e === void 0 ? void 0 : _e.denom) && !((_f = requestParams.asset) === null || _f === void 0 ? void 0 : _f.symbol))
                throw new Error("need to specify an asset");
            const symbol = requestParams.asset.symbol ||
                (yield this.axelarQueryApi.getSymbolFromDenom(requestParams.asset.denom, requestParams.fromChain.toLowerCase()));
            const gateway = yield AxelarGateway_1.AxelarGateway.create(this.environment, requestParams.fromChain, (_h = (_g = requestParams.options) === null || _g === void 0 ? void 0 : _g.evmOptions) === null || _h === void 0 ? void 0 : _h.provider);
            if ((_k = (_j = requestParams === null || requestParams === void 0 ? void 0 : requestParams.options) === null || _j === void 0 ? void 0 : _j.evmOptions) === null || _k === void 0 ? void 0 : _k.approveSendForMe) {
                const tokenContract = new ethers_1.Contract(yield gateway.getTokenAddress(symbol), erc20Abi_json_1.default, requestParams.options.evmOptions.signer.connect(requestParams.options.evmOptions.provider));
                const approveTx = yield tokenContract.approve(gateway.getGatewayAddress, requestParams.amountInAtomicUnits);
                yield approveTx.wait();
            }
            const sendTokenArgs = {
                destinationChain: requestParams.toChain,
                destinationAddress: requestParams.destinationAddress,
                symbol,
                amount: requestParams.amountInAtomicUnits,
            };
            const sentTokenTx = yield gateway.createSendTokenTx(sendTokenArgs);
            return sentTokenTx.send(requestParams.options.evmOptions.signer, requestParams.options.evmOptions.txOptions);
        });
    }
    getChains() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.chains) {
                this.chains = yield (0, chains_1.loadChains)({ environment: this.environment });
            }
            return this.chains;
        });
    }
    sendTokenFromCosmosChain(requestParams) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!((_a = requestParams.options) === null || _a === void 0 ? void 0 : _a.cosmosOptions))
                throw `need a cosmos signer`;
            const { options: { cosmosOptions: { cosmosDirectSigner, rpcUrl, fee }, }, } = requestParams;
            const signingClient = yield stargate_1.SigningStargateClient.connectWithSigner(rpcUrl, cosmosDirectSigner);
            const { address: senderAddress } = (yield cosmosDirectSigner.getAccounts())[0];
            const payload = yield this.populateUnsignedTx()
                .sendToken(requestParams)
                .then((x) => x.getTx());
            return signingClient.signAndBroadcast(senderAddress, payload, fee);
        });
    }
    populateUnsignedTx() {
        let tx;
        const txBuilder = {
            sendToken: (params) => __awaiter(this, void 0, void 0, function* () {
                tx = yield this.generateUnsignedSendTokenTx(params);
                return txBuilder;
            }),
            getTx() {
                return tx;
            },
        };
        return txBuilder;
    }
    generateUnsignedSendTokenTx(requestParams) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!((_a = requestParams.options) === null || _a === void 0 ? void 0 : _a.cosmosOptions))
                throw `need a cosmos signer`;
            const { fromChain, toChain: destination_chain, destinationAddress: destination_address, asset, amountInAtomicUnits, options: { cosmosOptions: { cosmosDirectSigner, timeoutHeight, timeoutTimestamp }, }, } = requestParams;
            if (fromChain === chains_1.CHAINS[this.environment.toUpperCase()].AXELAR)
                throw `sending cross-chain using sendToken directly from Axelar network is currently not supported`;
            const chainList = yield this.getChains();
            const chain = chainList.find((ch) => ch.id === fromChain.toLowerCase());
            if (!chain)
                throw new Error("cannot find chain" + fromChain);
            const memo = JSON.stringify({
                destination_chain,
                destination_address,
                payload: null,
                type: 3, // corresponds to the `sendToken` command on Axelar
            });
            const { address: senderAddress } = (yield cosmosDirectSigner.getAccounts())[0];
            const AXELAR_GMP_ACCOUNT_ADDRESS = "axelar1dv4u5k73pzqrxlzujxg3qp8kvc3pje7jtdvu72npnt5zhq05ejcsn5qme5";
            return [
                {
                    typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
                    value: tx_1.MsgTransfer.fromPartial({
                        sender: senderAddress,
                        receiver: AXELAR_GMP_ACCOUNT_ADDRESS,
                        token: {
                            denom: asset.denom,
                            amount: amountInAtomicUnits,
                        },
                        sourceChannel: chain.channelIdToAxelar,
                        sourcePort: "transfer",
                        timeoutHeight,
                        timeoutTimestamp: timeoutTimestamp ? BigInt(timeoutTimestamp) : BigInt((Date.now() + 90) * 1e9),
                        memo,
                    }),
                },
            ];
        });
    }
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
    getDepositAddress(requestParamsOrFromChain, _toChain, _destinationAddress, _asset, _options) {
        return __awaiter(this, void 0, void 0, function* () {
            let fromChain, toChain, destinationAddress, asset, options;
            if (typeof requestParamsOrFromChain === "string") {
                fromChain = requestParamsOrFromChain;
                toChain = _toChain;
                destinationAddress = _destinationAddress;
                asset = _asset;
                options = _options;
            }
            else {
                ({ fromChain, toChain, destinationAddress, asset, options } =
                    requestParamsOrFromChain);
            }
            // use trace ID sent in by invoking user, or otherwise generate a new one
            const traceId = (options === null || options === void 0 ? void 0 : options._traceId) || (0, uuid_1.v4)();
            // validate chain identifiers
            yield (0, utils_2.throwIfInvalidChainIds)([fromChain, toChain], this.environment);
            // verify destination address format
            const isDestinationAddressValid = yield (0, utils_2.validateDestinationAddressByChainName)(toChain, destinationAddress, this.environment);
            if (!isDestinationAddressValid)
                throw new Error(`Invalid destination address for chain ${toChain}`);
            const chainList = yield (0, chains_1.loadChains)({ environment: this.environment });
            const srcChainInfo = chainList.find((chainInfo) => chainInfo.id === fromChain.toLowerCase());
            if (!srcChainInfo)
                throw new Error("cannot find chain" + fromChain);
            const destChainInfo = chainList.find((chainInfo) => chainInfo.id === toChain.toLowerCase());
            if (!destChainInfo)
                throw new Error("cannot find chain" + toChain);
            /**if user has selected native cxy, e.g. ETH, AVAX, etc, assume it is to be wrapped into ERC20 on dest chain */
            if ((0, types_2.isNativeToken)(srcChainInfo.id, asset, this.environment)) {
                return this.getDepositAddressForNativeWrap(fromChain, toChain, destinationAddress, options === null || options === void 0 ? void 0 : options.refundAddress);
            }
            /**if user has selected native cxy wrapped asset, e.g. WETH, WAVAX, and selected to unwrap it */
            if (destChainInfo.nativeAsset.includes(asset) && (options === null || options === void 0 ? void 0 : options.shouldUnwrapIntoNative)) {
                return this.getDepositAddressForNativeUnwrap(fromChain, toChain, destinationAddress, srcChainInfo.module, options.refundAddress);
            }
            if (srcChainInfo.module === "evm" && (options === null || options === void 0 ? void 0 : options.erc20DepositAddressType) === "offline") {
                return yield this.getOfflineDepositAddressForERC20Transfer(fromChain, toChain, destinationAddress, "evm", (yield this.axelarQueryApi.getSymbolFromDenom(asset, fromChain.toLowerCase())), options === null || options === void 0 ? void 0 : options.refundAddress);
            }
            // auth/rate limiting
            const wallet = (0, utils_2.createWallet)();
            // sign validation message
            const { validationMsg } = yield this.getOneTimeCode(wallet.address, traceId);
            const signature = yield wallet.signMessage(validationMsg);
            // get room id to listen for deposit address (to be extracted from link event)
            const roomId = yield this.getInitRoomId(fromChain, toChain, destinationAddress, asset, wallet.address, signature, traceId);
            // extract deposit address from link event
            const newRoomId = yield this.getLinkEvent(roomId, fromChain, toChain, destinationAddress);
            const depositAddress = this.extractDepositAddress(newRoomId);
            return depositAddress;
        });
    }
    getOneTimeCode(signerAddress, traceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const otc = yield this.api
                .get(`${types_1.CLIENT_API_GET_OTC}?publicAddress=${signerAddress}`, traceId)
                .then((response) => response)
                .catch((error) => {
                throw error;
            });
            return otc;
        });
    }
    getInitRoomId(fromChain, toChain, destinationAddress, asset, publicAddress, signature, traceId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield (0, utils_2.throwIfInvalidChainIds)([fromChain, toChain], this.environment);
            yield this.axelarQueryApi.throwIfInactiveChains([fromChain, toChain]);
            const payload = {
                fromChain,
                toChain,
                destinationAddress,
                asset,
                publicAddress,
                signature,
            };
            const response = yield this.api
                .post(types_1.CLIENT_API_POST_TRANSFER_ASSET, payload, traceId)
                .then((response) => response)
                .catch((error) => {
                throw error;
            });
            const roomId = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.roomId;
            return roomId;
        });
    }
    getLinkEvent(roomId, sourceChain, destinationChain, destinationAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, utils_2.throwIfInvalidChainIds)([sourceChain, destinationChain], this.environment);
            yield this.axelarQueryApi.throwIfInactiveChains([sourceChain, destinationChain]);
            const { newRoomId } = yield this.getSocketService()
                .joinRoomAndWaitForEvent(roomId, sourceChain, destinationChain, destinationAddress)
                .catch((error) => {
                throw error;
            });
            return newRoomId;
        });
    }
    getSocketService() {
        return new services_1.SocketService(this.resourceUrl, this.environment);
    }
    extractDepositAddress(roomId) {
        var _a;
        return (_a = JSON.parse(roomId)) === null || _a === void 0 ? void 0 : _a.depositAddress;
    }
    getERC20Denom(chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const chainList = yield (0, chains_1.loadChains)({ environment: this.environment });
            const chainName = (_a = chainList.find((chainInfo) => chainInfo.id === (chainId === null || chainId === void 0 ? void 0 : chainId.toLowerCase()))) === null || _a === void 0 ? void 0 : _a.chainName;
            if (!chainName)
                throw new Error(`Chain id ${chainId} does not fit any supported chain`);
            if (!this.evmDenomMap[chainName.toLowerCase()]) {
                const staticInfo = yield this.getStaticInfo();
                const denom = (_b = staticInfo.chains[chainName.toLowerCase()]) === null || _b === void 0 ? void 0 : _b.nativeAsset[0];
                if (denom) {
                    this.evmDenomMap[chainName.toLowerCase()] = denom;
                }
                else {
                    throw new Error(`Asset denom for ${chainId} not found`);
                }
                return denom;
            }
            return this.evmDenomMap[chainName.toLowerCase()];
        });
    }
    getStaticInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.staticInfo) {
                this.staticInfo = yield (0, cross_fetch_1.default)(s3_1.default[this.environment])
                    .then((res) => res.json())
                    .catch(() => undefined);
            }
            return this.staticInfo;
        });
    }
}
exports.AxelarAssetTransfer = AxelarAssetTransfer;
//# sourceMappingURL=AxelarAssetTransfer.js.map