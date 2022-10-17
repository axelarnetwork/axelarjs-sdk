import { stringSimilarity } from "string-similarity-js";
import { loadChains } from "../chains";
import { Environment } from "../libs";

export async function validateChainIdentifier(chainIdentifier: string, environment: Environment) {
  const chains = await loadChains({
    environment,
  });
  const chainIdentifiers = chains.map((chain) => chain.chainIdentifier[environment]);

  const foundChain = chainIdentifiers.find(
    (identifier: string) => identifier === chainIdentifier.toLowerCase()
  );

  return {
    foundChain: !!foundChain,
    bestMatch: foundChain ? false : findSimilarInArray(chainIdentifiers, chainIdentifier),
  };
}

function findSimilarInArray(array: Array<string>, wordsToFind: string) {
  let bestMatch = array[0];
  let bestScore = 0;

  for (const i in array) {
    const score = stringSimilarity(array[i], wordsToFind);
    if (score >= bestScore) {
      bestScore = score;
      bestMatch = array[i];
    }
  }

  return bestMatch;
}
