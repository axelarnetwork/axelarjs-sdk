import {AssetAndChainInfo, BlockchainWaitingService, SocketListenerTypes, StatusResponse} from "../../interface";
import {SocketServices}                                                                   from "../../services/SocketServices";

export class BaseWaitingService implements BlockchainWaitingService {

	public numConfirmations: number = 0;
	public depositAddress: string = "";
	public environment: string = "";

	public constructor(numConfirmations: number, depositAddress: string) {

		this.setNumConfirmations(numConfirmations);
		this.setDepositAddress(depositAddress);

		if (this.constructor == BaseWaitingService) {
			throw new Error("abstract class only.");
		}

	}
	public async wait(assetAndChainInfo: AssetAndChainInfo, interimStatusCb: StatusResponse, clientSocketConnect: SocketServices) {

		const data: any = await clientSocketConnect.emitMessageAndWaitForReply(
			SocketListenerTypes.WAIT_FOR_DEPOSIT,
			assetAndChainInfo,
			SocketListenerTypes.DEPOSIT_CONFIRMED,
			((data: any) => {
				data.axelarRequiredNumConfirmations = this.numConfirmations;
				interimStatusCb(data);
			}).bind(this)
		);
		return data;

	}

	public async waitForDepositConfirmation(...args: any[]) {
		throw new Error("Method 'wait()' should be implemented.");
	}

	public async waitForTransferEvent(...args: any[]) {
		throw new Error("Method 'wait()' should be implemented.");
	}

	private setNumConfirmations(numConfirmations: number) {
		this.numConfirmations = numConfirmations;
	}

	private setDepositAddress(depositAddress: string) {
		this.depositAddress = depositAddress;
	}

}