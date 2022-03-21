import hre, { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { Contract, Signer } from "ethers";
import AxelarGateway from "../AxelarGateway";
import { Environment, EvmChain } from "../types";
import GatewayTx from "../GatewayTx";

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

    axelarGateway = new AxelarGateway(
      Environment.TESTNET,
      EvmChain.AVALANCHE,
      new ethers.providers.JsonRpcProvider("http://localhost:8545"),
      gatewayContract.address
    );

    signer = await hre.ethers.getSigners().then((signers) => signers[0]);
  });

  describe("createCallContractTx", () => {
    it("should call without revert given `destinationChain` is supported", async () => {
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

    it("should throw error given `destinationChain` is unsupported", async () => {});
  });

  describe("createCallContractWithTokenTx", () => {
    it("should call without revert given `destinationChain` is supported", async () => {});

    it("should throw error given `destinationChain` is unsupported", async () => {});
  });

  describe("createSendTokenTx", () => {
    it("should call without revert given `destinationChain` is supported", () => {});

    it("should throw error given `destinationChain` is unsupported", async () => {});
  });

  describe("createApproveTx", () => {
    it("should increase allowance given `tokenAddress` is ERC20 contract", async () => {});

    it("should increase with MaxUint256 given 0 amount", async () => {});

    it("should throw error given `tokenAddress` is not ERC20 contract", async () => {});

    it("should throw error given `spender` is invalid format", async () => {});
  });

  test("should call sendToken without revert", async () => {});
});
