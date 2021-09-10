import { io } from "socket.io-client";
import {IEmittedMessageObject} from "../interface/IEmittedMessageObject";
import {TransferAssetTypes} from "../interface";

export class ClientSocketConnect {

	private socket: any;

	constructor(resourceUrl: string) {
		this.connect(resourceUrl);
	}

	public connect(resourceUrl: string) {
		console.log("ClientSocketConnect connecting to socket");
		this.socket = io(resourceUrl, {
			reconnectionDelayMax: 10000,
			auth: {
				token: "123"
			},
			query: {
				"my-key": "my-value"
			}
		});

		this.socket.on('connect', (data: any) => {
			console.log('ClientSocketConnect connected',this.socket?.id);
		});
	}

	public emitMessage(topic: TransferAssetTypes, message: IEmittedMessageObject): void {
		this.socket.emit(topic, message);
	}

	public disconnect() {
		this.socket.disconnect();
	}

	public awaitResponse(topic: string): void {
		this.socket.on(topic, (data: any) => console.log(data));
		// return new Promise((res, rej) => {
		// 	this.socket.on(topic, (data: any) => res(data));
		// });
	}

}