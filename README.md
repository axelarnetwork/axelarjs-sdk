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
This SDK repo is still in early development, and candidly, Axelar's own webapp has been its only consumer so far. 

***We expect to continue iterating quickly until the ultimate launch, and there are several (potentially breaking) changes in the hopper including
- requirements for API keys/tokens for SDK consumers
- cleanup of typed interface names
- other potential refactoring

Accordingly, please ensure you have the latest and let us know of any issues you encounter using the SDK. 

Either reach out to us directly or file a github issue on the repo.

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
    
    /*set up parmeters here; see sample parameters in `API Usage Details` below for more guidance*/
    const {requestPayload, sourceChainCbs, destinationChainCbs} = getParameters();

    const depositAddress: IAssetInfo, traceId: string;
    
    authenticateWithRecaptcha().then(async (recaptchaToken: string) => {
        
        if (isRecaptchaAuthenticated) {
        
            requestPayload.recaptchaToken = recaptchaToken;
        
            try {
                const res: IAssetInfoWithTrace = await api.transferAssets(
                    requestPayload,
                    {
                    	successCb: sourceChainCbs.successCb, 
                        failCb: sourceChainCbs.failCb
                    },{
                    	successCb: destinationChainCbs.successCb,
		                failCb: destinationChainCbs.failCb
                    }
                );
                depositAddress = res.assetInfo;
	            traceId = res.traceId;
            } catch (e: any) {
            	/*
            	your error handling here, i.e:            	
                reject("transfer asset api error" + e);
            	* */
            }
    
        }
    })

```

Sample recaptcha authentication
```tsx
//authenticateWithRecaptcha.ts

    /*This recaptcha public site key is intentionally made public for you to use
    * For more information on Google Recaptcha V3: https://developers.google.com/recaptcha/docs/v3
    * */
    const RECAPTCHA_SITE_KEY: string = "6LcxwsocAAAAANQ1t72JEcligfeSr7SSq_pDC9vR";
    
    declare const grecaptcha: any;

    const authenticateWithRecaptcha = () => {
        return new Promise((resolve, reject) => {
            grecaptcha.ready(async () => {
                try {
                    const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY);
                    resolve(token);
                } catch (e: any) {
                	/*error handling of failed recaptcha here*/
                }
            });
        });
    }

```
## API Usage Details

The transferAssets method takes three parameters:
1. requestPayload: a complex struct of type `IAssetTransferObject`
2. sourceChainCbs: an object of success(/fail) callbacks invoked on a success(/fail) result while attempting to confirm your deposit from the requestPayload on the source chain
3. destinationChainCbs: an object of success(/fail) callbacks invoked on a success(/fail) result while attempting to confirm your asset on the destination chain

Sample parameters:
```tsx
// getParameters.ts

const getParameters = () => {
	
	let requestPayload: IAssetTransferObject = {
		sourceChainInfo: {
			chainSymbol: "ETH",
			chainName: "Ethereum",
			estimatedWaitTime: 15,
			fullySupported: true,
			assets: [],
			txFeeInPercent: 0.1
		},
		selectedSourceAsset: {
			assetAddress: "NA",
			assetSymbol: "AXL",
			common_key: "uaxl"
		},
		destinationChainInfo: {
			chainSymbol: "MOONBEAM",
			chainName: "Moonbeam",
			estimatedWaitTime: 5,
			fullySupported: true,
			assets: [],
			txFeeInPercent: 0.1
		},
		selectedDestinationAsset: {
			assetAddress: "YOUR_VALID_MOONBEAM_ADDRESS",
			assetSymbol: "AXL", 
			common_key: "uaxl"
		},
		recaptchaToken: null, // null for now, to be populated in authenticateWithRecaptcha's response callback, as shown above  
		transactionTraceId: "YOUR_OWN_UUID" //your own UUID, helpful for tracing purposes
	}
	
	const sourceChainCbs = {
        successCb: (data: any) => console.log("looks like deposit on the source chain was confirmed by Axelar. data=", JSON.stringify(data)),
		failCb: (data: any) => console.log("sad outcome on the source chain, :-( data=", JSON.stringify(data)),
    }
	const destinationChainCbs = {
		successCb: (data: any) => console.log("good outcome on the destination chain! data=", JSON.stringify(data)),
		failCb: (data: any) => console.log("sad outcome on the destination chain, :-( data=", JSON.stringify(data)),
	}
	
	return {requestPayload, sourceChainCbs, destinationChainCbs} as const;
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