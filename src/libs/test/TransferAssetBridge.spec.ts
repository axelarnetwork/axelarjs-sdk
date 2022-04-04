import { CLIENT_API_GET_OTC, CLIENT_API_POST_TRANSFER_ASSET } from "../..";
import { TransferAssetBridge } from "../TransferAssetBridge";
import { Environment } from "../types";
import {
  apiErrorStub,
  depositAddressPayloadStub,
  ethAddressStub,
  otcStub,
  roomIdStub,
  uuidStub,
} from "./stubs";

describe("TransferAssetBridge", () => {
  describe("on init", () => {
    let bridge: TransferAssetBridge;

    beforeEach(() => {
      bridge = new TransferAssetBridge({
        environment: Environment.TESTNET,
      });
    });

    describe("TransferAssetBridge", () => {
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
        expect(bridge.socket).toBeDefined();
      });
    });
  });

  describe("getOneTimeCode()", () => {
    let bridge: TransferAssetBridge;

    beforeEach(() => {
      bridge = new TransferAssetBridge({
        environment: Environment.TESTNET,
      });
    });

    describe("on error", () => {
      describe("when called", () => {
        let otc: any;
        let error: any;

        beforeEach(async () => {
          jest.spyOn(bridge.api, "get").mockRejectedValue(apiErrorStub());

          otc = await bridge
            .getOneTimeCode(ethAddressStub(), uuidStub())
            .catch((_error) => {
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
    let bridge: TransferAssetBridge;

    beforeEach(() => {
      bridge = new TransferAssetBridge({
        environment: Environment.TESTNET,
      });
    });

    describe("on error", () => {
      describe("when called", () => {
        let roomId: any;
        let error: any;

        beforeEach(async () => {
          jest.spyOn(bridge.api, "post").mockRejectedValue(apiErrorStub());

          roomId = await bridge
            .getInitRoomId(depositAddressPayloadStub(), uuidStub())
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

          roomId = await bridge.getInitRoomId(
            depositAddressPayloadStub(),
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
    let bridge: TransferAssetBridge;

    beforeEach(() => {
      bridge = new TransferAssetBridge({
        environment: Environment.TESTNET,
      });
    });

    describe("on error", () => {
      describe("when called", () => {
        let roomId: any;
        let error: any;

        beforeEach(async () => {
          jest
            .spyOn(bridge.socket, "joinRoomAndWaitForEvent")
            .mockRejectedValue(apiErrorStub());

          roomId = await bridge
            .getLinkEvent(roomIdStub().roomId)
            .catch((_error) => {
              error = _error;
            });
        });

        describe("api", () => {
          it("should be called", () => {
            expect(bridge.socket.joinRoomAndWaitForEvent).toHaveBeenCalledWith(
              roomIdStub().roomId
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
      describe("when called", () => {
        let roomId: any;
        beforeEach(async () => {
          jest
            .spyOn(bridge.socket, "joinRoomAndWaitForEvent")
            .mockResolvedValue(roomIdStub().roomId);

          roomId = await bridge.getLinkEvent(roomIdStub().roomId);
        });

        describe("api", () => {
          it("should be called", () => {
            expect(bridge.socket.joinRoomAndWaitForEvent).toHaveBeenCalledWith(
              roomIdStub().roomId
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
});
