import { SigningStargateClient } from "@cosmjs/stargate";

export const findWorkingRpcUrl = async (rpcUrls: string[]) => {
  for (const url of rpcUrls) {
    try {
      const client = (await Promise.race([
        SigningStargateClient.connect(url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection timed out")), 5000)
        ),
      ])) as SigningStargateClient;
      await client.getHeight(); // Attempt to get the chain height
      return url; // Return the working URL
    } catch (error) {
      console.log(`RPC URL ${url} is not working:`, error);
    }
  }
  throw new Error("No working RPC URL found");
};
