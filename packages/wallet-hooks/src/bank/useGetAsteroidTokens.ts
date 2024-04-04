import { fromSmall, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BigNumber } from 'bignumber.js';

import { currencyDetail, useUserPreferredCurrency } from '../settings';
import { useActiveChain, useAddress, useDenoms, useGetChains, useSelectedNetwork } from '../store';
import { SupportedCurrencies, Token } from '../types';
import { balanceCalculator, fetchCurrency, sortTokenBalances } from '../utils';

const LIMIT = 50;

async function fetchTokens(address: string, chainId: string, offset = 0, tokens: any[] = []) {
  const TOKENS_QUERY = `
    {
        token_holder(offset: ${offset}, limit: ${LIMIT}, where: {address: {_eq:"${address}"}, chain_id: {_eq: "${chainId}"}}, order_by: {token_id: asc}) {
            token {
                id
                name
                ticker
                decimals
                content_path
                last_price_base
            }
            amount
        }
    }
    `;

  const {
    data: {
      data: { token_holder },
    },
  } = await axios({
    url: 'https://api.asteroidprotocol.io/v1/graphql',
    method: 'POST',
    data: {
      query: TOKENS_QUERY,
    },
    timeout: 20000,
  });

  tokens = [...tokens, ...token_holder];

  if (token_holder.length === LIMIT) {
    return fetchTokens(address, chainId, tokens.length, tokens);
  }

  return tokens;
}

export function useGetAsteroidTokens(
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
  forceCurrencyPreferred?: SupportedCurrencies,
) {
  const chainInfos = useGetChains();
  const _activeChain = useActiveChain();
  const _selectedNetwork = useSelectedNetwork();
  const denoms = useDenoms();
  const [_preferredCurrency] = useUserPreferredCurrency();

  const activeChain = forceChain || _activeChain;
  const selectedNetwork = forceNetwork || _selectedNetwork;
  const uAtomToken = denoms.uatom;
  const preferredCurrency = forceCurrencyPreferred || _preferredCurrency;

  const address = useAddress(activeChain);
  const chainId =
    selectedNetwork === 'mainnet' ? chainInfos[activeChain]?.chainId : chainInfos[activeChain]?.testnetChainId;

  return useQuery<{ asteroidTokens: Token[]; currencyInFiatValue: BigNumber }>(
    ['query-get-asteroid-tokens', address, chainId, activeChain, uAtomToken, selectedNetwork],
    async function () {
      let asteroidTokens: Token[] = [];
      let currencyInFiatValue = new BigNumber(0);

      try {
        if (address && chainId && activeChain === 'cosmos' && selectedNetwork === 'mainnet') {
          const tokens = await fetchTokens(address, chainId);

          const oneAtomUsdValue = uAtomToken?.coinGeckoId
            ? await fetchCurrency(
                '1',
                uAtomToken.coinGeckoId,
                uAtomToken?.chain as SupportedChain,
                currencyDetail[preferredCurrency].currencyPointer,
                `${chainId}-${uAtomToken?.coinMinimalDenom}`,
              )
            : undefined;

          asteroidTokens = sortTokenBalances(
            tokens.map((token) => {
              const { decimals, id, name, ticker, content_path, last_price_base } = token.token;

              const amount = fromSmall(new BigNumber(token.amount).toString(), decimals);
              const usdValue = oneAtomUsdValue
                ? String((last_price_base / 10 ** uAtomToken.coinDecimals) * parseFloat(oneAtomUsdValue))
                : undefined;
              const usdPrice = '0';

              return {
                chain: '',
                name,
                amount,
                symbol: ticker,
                usdValue,
                coinMinimalDenom: id,
                img: content_path,
                ibcDenom: '',
                usdPrice,
                coinDecimals: decimals,
              };
            }),
          );

          currencyInFiatValue = balanceCalculator(asteroidTokens);
        }

        return { asteroidTokens, currencyInFiatValue };
      } catch (_) {
        return { asteroidTokens, currencyInFiatValue };
      }
    },
    {
      retry: 3,
    },
  );
}
