import { stringSimilarity } from "string-similarity-js";
import { importS3Config, loadChains } from "../chains";
import { Environment } from "../libs";

export async function validateChainIdentifierOld(
  chainIdentifier: string,
  environment: Environment
) {
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

export async function validateChainIdentifier(chainIdentifier: string, environment: Environment) {
  const s3 = await importS3Config(environment);

  if (!s3 || !s3.chains)
    return {
      foundChain: false,
      bestMatch: false,
    };

  const chainIdentifiers = Object.keys(s3.chains);
  const axelarIdentifier = s3["axelar"]?.axelarId || "axelar";
  chainIdentifiers.push(axelarIdentifier);

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

export async function throwIfInvalidChainIds(chains: string[], environment: Environment) {
  const validations = await Promise.all(
    chains.map((chain) => validateChainIdentifier(chain, environment))
  );

  for (let i = 0; i < validations.length; i++) {
    if (!validations[i].foundChain) {
      throw new Error(
        `Invalid chain identifier for ${chains[i]}. Did you mean ${validations[i].bestMatch}?`
      );
    }
  }
}
