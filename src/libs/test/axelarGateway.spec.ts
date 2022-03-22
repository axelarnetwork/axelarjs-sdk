import hre, { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { Contract, Signer } from "ethers";
import { AxelarGateway } from "../AxelarGateway";
import { Environment, EvmChain } from "../types";
import { GatewayTx } from "../GatewayTx";

// Deploying contract takes longer than jest's default value (5s)
jest.setTimeout(30000);

describe("AxelarGateway", () => {
  const MOCK_DESTINATION_CONTRACT_ADDRESS =
    "0x0000000000000000000000000000000000000001";
  const MOCK_DESTINATION_ACCOUNT_ADDRESS =
    "0x0000000000000000000000000000000000000002";
  let gatewayContract: Contract;
  let erc20Contract: Contract;
  let axelarGateway: AxelarGateway;
  let signer: Signer;

  beforeAll(async () => {
    const AxelarGatewayContract = await hre.ethers.getContractFactory(
      "MinimalAxelarGateway"
    );
    const ERC20Contract = await hre.ethers.getContractFactory("ERC20");

    gatewayContract = await AxelarGatewayContract.deploy();
    erc20Contract = await ERC20Contract.deploy("Panty", "PNT");

    await gatewayContract.deployed();
    await erc20Contract.deployed();

    axelarGateway = new AxelarGateway(gatewayContract.address, ethers.provider);

    signer = await hre.ethers.getSigners().then((signers) => signers[0]);
  });

  it("should call `createCallContractTx` function without revert and `CallContract` event is emitted correctly", async () => {
    const bytesPayload = ethers.utils.formatBytes32String("test");
    const gatewayTx = await axelarGateway.createCallContractTx({
      contractAddress: MOCK_DESTINATION_CONTRACT_ADDRESS,
      destinationChain: EvmChain.AVALANCHE,
      payload: bytesPayload,
    });

    expect(gatewayTx).toBeInstanceOf(GatewayTx);

    const tx = await gatewayTx.send(signer);
    const receipt = await tx.wait();

    expect(receipt.transactionHash).toBeDefined();

    const eventLogs = receipt.logs[0].topics;
    const signerAddress = await signer
      .getAddress()
      .then((address) => address.toLowerCase());

    const eventId = ethers.utils.id(
      "ContractCall(address,string,string,bytes32,bytes)"
    );
    const hashedBytesPayload = ethers.utils.keccak256(bytesPayload);

    expect(eventLogs).toEqual([
      eventId,
      ethers.utils.hexZeroPad(signerAddress, 32),
      ethers.utils.id(EvmChain.AVALANCHE),
      hashedBytesPayload,
    ]);
  });

  it("should call `createCallContractWithTokenTx` function without revert and `CallContractWithToken` event is emitted correctly", async () => {
    const bytesPayload = ethers.utils.formatBytes32String("test");
    const gatewayTx = await axelarGateway.createCallContractWithTokenTx({
      contractAddress: MOCK_DESTINATION_CONTRACT_ADDRESS,
      destinationChain: EvmChain.AVALANCHE,
      payload: bytesPayload,
      symbol: "PNT",
      amount: "1",
    });

    expect(gatewayTx).toBeInstanceOf(GatewayTx);

    const tx = await gatewayTx.send(signer);

    const receipt = await tx.wait();

    expect(receipt.transactionHash).toBeDefined();

    const eventLogs = receipt.logs[0].topics;
    const signerAddress = await signer
      .getAddress()
      .then((address) => address.toLowerCase());

    const eventId = ethers.utils.id(
      "ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)"
    );
    const hashedBytesPayload = ethers.utils.keccak256(bytesPayload);

    expect(eventLogs).toEqual([
      eventId,
      ethers.utils.hexZeroPad(signerAddress, 32),
      ethers.utils.id(EvmChain.AVALANCHE),
      hashedBytesPayload,
    ]);
  });

  it("should call `createSendTokenTx` event without revert and `TokenSent` event is emitted correctly", async () => {
    const gatewayTx = await axelarGateway.createSendTokenTx({
      destinationAddress: MOCK_DESTINATION_ACCOUNT_ADDRESS,
      destinationChain: EvmChain.AVALANCHE,
      amount: "1",
      symbol: "PNT",
    });

    expect(gatewayTx).toBeInstanceOf(GatewayTx);

    const tx = await gatewayTx.send(signer);
    const receipt = await tx.wait();

    expect(receipt.transactionHash).toBeDefined();

    const eventLogs = receipt.logs[0].topics;
    const signerAddress = await signer
      .getAddress()
      .then((address) => address.toLowerCase());

    const eventId = ethers.utils.id(
      "TokenSent(address,string,string,string,uint256)"
    );

    expect(eventLogs).toEqual([
      eventId,
      ethers.utils.hexZeroPad(signerAddress, 32),
      ethers.utils.id(EvmChain.AVALANCHE),
      ethers.utils.id(MOCK_DESTINATION_ACCOUNT_ADDRESS),
    ]);
  });

  it("should call `createApproveTx` to increase allowance correctly given `tokenAddress` is ERC20 contract", async () => {
    const tx = await axelarGateway.createApproveTx({
      tokenAddress: erc20Contract.address,
      amount: "1",
    });

    expect(tx).toBeInstanceOf(GatewayTx);

    const receipt = await tx.send(signer).then((tx) => tx.wait());

    const signerAddress = await signer.getAddress();
    const allowance = await axelarGateway.getAllowance(
      erc20Contract.address,
      signerAddress
    );

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
    const allowance = await axelarGateway.getAllowance(
      erc20Contract.address,
      signerAddress
    );

    expect(receipt.transactionHash).toBeDefined();
    expect(allowance.toString()).toBe(ethers.constants.MaxUint256.toString());
  });

  it("should call `getTokenAddress` and get result correctly", async () => {
    const address = await axelarGateway
      .getTokenAddress("PNT")
      .then((_address: string) => _address.toLowerCase());
    const expectedAddress = ethers.utils
      .formatBytes32String("PNT")
      .slice(0, 42)
      .toLowerCase();
    expect(address).toBe(expectedAddress);
  });

  it("should call `isTokenFrozen` and get result correctly", async () => {
    const isIceFrozen = await axelarGateway.isTokenFrozen("ICE");
    expect(isIceFrozen).toBe(true);
    const isBoiledEggFrozen = await axelarGateway.isTokenFrozen("BOILED_EGG");
    expect(isBoiledEggFrozen).toBe(false);
  });

  it("should call `isCommandExecuted` and get result correctly", async () => {
    const executedCommandId = ethers.utils.formatBytes32String("executed");
    const unexecuteCommandId = ethers.utils.formatBytes32String("unexecute");

    expect(await axelarGateway.isCommandExecuted(executedCommandId)).toBe(true);
    expect(await axelarGateway.isCommandExecuted(unexecuteCommandId)).toBe(
      false
    );
  });
});
