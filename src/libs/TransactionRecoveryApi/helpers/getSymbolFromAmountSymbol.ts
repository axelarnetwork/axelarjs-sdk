export function getSymbolFromAmountSymbol(amountSymbol: string) {
    if (amountSymbol.indexOf("ibc") > -1) {
      return "ibc" + amountSymbol.split("ibc")[1];
    } else {
      return amountSymbol.replace(/[^a-z]/g, "");
    }
  }