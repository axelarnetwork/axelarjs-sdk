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
import { fromBech32 } from "@cosmjs/encoding";
import { STANDARD_FEE } from "../AxelarSigningClient/const";
import { utils } from "ethers";

describe("AxelarSigningClient", () => {
  // throwaway testnet account only
  const mnemonic = process.env.LIVE_AXELAR_MNEMONIC;
  const address = process.env.LIVE_AXELAR_ADDRESS;
  const axelarnetDepositAddress =
    "axelar192mp2cv2s0hayv6fwgjl64zs72hl97zcxjwcg6g8nkdkjxq89dps0yt6gc";
  const axelarnetDenom = "wavax-wei";
  const evmDepositTxHash = "0xf634de54ca14ed9aa8e02f42493e41a773cbd08b784de0208a46af5ad650da2b";
  const evmBurnerAddress = "0xBfEf22637071550b4860027c8A4036a22fD1967e";
  const evmChain = "avalanche";
  const TEST_FEE = {
    ...STANDARD_FEE,
    amount: [{ denom: "uaxl", amount: "40000" }],
  };

  const testIf = (...vars: Array<string | undefined>) => (vars.every(Boolean) ? test : test.skip);

  const getAddress = () => {
    if (!address) {
      throw new Error("Set LIVE_AXELAR_ADDRESS to run AxelarSigningClient tests.");
    }
    return address;
  };

  const config: AxelarSigningClientConfig = {
    environment: Environment.TESTNET,
    cosmosBasedWalletDetails: { mnemonic },
    axelarRpcUrl: "https://axelar-testnet-rpc.qubelabs.io:443",
    options: {},
  };

  beforeEach(() => {
    vitest.clearAllMocks();
  });

  describe("axelarnet getLinkAddress", () => {
    testIf(mnemonic, address)(
      "It should get a link address",
      async () => {
        const sender = getAddress();
        const linkPayload: EncodeObject[] = [
          {
            typeUrl: `/${axelarnetProtobufPackage}.LinkRequest`,
            value: AxelarnetLinkRequest.fromPartial({
              sender,
              recipientAddr: "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
              recipientChain: "avalanche",
              asset: "wavax-wei",
            }),
          },
        ];
        const api: AxelarSigningClient = await AxelarSigningClient.initOrGetAxelarSigningClient(
          config
        );

        const memo = `Generated from Javascript for ${sender}!`;
        const result = await api.signAndBroadcast(sender, linkPayload, TEST_FEE, memo);
        console.log("results", result);
        expect(result).toBeDefined();
        expect(result.transactionHash).toBeDefined();
      },
      60000
    );

    testIf(mnemonic, address)(
      "It should be able to sign and broadcast separately",
      async () => {
        const sender = getAddress();
        const linkPayload: EncodeObject[] = [
          {
            typeUrl: `/${axelarnetProtobufPackage}.LinkRequest`,
            value: AxelarnetLinkRequest.fromPartial({
              sender,
              recipientAddr: "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
              recipientChain: "avalanche",
              asset: "wavax-wei",
            }),
          },
        ];
        const api: AxelarSigningClient = await AxelarSigningClient.initOrGetAxelarSigningClient(
          config
        );
        const memo = `Generated from JS for ${sender}, signed and broadcasted separately!`;

        const signedTxBytes = await api.signAndGetTxBytes(linkPayload, TEST_FEE, memo);
        const result = await api.broadcastTx(signedTxBytes);

        expect(result).toBeDefined();
        expect(result.transactionHash).toBeDefined();
      },
      60000
    );
  });

  describe("confirm axelarnet deposit", () => {
    testIf(mnemonic, address)(
      "It should confirm axelarnet deposit tx",
      async () => {
        const api: AxelarSigningClient = await AxelarSigningClient.initOrGetAxelarSigningClient(
          config
        );
        const sender = getAddress();
        const confirmDepositPayload: EncodeObject[] = [
          {
            typeUrl: `/${axelarnetProtobufPackage}.ConfirmDepositRequest`,
            value: AxelarnetConfirmDepositRequest.fromPartial({
              sender,
              depositAddress: Buffer.from(fromBech32(axelarnetDepositAddress).data),
              denom: axelarnetDenom,
            }),
          },
        ];
        const memo = `Generated from Javascript for ${sender}!`;
        const result = await api.signThenBroadcast(confirmDepositPayload, TEST_FEE, memo);

        expect(result).toBeDefined();
        expect(result.transactionHash).toBeDefined();
      },
      60000
    );
  });

  describe("evm getLinkAddress", () => {
    testIf(mnemonic, address)(
      "It should get a link address",
      async () => {
        const sender = getAddress();
        const linkPayload: EncodeObject[] = [
          {
            typeUrl: `/${EvmProtobufPackage}.LinkRequest`,
            value: EvmLinkRequest.fromPartial({
              sender,
              recipientAddr: "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
              recipientChain: "avalanche",
              asset: "wavax-wei",
              chain: "polygon",
            }),
          },
        ];
        const api: AxelarSigningClient = await AxelarSigningClient.initOrGetAxelarSigningClient(
          config
        );

        const memo = `Generated from Javascript for ${sender}!`;
        const result = await api.signAndBroadcast(sender, linkPayload, TEST_FEE, memo);

        expect(result).toBeDefined();
        expect(result.transactionHash).toBeDefined();
      },
      60000
    );
  });

  describe("confirm evm deposit", () => {
    testIf(mnemonic, address)(
      "It should confirm evm deposit tx",
      async () => {
        const api: AxelarSigningClient = await AxelarSigningClient.initOrGetAxelarSigningClient(
          config
        );
        const sender = getAddress();
        const confirmDepositPayload: EncodeObject[] = [
          {
            typeUrl: `/${EvmProtobufPackage}.ConfirmDepositRequest`,
            value: EvmConfirmDepositRequest.fromPartial({
              sender,
              chain: evmChain,
              txId: Buffer.from(utils.arrayify(evmDepositTxHash)),
              burnerAddress: Buffer.from(utils.arrayify(evmBurnerAddress)),
            }),
          },
        ];

        const memo = `Generated from Javascript for ${sender}!`;
        const result = await api.signThenBroadcast(confirmDepositPayload, TEST_FEE, memo);

        expect(result).toBeDefined();
        expect(result.transactionHash).toBeDefined();
      },
      60000
    );
  });

  describe("execute pending transfers", () => {
    testIf(mnemonic, address)(
      "It should execute pending transfers",
      async () => {
        const api: AxelarSigningClient = await AxelarSigningClient.initOrGetAxelarSigningClient(
          config
        );
        const sender = getAddress();
        const executePendingTransfersPayload: EncodeObject[] = [
          {
            typeUrl: `/${axelarnetProtobufPackage}.ExecutePendingTransfersRequest`,
            value: AxelarnetExecutePendingTransfersRequest.fromPartial({
              sender,
            }),
          },
        ];
        const memo = `Generated from Javascript for ${sender}!`;
        const result = await api.signThenBroadcast(executePendingTransfersPayload, TEST_FEE, memo);

        expect(result).toBeDefined();
        expect(result.transactionHash).toBeDefined();
      },
      60000
    );
  });
});
