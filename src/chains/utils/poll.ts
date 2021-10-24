export const poll = ({asyncRequest, validate, interval, maxAttempts}: any) => {

	let attempts = 0;

	const executePoll = async (resolve: any, reject: any) => {

		const asyncResult = await asyncRequest(attempts);

		attempts++;

		switch (true) {
			case validate(asyncResult):
				return resolve(asyncResult);
			case (maxAttempts && attempts === maxAttempts):
				return reject(new Error('Exceeded max attempts'));
			default:
				setTimeout(executePoll, interval, resolve, reject);
		}

	};

	return new Promise(executePoll);

};