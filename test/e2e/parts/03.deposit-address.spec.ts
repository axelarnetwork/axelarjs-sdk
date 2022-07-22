import { Environment, AxelarAssetTransfer } from "../../../src";

export default () => {
  describe("Deposit Address e2e", () => {
    let axelar: AxelarAssetTransfer;

    beforeAll(() => {
      axelar = new AxelarAssetTransfer({
        environment: Environment.TESTNET,
        overwriteResourceUrl: "http://localhost:4000",
      });
    });

    describe("concurrent calls", () => {
      jest.setTimeout(30000);

      it("addresses should be different", async () => {
        const [address1, address2] = await Promise.all([
          axelar.getDepositAddress(
            "osmosis",
            "avalanche",
            "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD",
            "uusdc"
          ),
          axelar.getDepositAddress(
            "avalanche",
            "osmosis",
            "osmo1tck82gz5v5rzc74hmf8j9vyjcs3nnnycr7es2q",
            "uusdc"
          ),
        ]);

        expect(address1).not.toEqual(address2);
      });
    });

    describe("getting deposit address - Terra -> Avalanche", () => {
      jest.setTimeout(30000);
      let response: string;
      const destinationAddress = "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";

      beforeAll(async () => {
        response = await axelar.getDepositAddress("Terra", "Avalanche", destinationAddress, "uusd");
      });

      it("should get response", () => {
        expect(response).toBeTruthy();
        expect(typeof response).toBe("string");
      });
    });

    describe("getting deposit address - Avalanche -> Terra", () => {
      jest.setTimeout(30000);
      let response: string;
      const destinationAddress = "terra1qem4njhac8azalrav7shvp06myhqldpmkk3p0t";

      beforeAll(async () => {
        response = await axelar.getDepositAddress("Avalanche", "Terra", destinationAddress, "uusd");
      });

      it("should get response", () => {
        expect(response).toBeTruthy();
        expect(typeof response).toBe("string");
      });
    });
  });
};
