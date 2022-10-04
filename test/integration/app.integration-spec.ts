import { depositAddressSingle } from "./parts/00.deposit-address-single.spec";
import { depositAddressParallel } from "./parts/01.deposit-address.spec";

describe("Integration Testing", () => {
  depositAddressSingle();
  depositAddressParallel();
});
