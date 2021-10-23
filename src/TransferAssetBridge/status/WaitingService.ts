/**
 * Abstract Class WaitingService.
 *
 * @class WaitingService
 */

export interface IWaitingService {
	wait(...args: any[]): Promise<void>;
}

export class WaitingService implements IWaitingService {

	public numConfirmations: number = 0;
	public depositAddress: string = "";

	public constructor(numConfirmations: number, depositAddress: string) {

		this.setNumConfirmations(numConfirmations);
		this.setDepositAddress(depositAddress);

		if (this.constructor == WaitingService) {
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