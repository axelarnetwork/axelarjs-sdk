import { ethers } from "ethers";
import { Contract, Signer } from "ethers";
import { AxelarGateway } from "../AxelarGateway";
import { EvmChain } from "../types";
import { GatewayTx } from "../GatewayTx";
import { createNetwork, utils } from "@axelar-network/axelar-local-dev";

const { setLogger } = utils;
setLogger(() => null);

describe("AxelarGateway", () => {
  const MOCK_DESTINATION_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000001";
  const MOCK_DESTINATION_ACCOUNT_ADDRESS = "0x0000000000000000000000000000000000000002";
  let gatewayContract: Contract;
  let erc20Contract: Contract;
  let axelarGateway: AxelarGateway;
  let signer: Signer;
  const chain = EvmChain.AVALANCHE;

  beforeAll(async () => {
    const network = await createNetwork({ name: chain });
    signer = network.ownerWallet;
    gatewayContract = network.gateway.connect(signer);
    erc20Contract = network.usdc.connect(signer);
    axelarGateway = new AxelarGateway(gatewayContract.address, network.provider);
    await network.giveToken(
      await signer.getAddress(),
      await erc20Contract.symbol(),
      BigInt("10000000")
    );
  });

  it("should call `createCallContractTx` function without revert and `CallContract` event is emitted correctly", async () => {
    const bytesPayload = ethers.utils.formatBytes32String("test");
    const gatewayTx = await axelarGateway.createCallContractTx({
      destinationContractAddress: MOCK_DESTINATION_CONTRACT_ADDRESS,
      destinationChain: EvmChain.AVALANCHE,
      payload: bytesPayload,
    });

    expect(gatewayTx).toBeInstanceOf(GatewayTx);

    const tx = await gatewayTx.send(signer);
    const receipt = await tx.wait();

    expect(receipt.transactionHash).toBeDefined();

    const eventLogs = receipt.logs[0].topics;
    const signerAddress = await signer.getAddress().then((address) => address.toLowerCase());

    const eventId = ethers.utils.id("ContractCall(address,string,string,bytes32,bytes)");
    const hashedBytesPayload = ethers.utils.keccak256(bytesPayload);

    expect(eventLogs).toEqual([
      eventId,
      ethers.utils.hexZeroPad(signerAddress, 32),
      hashedBytesPayload,
    ]);
  });

  it("should call `createCallContractWithTokenTx` function without revert and `CallContractWithToken` event is emitted correctly", async () => {
    const bytesPayload = ethers.utils.formatBytes32String("test");
    const symbol = await erc20Contract.symbol();

    await axelarGateway
      .createApproveTx({
        tokenAddress: erc20Contract.address,
        amount: "1",
      })
      .then((tx) => tx.send(signer));
    const gatewayTx = await axelarGateway.createCallContractWithTokenTx({
      destinationContractAddress: MOCK_DESTINATION_CONTRACT_ADDRESS,
      destinationChain: EvmChain.MOONBEAM,
      payload: bytesPayload,
      symbol: symbol,
      amount: "1",
    });

    expect(gatewayTx).toBeInstanceOf(GatewayTx);

    const tx = await gatewayTx.send(signer);

    const receipt = await tx.wait();

    expect(receipt.transactionHash).toBeDefined();

    const eventLogs = receipt.logs.slice(-1)[0].topics;
    const signerAddress = await signer.getAddress().then((address) => address.toLowerCase());

    const eventId = ethers.utils.id(
      "ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)"
    );
    const hashedBytesPayload = ethers.utils.keccak256(bytesPayload);

    expect(eventLogs).toEqual([
      eventId,
      ethers.utils.hexZeroPad(signerAddress, 32),
      hashedBytesPayload,
    ]);
  });

  it("should call `createSendTokenTx` event without revert and `TokenSent` event is emitted correctly", async () => {
    const symbol = await erc20Contract.symbol();
    await axelarGateway
      .createApproveTx({
        tokenAddress: erc20Contract.address,
        amount: "1",
      })
      .then((tx) => tx.send(signer));
    const gatewayTx = await axelarGateway.createSendTokenTx({
      destinationAddress: MOCK_DESTINATION_ACCOUNT_ADDRESS,
      destinationChain: EvmChain.AVALANCHE,
      amount: "1",
      symbol,
    });

    expect(gatewayTx).toBeInstanceOf(GatewayTx);

    const tx = await gatewayTx.send(signer);
    const receipt = await tx.wait();

    expect(receipt.transactionHash).toBeDefined();
  });

  it("should call `createApproveTx` to increase allowance correctly given `tokenAddress` is ERC20 contract", async () => {
    const tx = await axelarGateway.createApproveTx({
      tokenAddress: erc20Contract.address,
      amount: "1",
    });

    expect(tx).toBeInstanceOf(GatewayTx);

    const receipt = await tx.send(signer).then((tx) => tx.wait());

    const signerAddress = await signer.getAddress();
    const allowance = await axelarGateway.getAllowance(erc20Contract.address, signerAddress);

    expect(receipt.transactionHash).toBeDefined();
    expect(allowance.toString()).toBe("1");
  });

  it("should call `createApproveTx` to increase with MaxUint256 given amount is undefined", async () => {
    const tx = await axelarGateway.createApproveTx({
      tokenAddress: erc20Contract.address,
    });

    expect(tx).toBeInstanceOf(GatewayTx);

    const receipt = await tx.send(signer).then((tx) => tx.wait());

    const signerAddress = await signer.getAddress();
    const allowance = await axelarGateway.getAllowance(erc20Contract.address, signerAddress);

    expect(receipt.transactionHash).toBeDefined();
    expect(allowance.toString()).toBe(ethers.constants.MaxUint256.toString());
  });

  it("should call `getTokenAddress` and get result correctly", async () => {
    const symbol = await erc20Contract.symbol();
    const address = await axelarGateway.getTokenAddress(symbol);
    expect(address).toBe(erc20Contract.address);
  });

  it("should call `isCommandExecuted` and get result correctly", async () => {
    const unexecuteCommandId = ethers.utils.formatBytes32String("unexecute");
    expect(await axelarGateway.isCommandExecuted(unexecuteCommandId)).toBe(false);
  });
});
