export async function retry<T>(fn: () => Promise<T>, maxRetries = 5, delay = 3000): Promise<T> {
  let error: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      error = e;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw error;
}
