import {
  axiosWrapper,
  fromSmall,
  SupportedChain,
  UnbondingDelegation,
  UnbondingDelegationResponse,
} from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { useEffect } from 'react';

import { currencyDetail, useUserPreferredCurrency } from '../settings';
import {
  useActiveChain,
  useAddress,
  useChainApis,
  useDenoms,
  useGetChains,
  useSelectedNetwork,
  useStakeUndelegationsStore,
} from '../store';
import { fetchCurrency, formatTokenAmount } from '../utils';

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
  const activeChainInfo = chainInfos[activeChain];

  const fetchStakeUndelegations = async () => {
    try {
      const res = await axiosWrapper({
        baseURL: lcdUrl,
        method: 'get',
        url: '/cosmos/staking/v1beta1/delegators/' + address + '/unbonding_delegations',
      });
      const denom = denoms[Object.keys(activeChainInfo.nativeDenoms)[0]];

      const denomFiatValue = await fetchCurrency(
        '1',
        denom.coinGeckoId,
        denom.chain as SupportedChain,
        currencyDetail[preferredCurrency].currencyPointer,
      );

      const { unbonding_responses } = res.data as UnbondingDelegationResponse;
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
          e.formattedBalance = formatTokenAmount(e.balance, activeChainInfo.denom, 6);
          e.currencyBalance = new BigNumber(e.balance).multipliedBy(denomFiatValue ?? '0').toString();
        });
      });

      setStakeUndelegationsInfo(uDelegations);
      setStakeUndelegationsStatus('success');
    } catch (_) {
      setStakeUndelegationsInfo({});
      setStakeUndelegationsStatus('error');
    }
  };

  useEffect(() => {
    if (lcdUrl && address && activeChain && selectedNetwork && Object.keys(denoms).length) {
      setTimeout(() => {
        setStakeUndelegationsStatus('loading');
        setStakeUndelegationsInfo({});
        setStakeUndelegationsRefetch(async function () {
          await fetchStakeUndelegations();
        });
        fetchStakeUndelegations();
      }, 0);
    }
  }, [lcdUrl, address, denoms, activeChain, selectedNetwork]);
}
