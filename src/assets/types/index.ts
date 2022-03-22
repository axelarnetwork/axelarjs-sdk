export interface AssetInfo {
  assetSymbol?: string;
  assetName?: string;
  assetAddress?: string;
  common_key?: string;
  fullDenomPath?: string;
  fullySupported?: boolean;
  native_chain?: string;
  minDepositAmt?: number;
  decimals?: number;
}

export interface AssetInfoForChain extends AssetInfo {
  minDepositAmt: number;
}

export interface AssetConfig {
  common_key: { [env: string]: string };
  native_chain: string;
  fully_supported: boolean;
  decimals: number;
  chain_aliases: { [key: string]: AssetInfoForChain };
}

export type LoadAssetConfig = {
  environment: string | undefined;
};
