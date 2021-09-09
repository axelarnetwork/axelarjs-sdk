import { io } from "socket.io-client";
import {IEmittedMessageObject} from "../interface/IEmittedMessageObject";
import {TransferAssetTypes} from "../interface";

export class ClientConnect {

	private socket: any;

	constructor(resourceUrl: string) {
		this.connect(resourceUrl);
	}

	public connect(resourceUrl: string) {
		console.log("ClientConnect connecting to socket");
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
			console.log('ClientConnect connected');
		});
	}

	public emitMessage(topic: TransferAssetTypes, message: IEmittedMessageObject): void {
		this.socket.emit(topic, message);
	}

	public disconnect() {
		this.socket.disconnect();
	}

}