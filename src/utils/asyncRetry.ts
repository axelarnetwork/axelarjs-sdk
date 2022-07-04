import { sleep } from "./sleep";

export async function asyncRetry(
  retryFunc: () => Promise<any>,
  retryConditionMet: (response: any) => boolean,
  errorHandler?: (e: Error, retryCount: number) => void,
  secondsToRetry = 5,
  maxRetries = 2,
  count = 0
): Promise<any> {
  const retry = async () => {
    await sleep(secondsToRetry);
    return await asyncRetry(
      retryFunc,
      retryConditionMet,
      errorHandler,
      secondsToRetry,
      maxRetries,
      count + 1
    );
  };
  try {
    if (count >= maxRetries) return null;
    const response = await retryFunc();
    if (!retryConditionMet(response)) return await retry();
    return response;
  } catch (e) {
    errorHandler && errorHandler(e as Error, count);
    return await retry();
  }
}
