import { Wallet } from "ethers";
import { createWallet, signOtc } from "../../../src/utils";
import { TransferAssetBridge } from "../../../src/libs";
import { OTC } from "../../../src/services/types";
import { getTransferPayload } from "../data";
import { SocketServices } from "../../../src/services";

export default () => {
  describe("Deposit address generation E2E", () => {
    const destinationAddress = "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";

    let axelar: TransferAssetBridge;
    let wallet: Wallet;
    let signature: string;
    let validationMsg: string;
    let roomId: string;

    beforeAll(() => {
      axelar = new TransferAssetBridge("testnet");
    });

    describe("wallet creation", () => {
      beforeAll(() => {
        wallet = createWallet();
      });

      it("should create wallet", () => {
        expect(wallet).toBeDefined();
      });
    });

    describe("getting one time code", () => {
      let response: OTC;
      beforeAll(async () => {
        response = await axelar.getOneTimeCode(wallet.address, "0x");
      });

      it("should get otc", () => {
        expect(response.otc).toBeDefined(); // FIXME: check why otc is "OK"
        expect(response.validationMsg).toBeDefined();
        validationMsg = response.validationMsg;
      });
    });

    describe("creating signature based on validation message", () => {
      beforeAll(async () => {
        signature = await signOtc(wallet, validationMsg);
      });

      it("should sign validation message", () => {
        expect(signature).toBeDefined();
      });
    });

    describe("getting room id", () => {
      let response: any;

      beforeAll(async () => {
        const transferPayload = getTransferPayload(
          signature,
          wallet.address,
          destinationAddress
        );
        response = await axelar.getInitRoomId(transferPayload, false, "0x");
      });

      it("should get room id", () => {
        expect(response.roomId).toBeDefined();
        expect(typeof response.roomId).toBe("string");
        expect(response.roomId.includes(destinationAddress)).toBe(true);

        roomId = response.roomId;
      });
    });

    describe("getting deposit address", () => {
      jest.setTimeout(30000);
      let socket: SocketServices;

      beforeAll(() => {
        socket = new SocketServices("http://localhost:4000", true);
      });

      it("should connect to room and wait ", (done) => {
        socket.joinRoomAndWaitForEvent(roomId, (data: any) => {
          console.log({
            from: "socket",
            data,
          });
          expect(data.newRoomId).toBeDefined();

          // deposit address is here
          expect(data.Attributes.depositAddress).toBeDefined();
          done();
        });
      });
    });
  });
};
