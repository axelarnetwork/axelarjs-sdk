import { Wallet } from "ethers";
import { OTC, TransferAssetBridge } from "../../../src";
import { SocketServices } from "../../../src/services";
import { createWallet } from "../../../src/utils/wallet";
import { getTransferPayload } from "../data";

export default () => {
  describe("Socket concurrency E2E", () => {
    let axelar: TransferAssetBridge;

    let wallet1: Wallet;
    let wallet2: Wallet;

    const destinationAddress1 = "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";
    const destinationAddress2 = "0xfe79F914ACe4a02e52a29942e64b4B695E4d8B2F";

    let sig1: string;
    let sig2: string;

    let room1Id: string;
    let room2Id: string;

    beforeAll(() => {
      axelar = new TransferAssetBridge("testnet");
    });

    describe("generate wallets", () => {
      beforeAll(async () => {
        wallet1 = createWallet();
        wallet2 = createWallet();
      });

      it("should generate wallets", () => {
        expect(wallet1).toBeDefined();
        expect(wallet1.address).toBeDefined();
        expect(wallet2).toBeDefined();
        expect(wallet2.address).toBeDefined();
      });

      test("wallets should be different", () => {
        expect(wallet1.address).not.toEqual(wallet2.address);
      });
    });

    describe("get validation msg & sign it", () => {
      let response1: OTC;
      let response2: OTC;

      beforeAll(async () => {
        response1 = await axelar.getOneTimeCode(wallet1.address, "0x");
        response2 = await axelar.getOneTimeCode(wallet2.address, "0x");
      });

      it("should get otc", () => {
        expect(response1.validationMsg).toBeDefined();
        expect(response2.validationMsg).toBeDefined();
      });

      it("should sign", async () => {
        sig1 = await wallet1.signMessage(response1.validationMsg);
        sig2 = await wallet2.signMessage(response2.validationMsg);

        expect(sig1).toBeDefined();
        expect(sig2).toBeDefined();
      });
    });

    describe("get room ids", () => {
      let response1: { roomId: string };
      let response2: { roomId: string };

      beforeAll(async () => {
        const transferPayload1 = getTransferPayload(
          sig1,
          wallet1.address,
          destinationAddress1
        );

        const transferPayload2 = getTransferPayload(
          sig2,
          wallet2.address,
          destinationAddress2
        );

        response1 = await axelar.getInitRoomId(transferPayload1, false, "0x");
        response2 = await axelar.getInitRoomId(transferPayload2, false, "0x");
      });

      it("should get room ids", () => {
        expect(response1.roomId).toBeDefined();
        expect(typeof response1.roomId).toBe("string");
        expect(response1.roomId.includes(destinationAddress1)).toBe(true);

        expect(response2.roomId).toBeDefined();
        expect(typeof response2.roomId).toBe("string");
        expect(response2.roomId.includes(destinationAddress2)).toBe(true);

        room1Id = response1.roomId;
        room2Id = response2.roomId;
      });
    });

    describe("simultaneous sockets connection", () => {
      jest.setTimeout(30000);

      let socket1: SocketServices;
      let socket2: SocketServices;

      let response1: any;
      let response2: any;

      beforeAll(() => {
        socket1 = new SocketServices("http://localhost:4000", true);
        socket2 = new SocketServices("http://localhost:4000", true);
      });

      it("should wait for socket responses", (done) => {
        let eventReceivedCount = 0;

        socket1.joinRoomAndWaitForEvent(room1Id, (data: any) => {
          console.log({
            from: "socket 1",
            data,
          });

          response1 = data;

          eventReceivedCount++;
          if (eventReceivedCount === 2) done();
        });

        socket2.joinRoomAndWaitForEvent(room2Id, (data: any) => {
          console.log({
            from: "socket 2",
            data,
          });

          response2 = data;

          eventReceivedCount++;
          if (eventReceivedCount === 2) done();
        });
      });

      it("socket responses should differ", () => {
        expect(response1.newRoomId).toBeDefined();
        expect(response2.newRoomId).toBeDefined();

        expect(response1.newRoomId).not.toEqual(response2.newRoomId);

        expect(response1.Attributes.destinationAddress).toBeTruthy();
        expect(response2.Attributes.destinationAddress).toBeTruthy();
        expect(response1.Attributes.destinationAddress).not.toEqual(
          response2.Attributes.destinationAddress
        );
      });
    });
  });
};
