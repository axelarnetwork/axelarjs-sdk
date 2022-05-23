export function getAmountFromAmountSymbol(amountSymbol: string) {
    if (amountSymbol.indexOf("ibc") > -1) {
      return amountSymbol.split("ibc")[0];
    } else {
      return amountSymbol.replace(/[^0-9]/g, "");
    }
  }