# AxelarJS SDk

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

scripts:
build: tsc to compile our code
prepare: this is a NPM hook which executes a command before publishing to npm ( we tell it the execute the build command above )