export const uuidStub = () => "83462f97-63cf-4205-a659-6f54bec623f6";

export const ethAddressStub = () =>
  "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";

export const terraAddressStub = () =>
  "terra1qem4njhac8azalrav7shvp06myhqldpmkk3p0t";

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
    '{"assetCommonKey":"uusd","destinationAddress":"0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD","destinationChainIdentifier":"avalanche","sourceModule":"axelarnet","type":"link"}',
});

export const depositAddressPayloadStub = () => ({
  fromChain: "terra",
  toChain: "avalanche",
  asset: "uusd",
  publicAddress: ethAddressStub(),
  destinationAddress: ethAddressStub(),
  signature: "0x",
});

export const linkEventStub = () => ({
  Type: "link",
  Attributes: {
    asset: "uusd",
    depositAddress:
      "axelar1ncj6rh3fxzx6pz35gjc6fva534vqmpsx3pwj8s8uyrqrthrch4asgu5l0p",
    destinationAddress: "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD",
    destinationChain: "Avalanche",
    module: "axelarnet",
    sourceChain: "Axelarnet",
  },
  Height: 1502111,
  newRoomId:
    '{"depositAddress":"axelar1ncj6rh3fxzx6pz35gjc6fva534vqmpsx3pwj8s8uyrqrthrch4asgu5l0p","sourceModule":"axelarnet","type":"deposit-confirmation"}',
});

export const newRoomIdStub = () =>
  '{"depositAddress":"axelar1ncj6rh3fxzx6pz35gjc6fva534vqmpsx3pwj8s8uyrqrthrch4asgu5l0p","sourceModule":"axelarnet","type":"deposit-confirmation"}';
