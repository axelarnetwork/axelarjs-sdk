# AxelarJS SDK

## Overview

The AxelarJS SDK empowers developers to make cross-chain transfers using the Axelar network from their frontend.

### Example use case: asset transfer

AxelarJS enables the transfer of crypto assets across any blockchain supported by Axelar.

Currently supported assets and chains:

| Supported Assets                                                                                             | Supported Blockchain Networks                                                                                             |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| <ul><li>AXL (Axelar native token)</li><li>LUNA (Terra native token)</li><li>UST (Terra stablecoin)</li></ul> | <ul><li>Avalanche</li><li>Axelar</li><li>Ethereum</li><li>Fantom</li><li>Moonbeam</li><li>Polygon</li><li>Terra</li></ul> |

Axelar will continue to add support for new assets and chains in the future.

## Technical overview

The AxelarJS SDK is a `npm` dependency that includes libraries that make requests into the Axelar network.

![Architecture diagram](sdk-diagram.png)

Any request from the JS SDK is routed through a node REST server that redirects requests through a coordinated collection of microservices controlled by Axelar.

These microservices facilitate the relay of cross-chain transactions that run on top of the Axelar network.

## Demo

See AxelarJS in action: [deposit-address-demo](https://github.com/axelarnetwork/deposit-address-demo)

## AxelarJS is under active development

AxelarJS is under active development. The API might change. Please ensure you pull the latest from this repo post issues to Github.

## Security mesures

AxelarJS employs security measures to protect our services from abuse. Currently every invocation of `getDepositAddress` requires frontend users to connect to a Web3 wallet and sign a message with a one-time code. Invocations to the API are also rate limited.

## Contribute

Github issues and pull requests are welcome!

### TODO clarify the following

Run this repo locally:

```bash
git clone git@github.com:axelarnetwork/axelarjs-sdk.git
cd axelarjs-sdk
npm install
npm run build
npm link # link your local repo to your global packages
npm run dev # build the files and watch for changes
```
