export class ClientRest {

	private host: string;

	constructor(host: string) {
		this.host = host;
	}

	public post(endpoint: string, payload: any, headers?: any): Promise<any> {
		return new Promise((resolve, reject) => {
			const requestOptions = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			};
			fetch(this.host + endpoint, requestOptions)
				.then(response => response.json())
				.then(data => {
					if (data?.error) {
						reject(data);
					} else {
						resolve(data);
					}
				})
				.catch(err => {
					reject(err);
				})
		});
	}
}