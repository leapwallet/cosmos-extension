import { fromSmall, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Sscrt } from '@leapwallet/cosmos-wallet-sdk/dist/secret/sscrt';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';

import { LeapWalletApi } from '../apis';
import { currencyDetail, useUserPreferredCurrency } from '../settings';
import {
  useActiveChain,
  useAddress,
  useChainApis,
  useChainId,
  useScrtKeysStore,
  useSecretTokenStore,
  useSelectedNetwork,
  useSnipDenomsStore,
} from '../store';
import { Token } from '../types/bank';
import { fetchCurrency, sortTokenBalances } from '../utils';

export function useSnipGetSnip20TokenBalances(sscrtClient?: Sscrt) {
  const { viewingKeys, queryPermits } = useScrtKeysStore();
  const address = useAddress();
  const activeChain = useActiveChain();
  const { denoms: secretTokens } = useSnipDenomsStore();
  const selectedNetwork = useSelectedNetwork();

  const viewingKeyList = Object.entries(viewingKeys[address] ?? {});
  const permit = queryPermits[address];
  const chainId = useChainId();
  const [preferredCurrency] = useUserPreferredCurrency();

  const enabled = (activeChain === 'secret' && selectedNetwork === 'mainnet' && viewingKeyList.length > 0) || !!permit;

  const { lcdUrl = '' } = useChainApis();

  const { data: snip20Tokens, status: snip20TokensStatus } = useQuery(
    ['getSNIP20Balances', viewingKeyList, permit, selectedNetwork],
    async () => {
      const sscrt = sscrtClient ?? Sscrt.create(lcdUrl, chainId ?? '', address);

      async function getBalance(contract: any, balance: any) {
        const denom = secretTokens[contract];

        // some of the tokens that are added from dapps using wallet methods are not available in secretTokens
        // so check either denom or balance is available if not return default value
        if (!denom || !balance.balance) {
          return {
            amount: '0',
            symbol: denom?.symbol,
            percentChange: 0,
            usdValue: '',
            coinMinimalDenom: contract,
            img: denom?.icon,
            ibcDenom: '',
            usdPrice: '0',
            coinDecimals: denom?.decimals,
            invalidKey: true,
          };
        }

        const amount = fromSmall(new BigNumber(balance.balance.amount).toString(), denom.decimals);
        let fiatValue = '';
        let percentChange = 0;
        if (denom.chain && denom.coingeckoId) {
          const _fiatValue = await fetchCurrency(
            amount,
            denom.coingeckoId,
            denom.chain as unknown as SupportedChain,
            currencyDetail[preferredCurrency].currencyPointer,
          );
          if (_fiatValue !== null) {
            fiatValue = _fiatValue ?? '';
          }
        }

        if (denom.coingeckoId && denom.chain) {
          const _percentChange = await LeapWalletApi.operateMarketPercentChanges(
            [denom?.coingeckoId ?? ''],
            denom?.chain as unknown as SupportedChain,
          );

          percentChange = _percentChange[denom.coingeckoId];
        }

        const usdValue = fiatValue;

        const usdPrice = amount ? (Number(usdValue ?? '0') / Number(amount)).toString() : '0';

        return {
          amount,
          symbol: denom?.symbol,
          percentChange,
          usdValue: usdValue,
          coinMinimalDenom: contract,
          img: denom?.icon,
          ibcDenom: '',
          usdPrice,
          coinDecimals: denom?.decimals,
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

  return { snip20TokensStatus, snip20Tokens: sortTokenBalances((snip20Tokens ?? []) as Token[]), enabled };
}
