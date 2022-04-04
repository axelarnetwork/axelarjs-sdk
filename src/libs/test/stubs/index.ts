import { GetDepositAddressPayload } from "../../types";

export const uuidStub = () => "83462f97-63cf-4205-a659-6f54bec623f6";

export const ethAddressStub = () =>
  "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";

export const otcStub = () => ({
  otc: "hr64_XnjNE",
  validationMsg:
    "Verify I'm a real user with this one-time-code: hr64_XnjNE (This will not cost any fees)",
});

export const apiErrorStub = () => ({
  message: "AxelarJS-SDK uncaught post error",
  uncaught: true,
  fullMessage: "",
});

export const roomIdStub = () => ({
  roomId:
    "link-module=axelarnet-destinationAddress=0xd0DbAdE85DC3fB0F2D8D9df8F60E656CDCd63F0F-destinationChain=avalanche",
});

export const depositAddressPayloadStub = (): GetDepositAddressPayload & {
  signature: string;
} => ({
  fromChain: "terra",
  toChain: "avalanche",
  asset: "uusd",
  destinationAddress: ethAddressStub(),
  signature: "0x",
});
