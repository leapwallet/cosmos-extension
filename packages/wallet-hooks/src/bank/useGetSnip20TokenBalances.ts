import { fromSmall, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Sscrt } from '@leapwallet/cosmos-wallet-sdk/dist/browser/secret/sscrt';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useMemo } from 'react';

import { currencyDetail, useUserPreferredCurrency } from '../settings';
import {
  useActiveChain,
  useAddress,
  useChainApis,
  useDenoms,
  useDenomsStore,
  useScrtKeysStore,
  useSelectedNetwork,
  useSnipDenomsStore,
} from '../store';
import { Token } from '../types/bank';
import { fetchCurrency, sortTokenBalances } from '../utils';
import { useChainId } from '../utils-hooks';

export function useSnipGetSnip20TokenBalances(sscrtClient?: Sscrt) {
  const { viewingKeys, queryPermits } = useScrtKeysStore();
  const address = useAddress();
  const activeChain = useActiveChain();
  const { denoms: secretTokens } = useSnipDenomsStore();
  const selectedNetwork = useSelectedNetwork();
  const denoms = useDenoms();
  const { setDenoms } = useDenomsStore();

  const chainId = useChainId();
  const { lcdUrl = '' } = useChainApis();
  const [preferredCurrency] = useUserPreferredCurrency();

  const viewingKeyList = useMemo(() => Object.entries(viewingKeys[address] ?? {}), [viewingKeys[address]]);
  const permit = useMemo(() => queryPermits[address], [queryPermits[address]]);
  const enabled = (activeChain === 'secret' && selectedNetwork === 'mainnet' && viewingKeyList.length > 0) || !!permit;

  const { data: snip20Tokens, status: snip20TokensStatus } = useQuery(
    ['getSNIP20Balances', viewingKeyList, permit, selectedNetwork, chainId, lcdUrl],
    async () => {
      const sscrt = sscrtClient ?? Sscrt.create(lcdUrl, chainId ?? '', address);

      async function getBalance(contract: any, balance: any) {
        const denom = secretTokens[contract];

        if (denom && !denoms[contract]) {
          setDenoms({
            ...denoms,
            [contract]: {
              coinDecimals: denom.decimals ?? 6,
              coinMinimalDenom: contract,
              coinDenom: denom.name,
              chain: denom.chain ?? 'secret',
              coinGeckoId: denom.coingeckoId ?? '',
              icon: denom.icon ?? '',
            },
          });
        }

        // some of the tokens that are added from dapps using wallet methods are not available in secretTokens
        // so check either denom or balance is available if not return default value
        if (!denom || !balance.balance) {
          return {
            chain: denom.chain ?? 'secret',
            name: denom?.name,
            amount: '0',
            symbol: denom?.name,
            usdValue: '',
            coinMinimalDenom: contract,
            img: denom?.icon,
            ibcDenom: '',
            usdPrice: '0',
            coinDecimals: denom?.decimals,
            coinGeckoId: denom?.coingeckoId ?? '',
            invalidKey: true,
          };
        }

        const amount = fromSmall(new BigNumber(balance.balance.amount).toString(), denom.decimals);
        let fiatValue = '';

        if (denom.chain && denom.coingeckoId) {
          const _fiatValue = await fetchCurrency(
            amount,
            denom.coingeckoId,
            denom.chain as unknown as SupportedChain,
            currencyDetail[preferredCurrency].currencyPointer,
            `${chainId}-${contract}`,
          );
          if (_fiatValue !== null) {
            fiatValue = _fiatValue ?? '';
          }
        }

        const usdValue = fiatValue;
        const usdPrice = amount ? (Number(usdValue ?? '0') / Number(amount)).toString() : '0';

        return {
          chain: denom.chain ?? 'secret',
          name: denom?.name,
          amount,
          symbol: denom?.name,
          usdValue: usdValue ?? '',
          coinMinimalDenom: contract,
          img: denom?.icon,
          ibcDenom: '',
          usdPrice,
          coinDecimals: denom?.decimals,
          coinGeckoId: denom?.coingeckoId ?? '',
        };
      }

      const keyBalances =
        viewingKeyList.length > 0
          ? await Promise.all(
              viewingKeyList.map(async ([contract, key]: [contract: string, key: string]) => {
                const balance = await sscrt.getBalance(address, contract, key);
                return await getBalance(contract, balance);
              }),
            )
          : [];

      const contracts = permit?.contracts;
      const permitSignature = permit?.permit;

      const queryPermitBalances =
        contracts?.length > 0
          ? await Promise.all(
              contracts?.map(async (contract: string) => {
                const balance = await sscrt.getBalanceUsingPermit(address, contract, permitSignature);
                return await getBalance(contract, balance);
              }),
            )
          : [];

      return keyBalances.concat(queryPermitBalances);
    },
    {
      enabled,
    },
  );

  const sortedSnip20Tokens = useMemo(() => {
    return sortTokenBalances((snip20Tokens ?? []) as Token[]);
  }, [snip20Tokens]);

  return { snip20TokensStatus, snip20Tokens: sortedSnip20Tokens, enabled };
}
