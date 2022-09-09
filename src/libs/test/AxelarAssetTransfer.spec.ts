import { CLIENT_API_GET_OTC, CLIENT_API_POST_TRANSFER_ASSET } from "../..";
import { AxelarAssetTransfer } from "../AxelarAssetTransfer";
import { Environment } from "../types";
import {
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
    joinRoomAndWaitForEvent: jest.fn(),
  };
  beforeEach(() => {
    jest
      .spyOn(AxelarAssetTransfer.prototype as any, "getSocketService")
      .mockReturnValueOnce(socket);
    jest.clearAllMocks();
  });

  describe("on init", () => {
    let bridge: AxelarAssetTransfer;

    beforeEach(() => {
      bridge = new AxelarAssetTransfer({
        environment: Environment.TESTNET,
      });
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
    });

    describe("on error", () => {
      describe("when called", () => {
        let otc: any;
        let error: any;

        beforeEach(async () => {
          jest.spyOn(bridge.api, "get").mockRejectedValue(apiErrorStub());

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
          jest.spyOn(bridge.api, "get").mockResolvedValue(otcStub());
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
    });

    describe("on error", () => {
      describe("when called", () => {
        let roomId: any;
        let error: any;

        beforeEach(async () => {
          jest.spyOn(bridge.api, "post").mockRejectedValue(apiErrorStub());

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
          jest.spyOn(bridge.api, "post").mockResolvedValue({
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
    });

    describe("on error", () => {
      const dto = depositAddressPayloadStub();
      describe("when called", () => {
        let roomId: any;
        let error: any;

        beforeEach(async () => {
          jest.spyOn(socket, "joinRoomAndWaitForEvent").mockRejectedValue(apiErrorStub());

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
          jest
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
      const fromChain = "terra";
      const toChain = "avalanche";
      const depositAddress = "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";
      const asset = "uusd";
      let response: any;
      beforeEach(async () => {
        jest.spyOn(bridge, "getOneTimeCode").mockResolvedValue(otcStub());
        jest.spyOn(bridge, "getInitRoomId").mockResolvedValue(roomIdStub().roomId);
        jest.spyOn(bridge, "getLinkEvent").mockResolvedValue(linkEventStub().newRoomId);
        response = await bridge.getDepositAddress(fromChain, toChain, depositAddress, asset);
      });

      it("should return deposit address", () => {
        expect(response).toBe(JSON.parse(newRoomIdStub())["depositAddress"]);
      });
    });
  });
});
