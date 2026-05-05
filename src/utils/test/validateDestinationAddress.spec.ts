import { Environment } from "../../libs";
import { validateDestinationAddressByChainSymbol } from "../validateDestinationAddress";

const mock = {
  validateDestinationAddressByChainSymbol: validateDestinationAddressByChainSymbol,
};

vitest.mock("../../chains", () => ({
  loadChains: () => {
    return Promise.resolve([
      {
        chainSymbol: "AVAX",
        chainName: "Avalanche",
        estimatedWaitTime: 5,
        fullySupported: true,
        assets: [],
        txFeeInPercent: 0.1,
        module: "evm",
        confirmLevel: 3,
        chainIdentifier: {
          devnet: "avalanche",
          testnet: "avalanche",
          mainnet: "avalanche",
        },
      },
      {
        chainSymbol: "Terra",
        chainName: "Terra",
        estimatedWaitTime: 5,
        fullySupported: true,
        assets: [],
        txFeeInPercent: 0.1,
        module: "axelarnet",
        chainIdentifier: {
          devnet: "terra-2",
          testnet: "terra-2",
          mainnet: "terra-2",
        },
        addressPrefix: "terra",
      },
    ]);
  },
}));

describe("validateDestinationAddress() - evm chain", () => {
  beforeEach(() => {
    vitest.clearAllMocks();
    vitest.spyOn(mock, "validateDestinationAddressByChainSymbol");
  });

  describe("on correct address", () => {
    const chainSymbol = "AVAX";
    const destinationAddress = "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";
    const environment = Environment.TESTNET;

    describe("when validateDestinationAddress is called", () => {
      let validationPromise: Promise<boolean>;

      beforeEach(() => {
        validationPromise = mock.validateDestinationAddressByChainSymbol(
          chainSymbol,
          destinationAddress,
          environment
        ) as Promise<boolean>;
      });

      test("then it should be called", () => {
        expect(mock.validateDestinationAddressByChainSymbol).toHaveBeenCalledWith(
          chainSymbol,
          destinationAddress,
          environment
        );
      });

      test("then it should return true", async () => {
        await expect(validationPromise).resolves.toBe(true);
      });
    });
  });

  describe("on wrong address", () => {
    const chainSymbol = "AVAX";
    const destinationAddress = "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7f";
    const environment = Environment.TESTNET;

    describe("when validateDestinationAddress is called", () => {
      let validationPromise: Promise<boolean>;

      beforeEach(() => {
        validationPromise = mock.validateDestinationAddressByChainSymbol(
          chainSymbol,
          destinationAddress,
          environment
        ) as Promise<boolean>;
      });

      test("then it should be called", () => {
        expect(mock.validateDestinationAddressByChainSymbol).toHaveBeenCalledWith(
          chainSymbol,
          destinationAddress,
          environment
        );
      });

      test("then it should return false", async () => {
        await expect(validationPromise).resolves.toBe(false);
      });
    });
  });
});

describe("validateDestinationAddress() - cosmos chain", () => {
  beforeEach(() => {
    vitest.clearAllMocks();
    vitest.spyOn(mock, "validateDestinationAddressByChainSymbol");
  });

  describe("on correct address", () => {
    const chainSymbol = "Terra";
    const destinationAddress = "terra1qem4njhac8azalrav7shvp06myhqldpmkk3p0t";
    const environment = Environment.TESTNET;

    describe("when validateDestinationAddress is called", () => {
      beforeEach(async () => {
        await mock.validateDestinationAddressByChainSymbol(
          chainSymbol,
          destinationAddress,
          environment
        );
      });

      test("then it should be called", () => {
        expect(mock.validateDestinationAddressByChainSymbol).toHaveBeenCalledWith(
          chainSymbol,
          destinationAddress,
          environment
        );
      });

      test("then it should return true", () => {
        expect.assertions(1);
        return mock
          .validateDestinationAddressByChainSymbol(chainSymbol, destinationAddress, environment)
          .then((data) => expect(data).toEqual(true));
      });
    });
  });

  describe("on wrong address", () => {
    const chainSymbol = "Terra";
    const destinationAddress = "terra1qem4njhac8azalrav7shvp06myhqldpmkk3p0";
    const environment = Environment.TESTNET;

    describe("when validateDestinationAddress is called", () => {
      beforeEach(() => {
        mock.validateDestinationAddressByChainSymbol(chainSymbol, destinationAddress, environment);
      });

      test("then it should be called", () => {
        expect(mock.validateDestinationAddressByChainSymbol).toHaveBeenCalledWith(
          chainSymbol,
          destinationAddress,
          environment
        );
      });

      test("then it should return true", () => {
        expect.assertions(1);
        return mock
          .validateDestinationAddressByChainSymbol(chainSymbol, destinationAddress, environment)
          .then((data) => expect(data).toEqual(false));
      });
    });
  });
});
