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
