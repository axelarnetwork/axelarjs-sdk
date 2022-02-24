import logo from "./axelar-logo-horizontal-white.svg";
import "./App.css";
import { AxelarAPI } from "./AxelarApi";
import { ethers } from "ethers";
import {
  AssetInfo,
  AssetInfoWithTrace,
  AssetTransferObject,
  Chain,
  ChainInfo,
  ChainList,
} from "@axelar-network/axelarjs-sdk";
import { useCallback, useEffect, useState } from "react";

const api = new AxelarAPI("testnet");
const provider = new ethers.providers.Web3Provider(
  (window as any).ethereum,
  "any"
); //2nd param is network type
const signerAuthority = provider.getSigner();

function App() {
  const [depositAddr, setDepositAddr] = useState("");

  useEffect(() => {
    (window as any)?.ethereum?.enable();
  });

  const getNoncedMessageToSign = useCallback(async () => {
    const signerAuthorityAddress = await signerAuthority.getAddress();
    const { validationMsg, otc } = await api.getOneTimeMessageToSign(
      signerAuthorityAddress
    );
    return { validationMsg, otc };
  }, []);

  const promptUserToSignMessage = useCallback(async () => {
    const { validationMsg, otc } = await getNoncedMessageToSign();
    const signature = await signerAuthority.signMessage(validationMsg);
    return {
      otc,
      publicAddr: await signerAuthority.getAddress(),
      signature,
    };
  }, [getNoncedMessageToSign]);

  const getDepositAddress = useCallback(
    async (destinationAddress?: string) => {
      const { otc, publicAddr, signature } = await promptUserToSignMessage();
      const parameters: AssetTransferObject = getParameters(
        destinationAddress || publicAddr
      ); // wherever you specify for the destination address on the destination chain
      parameters.otc = otc;
      parameters.publicAddr = publicAddr;
      parameters.signature = signature;

      const linkAddressInfo: AssetInfoWithTrace = await api.getDepositAddress(
        parameters
      );
      if (linkAddressInfo?.assetInfo?.assetAddress)
        setDepositAddr(linkAddressInfo?.assetInfo?.assetAddress);
    },
    [promptUserToSignMessage]
  );

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div style={{ cursor: `pointer` }} onClick={() => getDepositAddress()}>
          Click here to generate a link address for a transaction to initiate the transfer of AXL testnet tokens from Axelar to Avalanche network.
        </div>
        {depositAddr && (
          <div style={{ fontSize: `0.8em` }}>
            <br />
            <div>ONE TIME DEPOSIT ADDRESS GENERATED: </div>
            <div>{depositAddr}</div>
            <br />
            <div>
              Tell your users they will have to make a deposit of AXL tokens into this
              one-time address.
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

const getParameters = (
  destinationAddress: string,
  sourceChainName: string = "axelar",
  destinationChainName: string = "avalanche",
  asset_common_key: string = "uaxl"
) => {
  /*
	info for sourceChainInfo and destinationChainInfo fetched from the ChainList module. 
	* */
  const chainInfoList: ChainInfo[] = ChainList.map(
    (chain: Chain) => chain.chainInfo
  );
  const terraChain: ChainInfo = chainInfoList.find(
    (chainInfo: ChainInfo) =>
      chainInfo.chainName.toLowerCase() === sourceChainName.toLowerCase()
  ) as ChainInfo;
  const avalancheChain: ChainInfo = chainInfoList.find(
    (chainInfo: ChainInfo) =>
      chainInfo.chainName.toLowerCase() === destinationChainName.toLowerCase()
  ) as ChainInfo;
  const assetObj = terraChain.assets?.find(
    (asset: AssetInfo) => asset.common_key === asset_common_key
  ) as AssetInfo;

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
    transactionTraceId: "YOUR_OWN_UUID", //your own UUID, helpful for tracing purposes. optional.
  };

  return requestPayload;
};

export default App;
