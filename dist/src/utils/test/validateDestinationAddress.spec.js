"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const libs_1 = require("../../libs");
const validateDestinationAddress_1 = require("../validateDestinationAddress");
const mock = {
    validateDestinationAddressByChainSymbol: validateDestinationAddress_1.validateDestinationAddressByChainSymbol,
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
describe.skip("validateDestinationAddress() - evm chain", () => {
    beforeEach(() => {
        vitest.clearAllMocks();
        vitest.spyOn(mock, "validateDestinationAddressByChainSymbol");
    });
    describe("on correct address", () => {
        const chainSymbol = "AVAX";
        const destinationAddress = "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";
        const environment = libs_1.Environment.TESTNET;
        describe("when validateDestinationAddress is called", () => {
            beforeEach(() => {
                mock.validateDestinationAddressByChainSymbol(chainSymbol, destinationAddress, environment);
            });
            test("then it should be called", () => {
                expect(mock.validateDestinationAddressByChainSymbol).toHaveBeenCalledWith(chainSymbol, destinationAddress, environment);
            });
            test("then it should return true", () => {
                expect(mock.validateDestinationAddressByChainSymbol).toHaveReturnedWith(true);
            });
        });
    });
    describe("on wrong address", () => {
        const chainSymbol = "AVAX";
        const destinationAddress = "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7f";
        const environment = libs_1.Environment.TESTNET;
        describe("when validateDestinationAddress is called", () => {
            beforeEach(() => {
                mock.validateDestinationAddressByChainSymbol(chainSymbol, destinationAddress, environment);
            });
            test("then it should be called", () => {
                expect(mock.validateDestinationAddressByChainSymbol).toHaveBeenCalledWith(chainSymbol, destinationAddress, environment);
            });
            test("then it should return false", () => {
                expect(mock.validateDestinationAddressByChainSymbol).toHaveReturnedWith(false);
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
        const environment = libs_1.Environment.TESTNET;
        describe("when validateDestinationAddress is called", () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                yield mock.validateDestinationAddressByChainSymbol(chainSymbol, destinationAddress, environment);
            }));
            test("then it should be called", () => {
                expect(mock.validateDestinationAddressByChainSymbol).toHaveBeenCalledWith(chainSymbol, destinationAddress, environment);
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
        const environment = libs_1.Environment.TESTNET;
        describe("when validateDestinationAddress is called", () => {
            beforeEach(() => {
                mock.validateDestinationAddressByChainSymbol(chainSymbol, destinationAddress, environment);
            });
            test("then it should be called", () => {
                expect(mock.validateDestinationAddressByChainSymbol).toHaveBeenCalledWith(chainSymbol, destinationAddress, environment);
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
//# sourceMappingURL=validateDestinationAddress.spec.js.map