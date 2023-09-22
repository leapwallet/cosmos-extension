import { axiosWrapper, Delegation, DelegationResponse, fromSmall, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';
import { useEffect } from 'react';

import { currencyDetail, useUserPreferredCurrency } from '../settings';
import {
  useActiveChain,
  useAddress,
  useChainApis,
  useDenoms,
  useGetChains,
  useSelectedNetwork,
  useStakeDelegationsStore,
} from '../store';
import { fetchCurrency, formatTokenAmount } from '../utils';

export function useFetchStakeDelegations(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const _activeChain = useActiveChain();
  const activeChain = forceChain ?? _activeChain;

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);
  const address = useAddress();
  const [preferredCurrency] = useUserPreferredCurrency();
  const { setStakeDelegationInfo, setStakeDelegationLoading } = useStakeDelegationsStore();

  const denoms = useDenoms();
  const chainInfos = useGetChains();
  const activeChainInfo = chainInfos[activeChain];

  const fetchStakeDelegations = async () => {
    try {
      setStakeDelegationLoading(true);
      const res = await axiosWrapper({
        baseURL: lcdUrl,
        method: 'get',
        url: '/cosmos/staking/v1beta1/delegations/' + address,
      });
      const denom = denoms[Object.keys(activeChainInfo.nativeDenoms)[0]];

      const denomFiatValue = await fetchCurrency(
        '1',
        denom.coinGeckoId,
        denom.chain as SupportedChain,
        currencyDetail[preferredCurrency].currencyPointer,
      );

      const { delegation_responses } = res.data as DelegationResponse;
      delegation_responses.map(
        (r) => (r.balance.amount = fromSmall(r.balance.amount, denoms[r.balance.denom]?.coinDecimals ?? 6)),
      );

      const rawDelegations: Record<string, Delegation> = delegation_responses.reduce(
        (a, v) => ({ ...a, [v.delegation.validator_address]: v }),
        {},
      );

      const delegations = Object.entries(rawDelegations)
        .filter(([, d]) => new BigNumber(d.balance.amount).gt(0))
        .reduce((formattedDelegations, [validator, d]) => {
          d.balance.currenyAmount = new BigNumber(d.balance.amount).multipliedBy(denomFiatValue ?? '0').toString();
          d.balance.formatted_amount = formatTokenAmount(d.balance.amount, activeChainInfo.denom, 6);
          return { [validator]: d, ...formattedDelegations };
        }, {});

      const tda = Object.values(rawDelegations)
        .reduce((acc, v) => acc.plus(v.balance.amount), new BigNumber(0))
        .toString();
      const totalDelegationAmount = formatTokenAmount(tda, activeChainInfo.denom);
      const currencyAmountDelegation = new BigNumber(tda).multipliedBy(denomFiatValue ?? '0').toString();

      setStakeDelegationInfo({ delegations, totalDelegationAmount, currencyAmountDelegation }, async function () {
        await fetchStakeDelegations();
      });
    } catch (_) {
      setStakeDelegationInfo({}, async function () {
        await fetchStakeDelegations();
      });
    } finally {
      setStakeDelegationLoading(false);
    }
  };

  useEffect(() => {
    if (lcdUrl && address && activeChain && selectedNetwork && Object.keys(denoms).length) {
      setTimeout(fetchStakeDelegations, 0);
    }
  }, [lcdUrl, address, denoms, activeChain, selectedNetwork]);
}
