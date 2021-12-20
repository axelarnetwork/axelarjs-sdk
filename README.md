# AxelarJS SDK

## Setup

```bash
npm i --save @axelar-network/axelarjs-sdk
```

## Getting Started

```tsx
import {
    IAssetInfoWithTrace,
    IAssetTransferObject,
    ICallbackStatus,
    TransferAssetBridge
} from "@axelar-network/axelarjs-sdk";

export class TransferAssetBridgeFacade {

    private static environment: string;
    private static transferAssetBridge: TransferAssetBridge;

    constructor(environment: string) {
        TransferAssetBridgeFacade.environment = environment;
        TransferAssetBridgeFacade.transferAssetBridge = new TransferAssetBridge(TransferAssetBridgeFacade.environment);
    }

    public static async transferAssets(message: IAssetTransferObject, sourceCbs: ICallbackStatus, destCbs: ICallbackStatus): Promise<IAssetInfoWithTrace> {

        try {
            return TransferAssetBridgeFacade.transferAssetBridge.transferAssets(message, sourceCbs, destCbs, false);
        } catch (e: any) {
            sourceCbs?.failCb();
            throw e;
        }
    }

}
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