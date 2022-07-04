export async function retryRpc(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  retryFunc: () => Promise<any>,
  errorHandler?: (e: any) => void,
  msToRetry = 5000,
  maxRetries = 5,
  count = 0
): Promise<any> {
  try {
    if (count >= maxRetries) return null;
    const response = await retryFunc();
    return response;
  } catch (e) {
    errorHandler && errorHandler(e);
    await wait(msToRetry);
    return retryRpc(retryFunc, errorHandler, msToRetry, maxRetries, count + 1);
  }
}

export function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
