import { xrpToDrops } from "xrpl";

export function parseToken(token: string, amount: string) {
  if (token === "XRP") {
    return xrpToDrops(amount).toString();
  } else {
    const [currency, issuer] = token.split(".");
    return {
      currency,
      issuer,
      value: amount,
    };
  }
}

export function hex(value: string) {
  return Buffer.from(value).toString("hex");
}

export function convertRpcUrltoWssUrl(rpcUrl: string) {
  const url = new URL(rpcUrl);
  url.protocol = "wss:";
  // XRPL testnet HTTP is typically 51234 and WSS is 51233.
  if (url.port === "51234") {
    url.port = "51233";
  }
  return url.toString();
}
