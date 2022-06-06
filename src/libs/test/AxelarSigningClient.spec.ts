import { AxelarSigningClient } from "../AxelarSigningClient";
import { AxelarSigningClientConfig, Environment } from "../types";
import {
  ConfirmDepositRequest,
  ExecutePendingTransfersRequest,
  LinkRequest,
  protobufPackage,
} from "@axelar-network/axelarjs-types/axelar/axelarnet/v1beta1/tx";
import { EncodeObject } from "@cosmjs/proto-signing";
import { toAccAddress } from "@cosmjs/stargate/build/queryclient/utils";
import { STANDARD_FEE } from "../AxelarSigningClient/const";

describe("AxelarSigningClient", () => {
  const config: AxelarSigningClientConfig = {
    environment: Environment.TESTNET,
    mnemonic: "grape kitchen depend dolphin elegant field hair ice bracket shell hover cover", // throwaway testnet account only, address should be axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc
    options: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getLinkAddress", () => {
    const address: string = "axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc";
    const linkPayload: EncodeObject[] = [
      {
        typeUrl: `/${protobufPackage}.LinkRequest`,
        value: LinkRequest.fromPartial({
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
      expect(result).toBeDefined();
      expect(result.transactionHash).toBeDefined();
    }, 60000);

    test("be able to sign and broadcast separately", async () => {
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

  describe("confirm deposit", () => {
    test("It should confirm a deposit tx", async () => {
      const api: AxelarSigningClient = await AxelarSigningClient.initOrGetAxelarSigningClient(
        config
      );
      const address: string = "axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc";
      const _depositAddress: string =
        "axelar1l788e3egtfd35syv84yk05ukxh0hjuktyfllehtxuj92x7ch60js46paz0";
      const denom: string = "wavax-wei";
      const confirmDepositPayload: EncodeObject[] = [
        {
          typeUrl: `/${protobufPackage}.ConfirmDepositRequest`,
          value: ConfirmDepositRequest.fromPartial({
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

  describe("execute pending transfers", () => {
    test("It should execute pending transfers", async () => {
      const api: AxelarSigningClient = await AxelarSigningClient.initOrGetAxelarSigningClient(
        config
      );
      const address: string = "axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc";
      const executePendingTransfersPayload: EncodeObject[] = [
        {
          typeUrl: `/${protobufPackage}.ExecutePendingTransfersRequest`,
          value: ExecutePendingTransfersRequest.fromPartial({
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
