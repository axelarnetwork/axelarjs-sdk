# AxelarJS SDK

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

    public static async transferAssets(payload: IAssetTransferObject, sourceCbs: ICallbackStatus, destCbs: ICallbackStatus): Promise<IAssetInfoWithTrace> {

        try {
            return AxelarJSSDKFacade.axelarJsSDK.transferAssets(payload, sourceCbs, destCbs, false);
        } catch (e: any) {
            sourceCbs?.failCb();
            throw e;
        }
    }

}
```

For instantiation:
```tsx

const environment = "devnet"; /*environment must be one of local | devnet | testnet*/

new AxelarJSSDKFacade(environment);

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