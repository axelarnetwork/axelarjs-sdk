import { v4 as uuidv4 } from 'uuid';

export class ClientRest {

	private host: string;

	constructor(host: string) {
		this.host = host;
	}

	public post(endpoint: string, payload: any, headers?: any): Promise<any> {
		return new Promise((resolve, reject) => {
			const requestOptions = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-traceId': payload.transactionTraceId || uuidv4()
				},
				body: JSON.stringify(payload)
			};
			fetch(this.host + endpoint, requestOptions)
				.then(response => response.json())
				.then(data => {
					if (data?.error) {
						reject(data);
					} else {
						console.log("ClientRest response data",data);
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