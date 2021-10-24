import {IBlockchainWaitingService} from "../../interface";

export class BaseWaitingService implements IBlockchainWaitingService {

	public numConfirmations: number = 0;
	public depositAddress: string = "";

	public constructor(numConfirmations: number, depositAddress: string) {

		this.setNumConfirmations(numConfirmations);
		this.setDepositAddress(depositAddress);

		console.log("BaseWaitingService");

		if (this.constructor == BaseWaitingService) {
			throw new Error("abstract class only.");
		}

	}

	public async wait(...args: any[]) {
		throw new Error("Method 'wait()' should be implemented.");
	}

	private setNumConfirmations(numConfirmations: number) {
		this.numConfirmations = numConfirmations;
	}

	private setDepositAddress(depositAddress: string) {
		this.depositAddress = depositAddress;
	}

}