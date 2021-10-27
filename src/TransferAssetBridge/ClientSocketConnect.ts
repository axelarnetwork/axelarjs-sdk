import {io}                                   from "socket.io-client";
import {ISocketListenerTypes, ISocketOptions} from "../interface";
import {GREPTCHA_SITE_KEY}                    from "../constants";

/**
 * ClientSocketConnect establishes socket connection between webapp and rest server
 */

declare const grecaptcha: any;

export class ClientSocketConnect {

	private socket: any;
	private resourceUrl: string;

	constructor(resourceUrl: string) {
		this.resourceUrl = resourceUrl;
	}

	public async connect(cb?: any) {

		if (!grecaptcha) {
			console.log("need valid captcha first");
			return;
		}

		let token: any;

		try {
			token = await grecaptcha.execute(GREPTCHA_SITE_KEY);
		} catch (e: any) {
			console.log("cannot get captcha", e);
			return;
		}

		this.socket = io(this.resourceUrl, {
			reconnectionDelayMax: 10000,
			auth: {token},
			query: {
				"my-key": "my-value"
			}
		} as ISocketOptions);

		this.socket.once('connect', (data: any) => {
			cb && cb();
		});

		this.socket.once('disconnect', (data: any) => {
		});
	}

	public emitMessageAndWaitForReply(triggerTopic: ISocketListenerTypes, message: any, waitTopic: ISocketListenerTypes, waitCb: any) {
		return new Promise((resolve, reject) => {
			this.connect(() => {
				this.emitMessage(triggerTopic, message);
				this.awaitResponse(waitTopic, (data: any) => {
					waitCb(data)
					resolve(data);
				});
			})
		});
	}

	public emitMessage(topic: ISocketListenerTypes, message: any): void {
		this.socket?.emit(topic, message);
	}

	public awaitResponse(topic: ISocketListenerTypes, waitCb: any): void {
		this.socket?.on(topic, (data: any) => {
			waitCb && waitCb(data);
			this.disconnect();
		});
	}

	public disconnect() {
		this.socket.disconnect();
	}

}