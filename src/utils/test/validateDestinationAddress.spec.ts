import { validateDestinationAddress } from "../validateDestinationAddress";

const mock = {
  validateDestinationAddress: validateDestinationAddress,
};

describe("validateDestinationAddress() - evm chain", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(mock, "validateDestinationAddress");
  });

  describe("on correct address", () => {
    const chainSymbol = "AVAX";
    const destinationAddress = "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";
    const environment = "testnet";

    describe("when validateDestinationAddress is called", () => {
      beforeEach(() => {
        mock.validateDestinationAddress(
          chainSymbol,
          destinationAddress,
          environment
        );
      });

      test("then it should be called", () => {
        expect(mock.validateDestinationAddress).toHaveBeenCalledWith(
          chainSymbol,
          destinationAddress,
          environment
        );
      });

      test("then it should return true", () => {
        expect(mock.validateDestinationAddress).toHaveReturnedWith(true);
      });
    });
  });

  describe("on wrong address", () => {
    const chainSymbol = "AVAX";
    const destinationAddress = "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7f";
    const environment = "testnet";

    describe("when validateDestinationAddress is called", () => {
      beforeEach(() => {
        mock.validateDestinationAddress(
          chainSymbol,
          destinationAddress,
          environment
        );
      });

      test("then it should be called", () => {
        expect(mock.validateDestinationAddress).toHaveBeenCalledWith(
          chainSymbol,
          destinationAddress,
          environment
        );
      });

      test("then it should return false", () => {
        expect(mock.validateDestinationAddress).toHaveReturnedWith(false);
      });
    });
  });
});

describe("validateDestinationAddress() - cosmos chain", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(mock, "validateDestinationAddress");
  });

  describe("on correct address", () => {
    const chainSymbol = "Terra";
    const destinationAddress = "terra1qem4njhac8azalrav7shvp06myhqldpmkk3p0t";
    const environment = "testnet";

    describe("when validateDestinationAddress is called", () => {
      beforeEach(() => {
        mock.validateDestinationAddress(
          chainSymbol,
          destinationAddress,
          environment
        );
      });

      test("then it should be called", () => {
        expect(mock.validateDestinationAddress).toHaveBeenCalledWith(
          chainSymbol,
          destinationAddress,
          environment
        );
      });

      test("then it should return true", () => {
        expect(mock.validateDestinationAddress).toHaveReturnedWith(true);
      });
    });
  });

  describe("on wrong address", () => {
    const chainSymbol = "Terra";
    const destinationAddress = "terra1qem4njhac8azalrav7shvp06myhqldpmkk3p0";
    const environment = "testnet";

    describe("when validateDestinationAddress is called", () => {
      beforeEach(() => {
        mock.validateDestinationAddress(
          chainSymbol,
          destinationAddress,
          environment
        );
      });

      test("then it should be called", () => {
        expect(mock.validateDestinationAddress).toHaveBeenCalledWith(
          chainSymbol,
          destinationAddress,
          environment
        );
      });

      test("then it should return false", () => {
        expect(mock.validateDestinationAddress).toHaveReturnedWith(false);
      });
    });
  });
});
