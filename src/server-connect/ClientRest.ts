import axios from "axios";

export class ClientRest {

	private host: string;

	constructor(host: string) {
		this.host = host;
	}

	public post(endpoint: string, payload: any, headers?: any): Promise<any> {
		return new Promise((resolve, reject) => {
			axios.post(this.host + endpoint, payload)
			.then(resolve)
			.catch(reject);
		});
	}
}