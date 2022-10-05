import { depositAddressSingle } from "./parts/00.deposit-address-single.spec";
import { depositAddressParallel } from "./parts/01.deposit-address.spec";
import { restError } from "./parts/02.rest-error.spec";

describe("Integration Testing", () => {
  depositAddressSingle();
  depositAddressParallel();
  restError();
});
