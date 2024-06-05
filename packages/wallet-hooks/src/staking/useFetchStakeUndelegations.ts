import {
  axiosWrapper,
  fromSmall,
  SupportedChain,
  UnbondingDelegation,
  UnbondingDelegationEntry,
  UnbondingDelegationResponse,
} from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { useEffect } from 'react';

import { currencyDetail, useUserPreferredCurrency } from '../settings';
import {
  useActiveChain,
  useAddress,
  useChainApis,
  useChainId,
  useDenoms,
  useGetChains,
  useSelectedNetwork,
  useStakeUndelegationsStore,
} from '../store';
import { Amount } from '../types';
import { fetchCurrency, formatTokenAmount, getPlatformType, useActiveStakingDenom } from '../utils';
import { useIsFeatureExistForChain } from '../utils-hooks';

export function useFetchStakeUndelegations(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const _activeChain = useActiveChain();
  const activeChain = forceChain ?? _activeChain;

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);
  const address = useAddress();
  const [preferredCurrency] = useUserPreferredCurrency();
  const { setStakeUndelegationsInfo, setStakeUndelegationsStatus, setStakeUndelegationsRefetch } =
    useStakeUndelegationsStore();

  const denoms = useDenoms();
  const chainInfos = useGetChains();
  const [activeStakingDenom] = useActiveStakingDenom();
  const activeChainInfo = chainInfos[activeChain];
  const chainId = useChainId(activeChain, selectedNetwork);

  const isStakeComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'stake',
    platform: getPlatformType(),
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
  });

  const isStakeNotSupported = useIsFeatureExistForChain({
    checkForExistenceType: 'notSupported',
    feature: 'stake',
    platform: getPlatformType(),
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
  });

  useEffect(() => {
    let isCancelled = false;

    const fetchStakeUndelegations = async () => {
      try {
        if (isStakeComingSoon || isStakeNotSupported) {
          setTimeout(() => {
            setStakeUndelegationsStatus('success');
            setStakeUndelegationsInfo({});
          }, 0);

          return;
        }
        const res = await axiosWrapper({
          baseURL: lcdUrl,
          method: 'get',
          url:
            (activeChain === 'initia' ? '/initia/mstaking/v1/delegators/' : '/cosmos/staking/v1beta1/delegators/') +
            address +
            '/unbonding_delegations',
        });

        if (isCancelled) return;
        const denom = denoms[Object.keys(activeChainInfo.nativeDenoms)[0]];

        const denomFiatValue = await fetchCurrency(
          '1',
          denom.coinGeckoId,
          denom.chain as SupportedChain,
          currencyDetail[preferredCurrency].currencyPointer,
          `${chainId}-${denom.coinMinimalDenom}`,
        );

        if (isCancelled) return;
        let { unbonding_responses } = res.data as UnbondingDelegationResponse;

        if (activeChain === 'initia') {
          unbonding_responses = unbonding_responses.map((unDelegation: UnbondingDelegation) => {
            const entries = unDelegation.entries.reduce(
              (acc: UnbondingDelegationEntry[], entry: UnbondingDelegationEntry) => {
                const balance = (entry.balance as unknown as Amount[]).find(
                  (balance) => balance.denom === activeStakingDenom.coinMinimalDenom,
                );

                const initialBalance = (entry.initial_balance as unknown as Amount[]).find(
                  (balance) => balance.denom === activeStakingDenom.coinMinimalDenom,
                );

                if (balance && initialBalance) {
                  return [
                    ...acc,
                    {
                      ...entry,
                      balance: balance.amount,
                      initial_balance: initialBalance.amount,
                    },
                  ];
                }

                return acc;
              },
              [],
            );

            return {
              ...unDelegation,
              entries,
            };
          });
        }

        unbonding_responses.map((r) => {
          r.entries.map((e) => {
            e.balance = fromSmall(e.balance, denom?.coinDecimals ?? 6);
            e.initial_balance = fromSmall(e.initial_balance, denom?.coinDecimals ?? 6);
            return e;
          });
          return r;
        });

        const uDelegations: Record<string, UnbondingDelegation> = unbonding_responses.reduce(
          (a, v) => ({ ...a, [v.validator_address]: v }),
          {},
        );

        Object.values(uDelegations).map(async (r) => {
          r.entries.map((e) => {
            e.formattedBalance = formatTokenAmount(e.balance, activeStakingDenom.coinDenom, 6);
            e.currencyBalance = new BigNumber(e.balance).multipliedBy(denomFiatValue ?? '0').toString();
          });
        });

        if (isCancelled) return;
        setStakeUndelegationsInfo(uDelegations);
        setStakeUndelegationsStatus('success');
      } catch (_) {
        if (isCancelled) return;

        setStakeUndelegationsInfo({});
        setStakeUndelegationsStatus('error');
      }
    };

    if (lcdUrl && address && activeChain && selectedNetwork && Object.keys(denoms).length) {
      setTimeout(() => {
        setStakeUndelegationsStatus('loading');
        setStakeUndelegationsInfo({});
        setStakeUndelegationsRefetch(async function () {
          await fetchStakeUndelegations();
        });
        fetchStakeUndelegations();
      }, 0);
    } else {
      setStakeUndelegationsStatus('success');
      setStakeUndelegationsInfo({});
    }

    return () => {
      isCancelled = true;
    };
  }, [
    lcdUrl,
    address,
    preferredCurrency,
    activeStakingDenom,
    denoms,
    activeChain,
    selectedNetwork,
    activeChainInfo,
    isStakeComingSoon,
    isStakeNotSupported,
  ]);
}
