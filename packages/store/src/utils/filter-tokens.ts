import { Token } from '../bank/balance-types';

export const filterDuplicateSeiToken = (
  token: Token,
  compassSeiToEvmMapping: Record<string, string>,
  erc20Tokens: Token[],
) => {
  if (token.tokenBalanceOnChain !== 'seiTestnet2') return true;

  let evmContract =
    compassSeiToEvmMapping[token.coinMinimalDenom] ?? compassSeiToEvmMapping[token.coinMinimalDenom.toLowerCase()];
  if (!evmContract && token.ibcDenom) {
    evmContract = compassSeiToEvmMapping[token.ibcDenom] ?? compassSeiToEvmMapping[token.ibcDenom.toLowerCase()];
  }
  if (!evmContract) {
    return true;
  }
  const matchFound = erc20Tokens.find(
    (erc20Token) => erc20Token.coinMinimalDenom?.toLowerCase() === evmContract.toLowerCase(),
  );
  if (matchFound && !matchFound.coinGeckoId) {
    matchFound.coinGeckoId = token.coinGeckoId;
  }
  return !matchFound;
};
