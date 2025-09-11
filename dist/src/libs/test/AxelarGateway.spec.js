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
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const AxelarGateway_1 = require("../AxelarGateway");
const EvmChain_1 = require("../../constants/EvmChain");
const GatewayTx_1 = require("../GatewayTx");
const axelar_local_dev_1 = require("@axelar-network/axelar-local-dev");
const { setLogger } = axelar_local_dev_1.utils;
setLogger(() => null);
describe("AxelarGateway", () => {
    const MOCK_DESTINATION_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000001";
    const MOCK_DESTINATION_ACCOUNT_ADDRESS = "0x0000000000000000000000000000000000000002";
    let gatewayContract;
    let erc20Contract;
    let axelarGateway;
    let signer;
    const chain = EvmChain_1.EvmChain.AVALANCHE;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const network = yield (0, axelar_local_dev_1.createNetwork)({ name: chain });
        signer = network.ownerWallet;
        gatewayContract = network.gateway.connect(signer);
        erc20Contract = yield network
            .deployToken("Axelar Wrapped aUSDC", "aUSDC", 6, BigInt(1e70))
            .then((usdc) => usdc.connect(signer));
        axelarGateway = new AxelarGateway_1.AxelarGateway(gatewayContract.address, network.provider);
        yield network.giveToken(yield signer.getAddress(), yield erc20Contract.symbol(), BigInt("10000000"));
    }));
    it("should call `createCallContractTx` function without revert and `CallContract` event is emitted correctly", () => __awaiter(void 0, void 0, void 0, function* () {
        const bytesPayload = ethers_1.ethers.utils.formatBytes32String("test");
        const gatewayTx = yield axelarGateway.createCallContractTx({
            destinationContractAddress: MOCK_DESTINATION_CONTRACT_ADDRESS,
            destinationChain: EvmChain_1.EvmChain.AVALANCHE,
            payload: bytesPayload,
        });
        expect(gatewayTx).toBeInstanceOf(GatewayTx_1.GatewayTx);
        const tx = yield gatewayTx.send(signer);
        const receipt = yield tx.wait();
        expect(receipt.transactionHash).toBeDefined();
        const eventLogs = receipt.logs[0].topics;
        const signerAddress = yield signer.getAddress().then((address) => address.toLowerCase());
        const eventId = ethers_1.ethers.utils.id("ContractCall(address,string,string,bytes32,bytes)");
        const hashedBytesPayload = ethers_1.ethers.utils.keccak256(bytesPayload);
        expect(eventLogs).toEqual([
            eventId,
            ethers_1.ethers.utils.hexZeroPad(signerAddress, 32),
            hashedBytesPayload,
        ]);
    }));
    it("should call `createCallContractWithTokenTx` function without revert and `CallContractWithToken` event is emitted correctly", () => __awaiter(void 0, void 0, void 0, function* () {
        const bytesPayload = ethers_1.ethers.utils.formatBytes32String("test");
        const symbol = yield erc20Contract.symbol();
        yield axelarGateway
            .createApproveTx({
            tokenAddress: erc20Contract.address,
            amount: "1",
        })
            .then((tx) => tx.send(signer));
        const gatewayTx = yield axelarGateway.createCallContractWithTokenTx({
            destinationContractAddress: MOCK_DESTINATION_CONTRACT_ADDRESS,
            destinationChain: EvmChain_1.EvmChain.MOONBEAM,
            payload: bytesPayload,
            symbol: symbol,
            amount: "1",
        });
        expect(gatewayTx).toBeInstanceOf(GatewayTx_1.GatewayTx);
        const tx = yield gatewayTx.send(signer);
        const receipt = yield tx.wait();
        expect(receipt.transactionHash).toBeDefined();
        const eventLogs = receipt.logs.slice(-1)[0].topics;
        const signerAddress = yield signer.getAddress().then((address) => address.toLowerCase());
        const eventId = ethers_1.ethers.utils.id("ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)");
        const hashedBytesPayload = ethers_1.ethers.utils.keccak256(bytesPayload);
        expect(eventLogs).toEqual([
            eventId,
            ethers_1.ethers.utils.hexZeroPad(signerAddress, 32),
            hashedBytesPayload,
        ]);
    }));
    it("should call `createSendTokenTx` event without revert and `TokenSent` event is emitted correctly", () => __awaiter(void 0, void 0, void 0, function* () {
        const symbol = yield erc20Contract.symbol();
        yield axelarGateway
            .createApproveTx({
            tokenAddress: erc20Contract.address,
            amount: "1",
        })
            .then((tx) => tx.send(signer));
        const gatewayTx = yield axelarGateway.createSendTokenTx({
            destinationAddress: MOCK_DESTINATION_ACCOUNT_ADDRESS,
            destinationChain: EvmChain_1.EvmChain.AVALANCHE,
            amount: "1",
            symbol,
        });
        expect(gatewayTx).toBeInstanceOf(GatewayTx_1.GatewayTx);
        const tx = yield gatewayTx.send(signer);
        const receipt = yield tx.wait();
        expect(receipt.transactionHash).toBeDefined();
    }));
    it("should call `createApproveTx` to increase allowance correctly given `tokenAddress` is ERC20 contract", () => __awaiter(void 0, void 0, void 0, function* () {
        const tx = yield axelarGateway.createApproveTx({
            tokenAddress: erc20Contract.address,
            amount: "1",
        });
        expect(tx).toBeInstanceOf(GatewayTx_1.GatewayTx);
        const receipt = yield tx.send(signer).then((tx) => tx.wait());
        const signerAddress = yield signer.getAddress();
        const allowance = yield axelarGateway.getAllowance(erc20Contract.address, signerAddress);
        expect(receipt.transactionHash).toBeDefined();
        expect(allowance.toString()).toBe("1");
    }));
    it("should call `createApproveTx` to increase with MaxUint256 given amount is undefined", () => __awaiter(void 0, void 0, void 0, function* () {
        const tx = yield axelarGateway.createApproveTx({
            tokenAddress: erc20Contract.address,
        });
        expect(tx).toBeInstanceOf(GatewayTx_1.GatewayTx);
        const receipt = yield tx.send(signer).then((tx) => tx.wait());
        const signerAddress = yield signer.getAddress();
        const allowance = yield axelarGateway.getAllowance(erc20Contract.address, signerAddress);
        expect(receipt.transactionHash).toBeDefined();
        expect(allowance.toString()).toBe(ethers_1.ethers.constants.MaxUint256.toString());
    }));
    it("should call `getTokenAddress` and get result correctly", () => __awaiter(void 0, void 0, void 0, function* () {
        const symbol = yield erc20Contract.symbol();
        const address = yield axelarGateway.getTokenAddress(symbol);
        expect(address).toBe(erc20Contract.address);
    }));
    it("should call `isCommandExecuted` and get result correctly", () => __awaiter(void 0, void 0, void 0, function* () {
        const unexecuteCommandId = ethers_1.ethers.utils.formatBytes32String("unexecute");
        expect(yield axelarGateway.isCommandExecuted(unexecuteCommandId)).toBe(false);
    }));
});
//# sourceMappingURL=AxelarGateway.spec.js.map