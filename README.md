# AxelarJS SDK

## Overview

The Axelar JS SDK was created to abstract a set of tools used to make requests into the Axelar Network.

One of our early use cases is a simple transfer of crypto assets across any of our supported chains.

Day 1, this will include:

| All Supported Assets  | All Supported Blockchain Networks |
| ------------- | ------------- |
| <ul><li>Axelar native tokens</li><li>aUST</li><li>LUNA (Terra native tokens)</li><li>UST (Terra stablecoin)</li></ul> | <ul><li>Avalanche</li><li>Axelar</li><li>Ethereum</li><li>Fantom</li><li>Moonbeam</li><li>Polygon</li><li>Terra</li></ul> |

The list will continue to grow, as will the use cases of this SDK. 

Thank you for your support!

## Note
This SDK repo is still in early development, and candidly, Axelar's own webapp has been its only consumer. 

Accordingly, please let us know of any issues you encounter using the SDK. 

## Onboarding process
Initially, we are gatekeeping the rollout of this SDK a bit as we work through some kinks. 

For now, this means that we are whitelisting hosts that can access the APIs and underlying services downstream, 
i.e. it is restricted by both recaptcha validation and cors settings.

So, our proposed process is as follows:
1. Install and integrate the API, as shown in the `Installation` and `Getting Started` steps below.
2. Let us know the hostnames you intend to have access the APIs. We will add that to our list of approved domains.

## Installation

```bash
npm i --save @axelar-network/axelarjs-sdk
```

## Getting Started

You can use something like the following snippets to first set up the library consumer and then to instantiate it

For initial setup:
```tsx
import {
    IAssetInfoWithTrace,
    IAssetTransferObject,
    ICallbackStatus,
    TransferAssetBridge
} from "@axelar-network/axelarjs-sdk";

export class AxelarJSSDKFacade {

    private static environment: string;
    private static axelarJsSDK: TransferAssetBridge;

    constructor(environment: string) {
        AxelarJSSDKFacade.environment = environment;
        AxelarJSSDKFacade.axelarJsSDK = new TransferAssetBridge(AxelarJSSDKFacade.environment);
    }

    public static async transferAssets(
    	payload: IAssetTransferObject, 
        sourceCbs: ICallbackStatus, 
        destCbs: ICallbackStatus
    ): Promise<IAssetInfoWithTrace> {

        try {
            return AxelarJSSDKFacade.axelarJsSDK.transferAssets(payload, sourceCbs, destCbs, false);
        } catch (e: any) {
            sourceCbs?.failCb();
            throw e;
        }
    }

}
```

For instantiation and invocation:
```tsx

const environment: string = "devnet"; /*environment should be one of local | devnet | testnet*/

const api: AxelarJSSDKFacade = new AxelarJSSDKFacade(environment);

const payload, sourceCbs, destCbs;

/*...set up parmeters here; see sample parameters below for more guidance*/

api.transferAssets(payload, sourceCbs, destCbs, true);

```

Sample parameters:
```tsx

```

## Development

If you like, you can get this repo running locally:

First, clone this repo on your machine, navigate to its location in the terminal and run:

```bash
git clone git@github.com:axelarnetwork/axelarjs-sdk.git
npm install
npm run build
npm link # link your local repo to your global packages
npm run dev # build the files and watch for changes
```

**Start coding!** 🎉