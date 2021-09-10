import { io } from "socket.io-client";
import {IEmittedMessageObject} from "../interface/IEmittedMessageObject";
import {TransferAssetTypes} from "../interface";

export class ClientSocketConnect {

	private socket: any;
	private resourceUrl: string;

	constructor(resourceUrl: string) {
		this.resourceUrl = resourceUrl;
	}

	public connect(cb?: any) {

		console.log("ClientSocketConnect connecting to socket");

		this.socket = io(this.resourceUrl, {
			reconnectionDelayMax: 10000,
			auth: {
				token: "123"
			},
			query: {
				"my-key": "my-value"
			}
		});

		this.socket.once('connect', (data: any) => {
			console.log('ClientSocketConnect connected');
			cb && cb();
		});

		this.socket.once('disconnect', (data: any) => {
			console.log("ClientSocketConnect disconnected");
		});
	}

	public emitMessageAndWaitForReply(triggerTopic: TransferAssetTypes, message: IEmittedMessageObject, waitTopic: string, waitCb: any) {
		this.connect(() => {
			this.emitMessage(triggerTopic, message);
			this.awaitResponse(waitTopic, waitCb);
		})
	}

	public emitMessage(topic: TransferAssetTypes, message: IEmittedMessageObject): void {
		this.socket?.emit(topic, message);
	}

	public awaitResponse(topic: string, waitCb: any): void {

		this.socket?.on(topic, (data: any) => {

			waitCb && waitCb(data);

			// TODO: find better way to indicate done
			if (data === "Done!") {
				this.disconnect();
			}

		});

	}

	public disconnect() {
		this.socket.disconnect();
	}

}