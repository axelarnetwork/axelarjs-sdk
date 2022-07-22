import { Environment, AxelarAssetTransfer } from "../../../src";

export default () => {
  describe("Deposit Address e2e", () => {
    let axelar: AxelarAssetTransfer;

    describe("getting deposit address - Terra -> Avalanche", () => {
      jest.setTimeout(30000);
      let response: string;
      const destinationAddress = "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";

      beforeAll(async () => {
        axelar = new AxelarAssetTransfer({
          environment: Environment.MAINNET,
          overwriteResourceUrl: "http://localhost:4000",
        });
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
        axelar = new AxelarAssetTransfer({
          environment: Environment.MAINNET,
          overwriteResourceUrl: "http://localhost:4000",
        });
        response = await axelar.getDepositAddress("Avalanche", "Terra", destinationAddress, "uusd");
      });

      it("should get response", () => {
        expect(response).toBeTruthy();
        expect(typeof response).toBe("string");
      });
    });

    describe("getting deposit address concurrency", () => {
      jest.setTimeout(60000);
      const sdk = new AxelarAssetTransfer({ environment: Environment.MAINNET });
      const destinationAddress = "0x1a71552966E3cd8e7D013a86461c60E10b1BEC09";

      it("deposit address should be different", async () => {
        const chains = ["Avalanche", "Ethereum", "Polygon"];

        const requests = [];
        for (const srcChain of chains) {
          for (const destChain of chains) {
            if (srcChain === destChain) continue;
            const request = sdk.getDepositAddress(srcChain, destChain, destinationAddress, "uusdc");
            requests.push(request);
          }
        }

        const responses = await Promise.all(requests);
        console.log(responses);
        const uniqueResponses = new Set(responses);
        expect(uniqueResponses.size).toBe(responses.length);
      });
    });
  });
};
