import {
  axiosWrapper,
  Delegation,
  DelegationResponse,
  fromSmall,
  SupportedChain,
  SupportedDenoms,
} from '@leapwallet/cosmos-wallet-sdk';
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
  const { setStakeDelegationInfo, setStakeDelegationLoading, setStakeDelegationRefetch } = useStakeDelegationsStore();

  const denoms = useDenoms();
  const chainInfos = useGetChains();
  const activeChainInfo = chainInfos[activeChain];

  const fetchStakeDelegations = async () => {
    try {
      const res = await axiosWrapper({
        baseURL: lcdUrl,
        method: 'get',
        url: '/cosmos/staking/v1beta1/delegations/' + address,
      });
      const { delegation_responses } = res.data as DelegationResponse;
      const denomKey = Object.keys(activeChainInfo.nativeDenoms).find(
        (d) => d === delegation_responses[0].balance.denom,
      );
      const denom = denoms[denomKey as SupportedDenoms];

      const denomFiatValue = await fetchCurrency(
        '1',
        denom?.coinGeckoId,
        denom?.chain as SupportedChain,
        currencyDetail[preferredCurrency].currencyPointer,
      );

      delegation_responses.forEach((delegation) => {
        const _denom = delegation.balance.denom;
        const decimals = denoms[_denom]?.coinDecimals ?? activeChainInfo.nativeDenoms?.[_denom]?.coinDecimals ?? 6;

        delegation.balance.amount = fromSmall(delegation.balance.amount, decimals);
      });

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

      setStakeDelegationInfo({ delegations, totalDelegationAmount, currencyAmountDelegation });
    } catch (_) {
      setStakeDelegationInfo({});
    } finally {
      setStakeDelegationLoading(false);
    }
  };

  useEffect(() => {
    if (
      activeChainInfo?.comingSoonFeatures?.includes('governance') ||
      activeChainInfo?.notSupportedFeatures?.includes('governance')
    ) {
      setTimeout(() => {
        setStakeDelegationLoading(false);
        setStakeDelegationInfo({});
      }, 0);

      return;
    }

    if (lcdUrl && address && activeChain && selectedNetwork && Object.keys(denoms).length) {
      setTimeout(() => {
        setStakeDelegationLoading(true);
        setStakeDelegationInfo({});
        setStakeDelegationRefetch(async function () {
          await fetchStakeDelegations();
        });
        fetchStakeDelegations();
      }, 0);
    }
  }, [lcdUrl, address, denoms, activeChain, selectedNetwork, activeChainInfo]);
}
