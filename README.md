# AxelarJS SDK

## Overview

The Axelar JS SDK was created to abstract a set of tools used to make requests into the Axelar Network from a frontend.

One of our early use cases is a simple transfer of crypto assets across any of our supported chains.

Day 1, this will include:

| Supported Assets  | Supported Blockchain Networks |
| ------------- | ------------- |
| <ul><li>Axelar native tokens</li><li>LUNA (Terra native tokens)</li><li>UST (Terra stablecoin)</li></ul> | <ul><li>Avalanche</li><li>Axelar</li><li>Ethereum</li><li>Fantom</li><li>Moonbeam</li><li>Polygon</li><li>Terra</li></ul> |

The list will continue to grow, as will the use cases of this SDK. 

Thank you for your support!

## Technical Overview

The Axelar JS SDK is an npm dependency that includes libraries that make requests into the Axelar Network. 

- Any request from the JS SDK is routed through a node rest server that redirects requests through a coordinated 
collection of microservices controlled by Axelar.
- These microservices facilitate the relay of cross-chain transactions that run on top of the Axelar Network.
- See diagram below.

![Architecture diagram](sdk-diagram.png)


## Note
This SDK repo is still in early development, and candidly, Axelar's own webapp has been its only consumer so far. 

***We expect to continue iterating quickly until the ultimate launch, and there are several (potentially breaking) 
changes in the hopper including
- requirements for API keys/tokens for SDK consumers
- other potential refactoring

Accordingly, please ensure you have the latest and let us know of any issues you encounter using the SDK. 

Either reach out to us directly or file a github issue on the repo.

## User Access Restrictions

Users of this API will notice that there is an explicit requirement for frontend users to connect to a Web3 wallet and sign a message with a one-time code with every invocation of getDepositAddress. Invocations to the API are also rate limited.
This is by design and part of a growing list of security measures we have in place to protect our services. 

For API/SDK users, we will eventually implement an API-key mechanism.

## Onboarding process
Initially, we are gatekeeping the rollout of this SDK a bit as we work through some kinks. 

For now, this means that we are whitelisting hosts that can access the APIs and underlying services downstream, 
i.e. it is restricted by both cryptographic signing and cors settings.

So, our proposed process is as follows:
1. Install and integrate the API, as shown in the `Installation` and `Getting Started` steps below.
2. Let us know the hostnames you intend to have access the APIs. We will add that to our list of approved domains. 
Note: API access will shortly be restricted by API keys

## Installation

```bash
npm i --save @axelar-network/axelarjs-sdk
```

For the time being, the repo is a private repository that can only be accessed with an NPM token. 

** Set your `.npmrc` file accordingly and secure your NPM TOKEN safely! (i.e. in secrets injected directly into your environment variables)

```bash
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

## Getting Started

After installation, you can use something like the following snippets to first set up the library consumer and then to instantiate it

For initial setup:
```tsx
import {
    AssetInfoWithTrace,
    AssetTransferObject,
    CallbackStatus,
    TransferAssetBridge
} from "@axelar-network/axelarjs-sdk";

export class AxelarAPI {

    private environment: string;
    private axelarJsSDK: TransferAssetBridge;

    constructor(environment: string) {
        this.environment = environment;
        this.axelarJsSDK = new TransferAssetBridge(environment);
    }

	public async getOneTimeMessageToSign(sigerAddress: string): Promise<{validationMsg: string; otc: string;}> {

		try {
			return await this.axelarJsSDK.getOneTimeCode(sigerAddress);
		} catch (e: any) {
			throw e;
		}

	}

    public async getDepositAddress(payload: AssetTransferObject, showAlerts: boolean = true): Promise<AssetInfoWithTrace> {

        try {
            return this.axelarJsSDK.getDepositAddress(payload, showAlerts);
        } catch (e: any) {
            throw e;
        }
        
    }

}
```

For instantiation and invocation:
```tsx

    const environment: string = "testnet"; /*environment should be one of local | devnet | testnet | mainnet*/
    
    const api: AxelarAPI = new AxelarAPI(environment);

    /*below is sample implementation using ethers.js, but you can use whatever you want*/
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any"); //2nd param is network type
    const signerAuthority = provider.getSigner();
    const signerAuthorityAddress = signerAuthority.getAddress();

    const getNoncedMessageToSign = async () => {
	    const signerAuthorityAddress = await signerAuthority.getAddress();
	    const {validationMsg, otc} = await api.getOneTimeMessageToSign(signerAuthorityAddress);
	    return {validationMsg, otc};
    }

    const promptUserToSignMessage = async () => {
	    const {validationMsg, otc} = await getNoncedMessageToSign();
	    const signature = await signerAuthority.signMessage(validationMsg);

	    return {
		    otc,
		    publicAddr: await signerAuthority.getAddress(),
		    signature};
    }

    const getDepositAddress = async (destinationAddress?: string) => {
	    const {otc, publicAddr, signature} = await promptUserToSignMessage();
	    const parameters: AssetTransferObject = getParameters(destinationAddress || publicAddr); // wherever you specify for the destination address on the destination chain
	    parameters.otc = otc;
	    parameters.publicAddr = publicAddr;
	    parameters.signature = signature;

	    const linkAddress = await api.getDepositAddress(parameters);
    }
    

```

## API Usage Details

The getDepositAddress method takes the following parameters:
1. requestPayload: a complex struct of type `AssetTransferObject`
2. optional parameter on whether you want error alerts to show on the UI or not

Sample parameters:
```tsx
// getParameters.ts

const getParameters = (destinationAddress: string, sourceChainName: string = "terra", destinationChainName: string = "avalanche", asset_common_key: string = "uusd") => {

	/*
	info for sourceChainInfo and destinationChainInfo fetched from the ChainList module. 
	* */
	const terraChain: ChainInfo = ChainList.map((chain: Chain) => chain.chainInfo).find((chainInfo: ChainInfo) => chainInfo.chainName.toLowerCase() === sourceChainName.toLowerCase()) as ChainInfo;
	const avalancheChain: ChainInfo = ChainList.map((chain: Chain) => chain.chainInfo).find((chainInfo: ChainInfo) => chainInfo.chainName.toLowerCase() === destinationChainName.toLowerCase()) as ChainInfo;
	const assetObj = terraChain.assets?.find((asset: AssetInfo) => asset.common_key === asset_common_key) as AssetInfo;

	let requestPayload: AssetTransferObject = {
		sourceChainInfo: terraChain,
		destinationChainInfo: avalancheChain,
		selectedSourceAsset: assetObj,
		selectedDestinationAsset: {
			...assetObj,
			assetAddress: destinationAddress, //address on the destination chain where you want the tokens to arrive
		},
		signature: "SIGNATURE_FROM_METAMASK_SIGN",
		otc: "OTC_RECEIVED_FROM_SERVER",
		publicAddr: "SIGNER_OF_SIGNATURE",
		transactionTraceId: "YOUR_OWN_UUID" //your own UUID, helpful for tracing purposes. optional.
	}

	return requestPayload;
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

For issues, file a github issue or feel free to put forward a pull request with a fix/enhancement. 