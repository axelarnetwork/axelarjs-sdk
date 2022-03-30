import { TransferAssetBridge } from "../../../src";
// import { getDepositPayload } from "../data";

export default () => {
  describe("Deposit Address e2e", () => {
    let axelar: TransferAssetBridge;

    beforeAll(() => {
      axelar = new TransferAssetBridge("testnet");
    });

    describe("getting deposit address - Terra -> Avalanche", () => {
      jest.setTimeout(30000);
      let response: string;
      const destinationAddress = "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";

      beforeAll(async () => {
        response = await axelar.getDepositAddress({
          payload: {
            fromChain: "Terra",
            toChain: "Avalanche",
            asset: "uusd",
            destinationAddress,
          },
        });
      });

      it("should get response", () => {
        console.log({
          type: "Terra -> avalanche",
          response,
        });
        expect(response).toBeTruthy();
        expect(typeof response).toBe("string");
      });
    });

    // describe("getting deposit address - Avalanche -> Terra", () => {
    //   jest.setTimeout(30000);
    //   let response: string;
    //   const destinationAddress = "terra1qem4njhac8azalrav7shvp06myhqldpmkk3p0t";

    //   beforeAll(async () => {
    //     response = await axelar.getDepositAddress({
    //       payload: {
    //         fromChain: "Avalanche",
    //         toChain: "Terra",
    //         asset: "uusd",
    //         destinationAddress,
    //       },
    //     });
    //   });

    //   it("should get response", () => {
    //     console.log({
    //       type: "avalanche -> terra",
    //       response,
    //     });
    //     expect(response).toBeTruthy();
    //     expect(typeof response).toBe("string");
    //   });
    // });
  });
};
