import { AxelarSigningClient } from "../AxelarSigningClient";
import { AxelarSigningClientConfig, Environment } from "../types";
import {
  ConfirmDepositRequest as AxelarnetConfirmDepositRequest,
  ExecutePendingTransfersRequest as AxelarnetExecutePendingTransfersRequest,
  LinkRequest as AxelarnetLinkRequest,
  protobufPackage as axelarnetProtobufPackage,
} from "@axelar-network/axelarjs-types/axelar/axelarnet/v1beta1/tx";
import {
  ConfirmDepositRequest as EvmConfirmDepositRequest,
  LinkRequest as EvmLinkRequest,
  protobufPackage as EvmProtobufPackage,
} from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/tx";
import { EncodeObject } from "@cosmjs/proto-signing";
import { toAccAddress } from "@cosmjs/stargate/build/queryclient/utils";
import { STANDARD_FEE } from "../AxelarSigningClient/const";
import { utils } from "ethers"

describe("AxelarSigningClient", () => {
  // throwaway testnet account only, address should be axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc
  const mnemonic: string = "grape kitchen depend dolphin elegant field hair ice bracket shell hover cover";
  const config: AxelarSigningClientConfig = {
    environment: Environment.TESTNET,
    walletDetails: { mnemonic },
    options: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("axelarnet getLinkAddress", () => {
    const address: string = "axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc";
    const linkPayload: EncodeObject[] = [
      {
        typeUrl: `/${axelarnetProtobufPackage}.LinkRequest`,
        value: AxelarnetLinkRequest.fromPartial({
          sender: toAccAddress(address),
          recipientAddr: "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
          recipientChain: "avalanche",
          asset: "wavax-wei",
        }),
      },
    ];
    test("It should get a link address", async () => {
      const api: AxelarSigningClient = await AxelarSigningClient.initOrGetAxelarSigningClient(
        config
      );

      const memo = `Generated from Javascript for ${address}!`;
      const result = await api.signAndBroadcast(address, linkPayload, STANDARD_FEE, memo);
      console.log("results",result)
      expect(result).toBeDefined();
      expect(result.transactionHash).toBeDefined();
    }, 60000);

    test("It should be able to sign and broadcast separately", async () => {
      const api: AxelarSigningClient = await AxelarSigningClient.initOrGetAxelarSigningClient(
        config
      );
      const memo = `Generated from JS for ${address}, signed and broadcasted separately!`;

      const signedTxBytes = await api.signAndGetTxBytes(linkPayload, STANDARD_FEE, memo);
      const result = await api.broadcastTx(signedTxBytes);

      expect(result).toBeDefined();
      expect(result.transactionHash).toBeDefined();
    }, 60000);
  });

  describe("confirm axelarnet deposit", () => {
    test("It should confirm axelarnet deposit tx", async () => {
      const api: AxelarSigningClient = await AxelarSigningClient.initOrGetAxelarSigningClient(
        config
      );
      const address: string = "axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc";
      const _depositAddress: string =
        "axelar192mp2cv2s0hayv6fwgjl64zs72hl97zcxjwcg6g8nkdkjxq89dps0yt6gc";
      const denom: string = "wavax-wei";
      const confirmDepositPayload: EncodeObject[] = [
        {
          typeUrl: `/${axelarnetProtobufPackage}.ConfirmDepositRequest`,
          value: AxelarnetConfirmDepositRequest.fromPartial({
            sender: toAccAddress(address),
            depositAddress: toAccAddress(_depositAddress),
            denom,
          }),
        },
      ];
      const memo = `Generated from Javascript for ${address}!`;
      const result = await api.signThenBroadcast(confirmDepositPayload, STANDARD_FEE, memo);

      expect(result).toBeDefined();
      expect(result.transactionHash).toBeDefined();
    }, 60000);
  });

  describe("evm getLinkAddress", () => {
    const address: string = "axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc";
    const linkPayload: EncodeObject[] = [
      {
        typeUrl: `/${EvmProtobufPackage}.LinkRequest`,
        value: EvmLinkRequest.fromPartial({
          sender: toAccAddress(address),
          recipientAddr: "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
          recipientChain: "avalanche",
          asset: "wavax-wei",
          chain: "polygon",
        }),
      },
    ];
    
    test("It should get a link address", async () => {
      const api: AxelarSigningClient = await AxelarSigningClient.initOrGetAxelarSigningClient(
        config
      );

      const memo = `Generated from Javascript for ${address}!`;
      const result = await api.signAndBroadcast(address, linkPayload, STANDARD_FEE, memo);

      expect(result).toBeDefined();
      expect(result.transactionHash).toBeDefined();
    }, 60000);

  });

  describe("confirm evm deposit", () => {
    test("It should confirm evm deposit tx", async () => {
      const api: AxelarSigningClient = await AxelarSigningClient.initOrGetAxelarSigningClient(
        config
      );
      const address: string = "axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc";
      const burnerAddress: string = "0xBfEf22637071550b4860027c8A4036a22fD1967e";
      const chain: string = "avalanche";
      const txHash: string = "0xf634de54ca14ed9aa8e02f42493e41a773cbd08b784de0208a46af5ad650da2b";
      const confirmDepositPayload: EncodeObject[] = [
        {
          typeUrl: `/${EvmProtobufPackage}.ConfirmDepositRequest`,
          value: EvmConfirmDepositRequest.fromPartial({
            sender: toAccAddress(address),
            chain,
            txId: utils.arrayify(txHash),
            burnerAddress: utils.arrayify(burnerAddress)
          }),
        },
      ];

      const memo = `Generated from Javascript for ${address}!`;
      const result = await api.signThenBroadcast(confirmDepositPayload, STANDARD_FEE, memo);

      expect(result).toBeDefined();
      expect(result.transactionHash).toBeDefined();
    }, 60000);
  });

  describe("execute pending transfers", () => {
    test("It should execute pending transfers", async () => {
      const api: AxelarSigningClient = await AxelarSigningClient.initOrGetAxelarSigningClient(
        config
      );
      const address: string = "axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc";
      const executePendingTransfersPayload: EncodeObject[] = [
        {
          typeUrl: `/${axelarnetProtobufPackage}.ExecutePendingTransfersRequest`,
          value: AxelarnetExecutePendingTransfersRequest.fromPartial({
            sender: toAccAddress(address),
          }),
        },
      ];
      const memo = `Generated from Javascript for ${address}!`;
      const result = await api.signThenBroadcast(
        executePendingTransfersPayload,
        STANDARD_FEE,
        memo
      );

      expect(result).toBeDefined();
      expect(result.transactionHash).toBeDefined();
    }, 60000);
  });
});