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
exports.AxelarGateway = exports.AXELAR_GATEWAY = void 0;
const ethers_1 = require("ethers");
const types_1 = require("./types");
const erc20Abi_json_1 = __importDefault(require("./abi/erc20Abi.json"));
const GatewayTx_1 = require("./GatewayTx");
const AxelarQueryClient_1 = require("./AxelarQueryClient");
const EvmChain_1 = require("../constants/EvmChain");
exports.AXELAR_GATEWAY = {
    [types_1.Environment.MAINNET]: {
        [EvmChain_1.EvmChain.ETHEREUM]: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
        [EvmChain_1.EvmChain.AVALANCHE]: "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78",
        [EvmChain_1.EvmChain.BNBCHAIN]: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
        [EvmChain_1.EvmChain.FANTOM]: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
        [EvmChain_1.EvmChain.POLYGON]: "0x6f015F16De9fC8791b234eF68D486d2bF203FBA8",
        [EvmChain_1.EvmChain.MOONBEAM]: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
        [EvmChain_1.EvmChain.ARBITRUM]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.AURORA]: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
        [EvmChain_1.EvmChain.BASE]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.CELO]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.KAVA]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.OPTIMISM]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.FILECOIN]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.MANTLE]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.SCROLL]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.CENTRIFUGE]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.IMMUTABLE]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.FRAXTAL]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.BLAST]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    },
    [types_1.Environment.TESTNET]: {
        [EvmChain_1.EvmChain.ETHEREUM]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.AVALANCHE]: "0xC249632c2D40b9001FE907806902f63038B737Ab",
        [EvmChain_1.EvmChain.BASE]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.BNBCHAIN]: "0x4D147dCb984e6affEEC47e44293DA442580A3Ec0",
        [EvmChain_1.EvmChain.FANTOM]: "0x97837985Ec0494E7b9C71f5D3f9250188477ae14",
        [EvmChain_1.EvmChain.POLYGON]: "0xBF62ef1486468a6bd26Dd669C06db43dEd5B849B",
        [EvmChain_1.EvmChain.POLYGON_ZKEVM]: "0x999117D44220F33e0441fbAb2A5aDB8FF485c54D",
        [EvmChain_1.EvmChain.MOONBEAM]: "0x5769D84DD62a6fD969856c75c7D321b84d455929",
        [EvmChain_1.EvmChain.ARBITRUM]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.AURORA]: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
        [EvmChain_1.EvmChain.CELO]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.KAVA]: "0xC8D18F85cB0Cee5C95eC29c69DeaF6cea972349c",
        [EvmChain_1.EvmChain.OPTIMISM]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.LINEA]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.FILECOIN]: "0x999117D44220F33e0441fbAb2A5aDB8FF485c54D",
        [EvmChain_1.EvmChain.MANTLE]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.SCROLL]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.SEPOLIA]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.IMMUTABLE]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.CENTRIFUGE_TESTNET]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.ARBITRUM_SEPOLIA]: "0xe1cE95479C84e9809269227C7F8524aE051Ae77a",
        [EvmChain_1.EvmChain.FRAXTAL]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.BLAST_SEPOLIA]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.MANTLE_SEPOLIA]: "0xC8D18F85cB0Cee5C95eC29c69DeaF6cea972349c",
        [EvmChain_1.EvmChain.BASE_SEPOLIA]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.OPTIMISM_SEPOLIA]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.POLYGON_SEPOLIA]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        [EvmChain_1.EvmChain.LINEA_SEPOLIA]: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    },
    [types_1.Environment.DEVNET]: {
        [EvmChain_1.EvmChain.ETHEREUM]: "0x7358799e0c8250f0B7D1164824F6Dd5bA31C9Cd6",
        [EvmChain_1.EvmChain.AVALANCHE]: "0x4ffb57Aea2295d663B03810a5802ef2Bc322370D",
        [EvmChain_1.EvmChain.MOONBEAM]: "0x1b23BE90a16efe8fD3008E742dDd9531dC5845b0",
    },
};
class AxelarGateway {
    /**
     * @param contractAddress axelar gateway's contract address.
     * @param provider evm provider to read value from the contract.
     */
    constructor(gatewayAddress, provider) {
        this.provider = provider;
        this.gatewayAddress = gatewayAddress;
        this.contract = new ethers_1.ethers.Contract(gatewayAddress, [
            "event ContractCallWithToken(address indexed _from, string _sourceChain, string _destinationChain, bytes32 _txHash, bytes _data, string _token, uint256 _amount)",
            "event ContractCall(address indexed sender,string destinationChain,string destinationContractAddress,bytes32 indexed payloadHash,bytes payload)",
            "function callContract(string calldata destinationChain, string calldata contractAddress, bytes calldata payload) external",
            "function callContractWithToken(string calldata destinationChain, string calldata contractAddress, bytes calldata payload, string calldata symbol, uint256 amount) external",
            "function sendToken(string calldata destinationChain, string calldata destinationAddress, string calldata symbol, uint256 amount) external",
            "function tokenFrozen(string calldata symbol) external view returns (bool)",
            "function isCommandExecuted(bytes32 commandId) view returns (bool)",
            "function tokenAddresses(string calldata symbol) view returns (address)",
        ], provider);
    }
    /**
     * A convinient method to create AxelarGateway instance from our gateway contract that currently deployed on mainnet and testnet.
     *
     * @param env This value will be used in pair with `chain` in order to find corresponding `AxelarGateway` contract address.
     * @param chain This value will be used in pair with `env` in order to find corresponding `AxelarGateway` contract address.
     * @param provider evm provider to read value from the contract.
     * @returns AxelarGateway instance
     */
    static create(env, chain, provider) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let gatewayAddr = exports.AXELAR_GATEWAY[env][chain];
            if (!gatewayAddr) {
                const api = yield AxelarQueryClient_1.AxelarQueryClient.initOrGetAxelarQueryClient({
                    environment: env,
                });
                gatewayAddr = (_a = (yield api.evm.GatewayAddress({ chain }))) === null || _a === void 0 ? void 0 : _a.address;
            }
            return new AxelarGateway(gatewayAddr, provider);
        });
    }
    createCallContractTx(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const unsignedTx = yield this.contract.populateTransaction.callContract(args.destinationChain, args.destinationContractAddress, args.payload);
            return new GatewayTx_1.GatewayTx(unsignedTx, this.provider);
        });
    }
    get getGatewayAddress() {
        return this.gatewayAddress;
    }
    createCallContractWithTokenTx(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const unsignedTx = yield this.contract.populateTransaction.callContractWithToken(args.destinationChain, args.destinationContractAddress, args.payload, args.symbol, args.amount);
            return new GatewayTx_1.GatewayTx(unsignedTx, this.provider);
        });
    }
    createSendTokenTx(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const unsignedTx = yield this.contract.populateTransaction.sendToken(args.destinationChain, args.destinationAddress, args.symbol, args.amount);
            return new GatewayTx_1.GatewayTx(unsignedTx, this.provider);
        });
    }
    createApproveTx(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenAddress = args.tokenAddress;
            const erc20Contract = new ethers_1.ethers.Contract(tokenAddress, erc20Abi_json_1.default, this.provider);
            const unsignedTx = yield erc20Contract.populateTransaction.approve(this.contract.address, args.amount || ethers_1.ethers.constants.MaxUint256);
            return new GatewayTx_1.GatewayTx(unsignedTx, this.provider);
        });
    }
    getAllowance(tokenAddress, signerAddress) {
        const erc20Contract = new ethers_1.ethers.Contract(tokenAddress, erc20Abi_json_1.default, this.provider);
        return erc20Contract.allowance(signerAddress, this.contract.address);
    }
    isTokenFrozen(symbol) {
        return this.contract.tokenFrozen(symbol);
    }
    isCommandExecuted(commandId) {
        return this.contract.isCommandExecuted(commandId);
    }
    getTokenAddress(symbol) {
        return this.contract.tokenAddresses(symbol);
    }
    getERC20TokenContract(tokenSymbol) {
        return __awaiter(this, void 0, void 0, function* () {
            return new ethers_1.ethers.Contract(yield this.getTokenAddress(tokenSymbol), erc20Abi_json_1.default, this.provider);
        });
    }
    getContract() {
        return this.contract;
    }
}
exports.AxelarGateway = AxelarGateway;
//# sourceMappingURL=AxelarGateway.js.map