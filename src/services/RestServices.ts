import {v4 as uuidv4}        from 'uuid';
import {AssetTransferObject} from "../interface";

export class RestServices {

	private host: string;

	constructor(host: string) {
		this.host = host;
	}

	public post(endpoint: string, payload: AssetTransferObject, headers?: any): Promise<any> {
		return new Promise((resolve, reject) => {
			const requestOptions = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-traceId': payload.transactionTraceId || uuidv4(),
					'recaptcha-token': payload.recaptchaToken,
					'use-legacy-recaptcha': payload.useLegacyRecaptcha
				},
				body: JSON.stringify(payload)
			};

			this.execRest(endpoint, requestOptions)
			.then((data) => resolve(data))
			.catch((error) => reject(error));
		});
	}

	public get(endpoint: string): Promise<any> {
		return new Promise((resolve, reject) => {
			const requestOptions = {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'x-traceId': uuidv4()
				}
			};
			this.execRest(endpoint, requestOptions)
			.then((data) => resolve(data))
			.catch((error) => reject(error));
		});
	}

	private execRest(endpoint: string, requestOptions: any) {
		return new Promise((resolve, reject) => {
			fetch(this.host + endpoint, requestOptions)
			.then(response => response.json())
			.then(data => {
				if (data?.error) {
					reject(data);
				} else {
					console.log("RestServices response data", data);
					resolve(data);
				}
			})
			.catch(err => {
				reject({
					message: "AxelarJS-SDK uncaught post error",
					uncaught: true,
					fullMessage: err
				});
			})
		});
	}
}