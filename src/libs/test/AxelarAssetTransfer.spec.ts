import { hexlify, hexZeroPad } from "ethers/lib/utils";
import { CHAINS, CLIENT_API_GET_OTC, CLIENT_API_POST_TRANSFER_ASSET } from "../..";
import { AxelarAssetTransfer, SendTokenParams } from "../AxelarAssetTransfer";
import { Environment, EvmChain } from "../types";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { Coin } from "@cosmjs/proto-signing";
import { StdFee } from "@cosmjs/stargate";
import {
  activeChainsStub,
  apiErrorStub,
  depositAddressPayloadStub,
  ethAddressStub,
  linkEventStub,
  newRoomIdStub,
  otcStub,
  roomIdStub,
  uuidStub,
} from "./stubs";

describe("AxelarAssetTransfer", () => {
  const socket = {
    joinRoomAndWaitForEvent: vitest.fn(),
  };
  beforeEach(() => {
    vitest
      .spyOn(AxelarAssetTransfer.prototype as any, "getSocketService")
      .mockReturnValueOnce(socket);

    vitest.clearAllMocks();
  });

  describe("on init", () => {
    let bridge: AxelarAssetTransfer;

    beforeEach(() => {
      bridge = new AxelarAssetTransfer({
        environment: Environment.TESTNET,
      });
      vitest.spyOn(bridge.axelarQueryApi, "getActiveChains").mockResolvedValue(activeChainsStub());
    });

    describe("AxelarAssetTransfer", () => {
      it("should be defined", () => {
        expect(bridge).toBeDefined();
      });

      it("should have environment", () => {
        expect(bridge.environment).toBeTruthy();
      });

      it("should have resource url", () => {
        expect(bridge.resourceUrl).toBeTruthy();
      });
    });

    describe("RestService", () => {
      it("should be defined", () => {
        expect(bridge.api).toBeDefined();
      });
    });

    describe("SocketService", () => {
      it("should be defined", () => {
        expect(socket).toBeDefined();
      });
    });
  });

  describe("getOneTimeCode()", () => {
    let bridge: AxelarAssetTransfer;

    beforeEach(() => {
      bridge = new AxelarAssetTransfer({
        environment: Environment.TESTNET,
      });
      vitest.spyOn(bridge.axelarQueryApi, "getActiveChains").mockResolvedValue(activeChainsStub());
    });

    describe("on error", () => {
      describe("when called", () => {
        let otc: any;
        let error: any;

        beforeEach(async () => {
          vitest.spyOn(bridge.api, "get").mockRejectedValue(apiErrorStub());

          otc = await bridge.getOneTimeCode(ethAddressStub(), uuidStub()).catch((_error) => {
            error = _error;
          });
        });

        describe("api", () => {
          it("should be called", () => {
            expect(bridge.api.get).toHaveBeenCalledWith(
              `${CLIENT_API_GET_OTC}?publicAddress=${ethAddressStub()}`,
              uuidStub()
            );
          });
        });

        describe("getOneTimeCode()", () => {
          it("shoud not return", () => {
            expect(otc).toBeUndefined();
          });
          it("should throw", () => {
            expect(error).toEqual(apiErrorStub());
          });
        });
      });
    });

    describe("on success", () => {
      describe("when called", () => {
        let otc: any;

        beforeEach(async () => {
          vitest.spyOn(bridge.api, "get").mockResolvedValue(otcStub());
          vitest
            .spyOn(bridge.axelarQueryApi, "getActiveChains")
            .mockResolvedValue(activeChainsStub());
          otc = await bridge.getOneTimeCode(ethAddressStub(), uuidStub());
        });

        describe("api", () => {
          it("should be called", () => {
            expect(bridge.api.get).toHaveBeenCalledWith(
              `${CLIENT_API_GET_OTC}?publicAddress=${ethAddressStub()}`,
              uuidStub()
            );
          });
        });

        describe("getOneTimeCode()", () => {
          it("shoud return", () => {
            expect(otc).toEqual(otcStub());
          });
        });
      });
    });
  });

  describe("getInitRoomId()", () => {
    let bridge: AxelarAssetTransfer;

    beforeEach(() => {
      bridge = new AxelarAssetTransfer({
        environment: Environment.TESTNET,
      });
      vitest.spyOn(bridge.axelarQueryApi, "getActiveChains").mockResolvedValue(activeChainsStub());
    });

    describe("on error", () => {
      describe("when called", () => {
        let roomId: any;
        let error: any;

        beforeEach(async () => {
          vitest.spyOn(bridge.api, "post").mockRejectedValue(apiErrorStub());

          const dto = depositAddressPayloadStub();

          roomId = await bridge
            .getInitRoomId(
              dto.fromChain,
              dto.toChain,
              dto.destinationAddress,
              dto.asset,
              dto.publicAddress,
              dto.signature,
              uuidStub()
            )
            .catch((_error) => {
              error = _error;
            });
        });

        describe("api", () => {
          it("should be called", () => {
            expect(bridge.api.post).toHaveBeenCalledWith(
              CLIENT_API_POST_TRANSFER_ASSET,
              depositAddressPayloadStub(),
              uuidStub()
            );
          });
        });

        describe("getInitRoomId()", () => {
          it("should throw", () => {
            expect(error).toEqual(apiErrorStub());
          });
          it("shoud return", () => {
            expect(roomId).toBeUndefined();
          });
        });
      });
    });

    describe("on success", () => {
      describe("when called", () => {
        let roomId: any;
        beforeEach(async () => {
          vitest.spyOn(bridge.api, "post").mockResolvedValue({
            data: roomIdStub(),
          });

          const dto = depositAddressPayloadStub();

          roomId = await bridge.getInitRoomId(
            dto.fromChain,
            dto.toChain,
            dto.destinationAddress,
            dto.asset,
            dto.publicAddress,
            dto.signature,
            uuidStub()
          );
        });

        describe("api", () => {
          it("should be called", () => {
            expect(bridge.api.post).toHaveBeenCalledWith(
              CLIENT_API_POST_TRANSFER_ASSET,
              depositAddressPayloadStub(),
              uuidStub()
            );
          });
        });

        describe("getInitRoomId()", () => {
          it("shoud return", () => {
            expect(roomId).toBe(roomIdStub().roomId);
          });
        });
      });
    });
  });

  describe("getLinkEvent()", () => {
    let bridge: AxelarAssetTransfer;

    beforeEach(() => {
      bridge = new AxelarAssetTransfer({
        environment: Environment.TESTNET,
      });
      vitest.spyOn(bridge.axelarQueryApi, "getActiveChains").mockResolvedValue(activeChainsStub());
    });

    describe("on error", () => {
      const dto = depositAddressPayloadStub();
      describe("when called", () => {
        let roomId: any;
        let error: any;

        beforeEach(async () => {
          vitest.spyOn(socket, "joinRoomAndWaitForEvent").mockRejectedValue(apiErrorStub());

          roomId = await bridge
            .getLinkEvent(roomIdStub().roomId, dto.fromChain, dto.toChain, dto.destinationAddress)
            .catch((_error) => {
              error = _error;
            });
        });

        describe("api", () => {
          it("should be called", () => {
            expect(socket.joinRoomAndWaitForEvent).toHaveBeenCalledWith(
              roomIdStub().roomId,
              dto.fromChain,
              dto.toChain,
              dto.destinationAddress
            );
          });
        });

        describe("getLinkEvent()", () => {
          it("should throw", () => {
            expect(error).toEqual(apiErrorStub());
          });

          it("shoud return", () => {
            expect(roomId).toBeUndefined();
          });
        });
      });
    });

    describe("on success", () => {
      const dto = depositAddressPayloadStub();
      describe("when called", () => {
        let roomId: any;
        beforeEach(async () => {
          vitest
            .spyOn(socket, "joinRoomAndWaitForEvent")
            .mockResolvedValueOnce({ newRoomId: newRoomIdStub() });
          roomId = await bridge.getLinkEvent(
            roomIdStub().roomId,
            dto.fromChain,
            dto.toChain,
            dto.destinationAddress
          );
        });

        describe("api", () => {
          it("should be called", () => {
            expect(socket.joinRoomAndWaitForEvent).toHaveBeenCalledWith(
              roomIdStub().roomId,
              dto.fromChain,
              dto.toChain,
              dto.destinationAddress
            );
          });
        });

        describe("getInitRoomId()", () => {
          it("shoud return", () => {
            expect(roomId).toEqual(newRoomIdStub());
          });
        });
      });
    });
  });

  describe("getDepositAddress()", () => {
    let bridge: AxelarAssetTransfer;

    beforeEach(() => {
      bridge = new AxelarAssetTransfer({
        environment: Environment.TESTNET,
      });
    });

    describe("when called", () => {
      const fromChain = CHAINS.TESTNET.OSMOSIS;
      const toChain = CHAINS.TESTNET.AVALANCHE;
      const depositAddress = "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";
      const asset = "uusd";
      let response: any;
      let responseWithObjectParams: any;
      beforeEach(async () => {
        vitest.spyOn(bridge, "getOneTimeCode").mockResolvedValue(otcStub());
        vitest.spyOn(bridge, "getInitRoomId").mockResolvedValue(roomIdStub().roomId);
        vitest.spyOn(bridge, "getLinkEvent").mockResolvedValue(linkEventStub().newRoomId);
        vitest
          .spyOn(bridge.axelarQueryApi, "getActiveChains")
          .mockResolvedValue(activeChainsStub());
        response = await bridge.getDepositAddress(fromChain, toChain, depositAddress, asset);
        responseWithObjectParams = await bridge.getDepositAddress({
          fromChain,
          toChain,
          destinationAddress: depositAddress,
          asset,
        });
      });

      it("should return deposit address", () => {
        expect(response).toBe(JSON.parse(newRoomIdStub())["depositAddress"]);
        expect(responseWithObjectParams).toBe(JSON.parse(newRoomIdStub())["depositAddress"]);
      });
    });
  });

  describe("offline deposit address methods", () => {
    let bridge: AxelarAssetTransfer;

    beforeEach(() => {
      bridge = new AxelarAssetTransfer({
        environment: Environment.TESTNET,
      });
    });

    describe("validateOfflineDepositAddress", () => {
      beforeEach(async () => {
        vitest.clearAllMocks();
        vitest
          .spyOn(bridge.axelarQueryApi, "getContractAddressFromConfig")
          .mockResolvedValue("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955");
        vitest
          .spyOn(bridge.axelarQueryApi, "getActiveChains")
          .mockResolvedValue(activeChainsStub());
      });
      it("should be able to generate a deposit address offline", async () => {
        await expect(
          bridge.validateOfflineDepositAddress(
            "wrap",
            EvmChain.AVALANCHE,
            EvmChain.FANTOM,
            "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
            "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
            hexZeroPad(hexlify(0), 32)
          )
        ).resolves.toBe("0xb24c3396aa90cae288b7f0771c88de4e180503e2");
      });
    });
    describe("getDepositAddressForNativeWrap", () => {
      let address: string;
      beforeEach(async () => {
        address = "0xb24c3396aa90cae288b7f0771c88de4e180503e2";
        vitest.clearAllMocks();
        vitest.spyOn(bridge, "getDepositAddressFromRemote").mockResolvedValue({ address });
        vitest
          .spyOn(bridge.axelarQueryApi, "getContractAddressFromConfig")
          .mockResolvedValue("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955");
        vitest
          .spyOn(bridge.axelarQueryApi, "getActiveChains")
          .mockResolvedValue(activeChainsStub());
      });
      it("should be able to generate a deposit address offline", () => {
        const depositAddress = bridge.validateOfflineDepositAddress(
          "wrap",
          EvmChain.AVALANCHE,
          EvmChain.FANTOM,
          "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
          "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
          hexZeroPad(hexlify(0), 32)
        );
        expect(depositAddress).toBeDefined();
      });
      it("should be able to retrieve the deposit address from microservices for native wrap", async () => {
        await expect(
          bridge.getDepositAddressForNativeWrap(
            EvmChain.AVALANCHE,
            EvmChain.FANTOM,
            "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
            "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d"
          )
        ).resolves.toBe(address);
      });
    });
    describe("getDepositAddressForNativeUnwrap", () => {
      let unwrapAddress: string;
      beforeEach(async () => {
        unwrapAddress = "0x34bd65b158b6b4cc539388842cb2447c0a28acc0";
        vitest.clearAllMocks();
        vitest
          .spyOn(bridge, "getDepositAddressFromRemote")
          .mockResolvedValue({ address: unwrapAddress });
        vitest.spyOn(bridge, "getDepositAddress").mockResolvedValue(unwrapAddress);
        vitest
          .spyOn(bridge.axelarQueryApi, "getContractAddressFromConfig")
          .mockResolvedValue("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955");
        vitest.spyOn(bridge, "getERC20Denom").mockResolvedValue("wavax-wei");
        vitest
          .spyOn(bridge.axelarQueryApi, "getActiveChains")
          .mockResolvedValue(activeChainsStub());
      });
      it("should be able to retrieve the deposit address from microservices for erc20 unwrap", async () => {
        await expect(
          bridge.getDepositAddressForNativeUnwrap(
            EvmChain.AVALANCHE,
            EvmChain.FANTOM,
            "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
            "evm",
            "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d"
          )
        ).resolves.toBe(unwrapAddress);
        expect(bridge.getDepositAddress).toHaveBeenCalledWith(
          EvmChain.AVALANCHE,
          EvmChain.FANTOM,
          unwrapAddress,
          "wavax-wei"
        );
      });
    });
    describe("getOfflineDepositAddressForERC20Transfer", () => {
      let unwrapAddress: string;

      beforeEach(async () => {
        unwrapAddress = "0x34bd65b158b6b4cc539388842cb2447c0a28acc0";
        vitest.clearAllMocks();
        vitest
          .spyOn(bridge, "getDepositAddressFromRemote")
          .mockResolvedValue({ address: unwrapAddress });
        vitest
          .spyOn(bridge.axelarQueryApi, "getContractAddressFromConfig")
          .mockResolvedValue("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955");
        vitest.spyOn(bridge, "getERC20Denom").mockResolvedValue("wavax-wei");
        vitest
          .spyOn(bridge.axelarQueryApi, "getActiveChains")
          .mockResolvedValue(activeChainsStub());
      });
      it("should be able to retrieve the deposit address from microservices for erc20", async () => {
        await expect(
          bridge.getOfflineDepositAddressForERC20Transfer(
            EvmChain.AVALANCHE,
            EvmChain.FANTOM,
            "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
            "evm",
            "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d"
          )
        ).resolves.toBe(unwrapAddress);
      });
      it("should be able to retrieve the deposit address from microservices for erc20 address", async () => {
        vitest.clearAllMocks();
        vitest
          .spyOn(bridge, "getOfflineDepositAddressForERC20Transfer")
          .mockResolvedValue(unwrapAddress);
        const res: any = await bridge.getDepositAddress({
          fromChain: CHAINS.TESTNET.AVALANCHE,
          toChain: CHAINS.TESTNET.FANTOM,
          destinationAddress: "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
          asset: "wavax-wei",
          options: {
            erc20DepositAddressType: "offline",
          },
        });
        expect(res).toEqual(unwrapAddress);
        expect(bridge.getOfflineDepositAddressForERC20Transfer).toHaveBeenCalled();
      });
    });
  });

  describe("offline deposit address integration into getDepositAddress()", () => {
    let bridge: AxelarAssetTransfer;

    beforeEach(() => {
      bridge = new AxelarAssetTransfer({
        environment: Environment.TESTNET,
      });
    });

    describe("getDepositAddress - wrap", () => {
      beforeEach(async () => {
        vitest.clearAllMocks();
        vitest
          .spyOn(bridge, "getDepositAddressForNativeWrap")
          .mockResolvedValue("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955");
        vitest
          .spyOn(bridge, "getDepositAddressForNativeUnwrap")
          .mockResolvedValue("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955");
        vitest
          .spyOn(bridge.axelarQueryApi, "getActiveChains")
          .mockResolvedValue(activeChainsStub());
      });
      it("should call getDepositAddressForNativeWrap and not getDepositAddressForNativeUnwrap", async () => {
        await expect(
          bridge.getDepositAddress(
            EvmChain.AVALANCHE,
            EvmChain.FANTOM,
            "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
            "AVAX",
            { refundAddress: "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d" }
          )
        ).resolves.toBe("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955");
        expect(bridge.getDepositAddressForNativeWrap).toHaveBeenCalled();
        expect(bridge.getDepositAddressForNativeUnwrap).not.toHaveBeenCalled();
      });
      it("should call getDepositAddressForNativeUnwrap and not getDepositAddressForNativeWrap", async () => {
        await expect(
          bridge.getDepositAddress(
            EvmChain.FANTOM,
            EvmChain.AVALANCHE,
            "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
            "wavax-wei",
            {
              refundAddress: "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
              shouldUnwrapIntoNative: true,
            }
          )
        ).resolves.toBe("0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955");
        expect(bridge.getDepositAddressForNativeWrap).not.toHaveBeenCalled();
        expect(bridge.getDepositAddressForNativeUnwrap).toHaveBeenCalled();
      });
    });
  });

  describe("sendToken", () => {
    let bridge: AxelarAssetTransfer;

    beforeEach(() => {
      bridge = new AxelarAssetTransfer({
        environment: Environment.TESTNET,
      });
    });

    describe("sendToken from Cosmos-based chain", () => {
      beforeEach(async () => {
        vitest.clearAllMocks();
      });
      it("should broadcast an ibc transfer message with a memo", async () => {
        const getSigner = async () => {
          const mnemonic = "YOUR OWN";
          return DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "osmo" });
        };
        const offlineSigner = await getSigner();
        const rpcUrl = "https://rpc.osmotest5.osmosis.zone";
        const fee: StdFee = {
          gas: "250000",
          amount: [{ denom: "uosmo", amount: "30000" }],
        };
        const coin: Coin = {
          denom: "ibc/9463E39D230614B313B487836D13A392BD1731928713D4C8427A083627048DB3",
          amount: "150000",
        };
        const requestOptions: SendTokenParams = {
          fromChain: CHAINS.TESTNET.OSMOSIS,
          toChain: CHAINS.TESTNET.AVALANCHE,
          asset: {
            denom: coin.denom,
          },
          amountInAtomicUnits: coin.amount,
          destinationAddress: "0xB8Cd93C83A974649D76B1c19f311f639e62272BC",
          options: {
            cosmosOptions: {
              cosmosDirectSigner: offlineSigner,
              rpcUrl,
              fee,
            },
          },
        };
        await expect(bridge.sendToken(requestOptions)).toBeTruthy();
      });
    });
  });
});
