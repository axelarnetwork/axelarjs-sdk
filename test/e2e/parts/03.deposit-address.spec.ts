import { TransferAssetBridge } from "../../../src";
import { getDepositPayload } from "../data";

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
        const dto = getDepositPayload(destinationAddress);
        response = await axelar.getDepositAddress({
          payload: dto,
        });
      });

      it("should get response", () => {
        expect(response).toBeTruthy();
        expect(typeof response).toBe("string");
      });
    });
  });
};
