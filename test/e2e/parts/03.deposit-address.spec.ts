import { TransferAssetBridge } from "../../../src";
// import { getDepositPayload } from "../data";

export default () => {
  describe("Deposit Address e2e", () => {
    let axelar: TransferAssetBridge;
    const destinationAddress = "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";

    beforeAll(() => {
      axelar = new TransferAssetBridge("testnet");
    });

    describe("getting deposit address", () => {
      jest.setTimeout(30000);
      let response: string;

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
        expect(response).toBeTruthy();
        expect(typeof response).toBe("string");
      });
    });
  });
};
