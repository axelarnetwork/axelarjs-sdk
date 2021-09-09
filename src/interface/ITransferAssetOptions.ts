export enum TransferAssetTypes {
	BTC_TO_EVM = "/api/link/bitcoin",
	EVM_TO_BTC = "/api/link/bitcoin"
}
export interface ITransferAssetOptions {
	topic: TransferAssetTypes
}