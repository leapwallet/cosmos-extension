import {
  denoms as DefaultDenoms,
  fetchSeiEvmBalances,
  pubKeyToEvmAddressToShow,
  SupportedChain,
  SupportedDenoms,
} from '@leapwallet/cosmos-wallet-sdk';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useCallback, useMemo } from 'react';

import { currencyDetail, useUserPreferredCurrency } from '../settings';
import {
  useActiveChain,
  useActiveWallet,
  useAddress,
  useChainApis,
  useDenoms,
  useIsCompassWallet,
  useSelectedNetwork,
} from '../store';
import { SupportedCurrencies, Token } from '../types';
import { balanceCalculator, fetchCurrency, useGetStorageLayer } from '../utils';
import { SEI_EVM_LINKED_ADDRESS_STATE_KEY, useChainInfo, useIsSeiEvmChain } from '../utils-hooks';

export function useGetEvmBalance(
  forceChain?: SupportedChain,
  forceCurrencyPreferred?: SupportedCurrencies,
  forceNetwork?: 'mainnet' | 'testnet',
) {
  const _activeChain = useActiveChain();
  const denoms = useDenoms();
  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = forceNetwork || _selectedNetwork;
  const [_preferredCurrency] = useUserPreferredCurrency();

  const activeChain = forceChain || _activeChain;
  const preferredCurrency = forceCurrencyPreferred || _preferredCurrency;

  const { evmJsonRpc } = useChainApis();
  const activeWallet = useActiveWallet();
  const storage = useGetStorageLayer();
  const address = useAddress();
  const isCompassWallet = useIsCompassWallet();
  const isSeiEvmChain = useIsSeiEvmChain();
  const activeChainInfo = useChainInfo(activeChain);

  const nativeToken = useMemo(() => {
    const _nativeTokenKey = Object.keys(activeChainInfo?.nativeDenoms ?? {})?.[0];

    return denoms[_nativeTokenKey] ?? DefaultDenoms[_nativeTokenKey as SupportedDenoms];
  }, [activeChainInfo?.nativeDenoms]);

  return useQuery(
    [
      `${activeChain}-${QUERY_EVM_BALANCE_KEY}`,
      activeChain,
      activeWallet?.pubKeys?.[activeChain],
      activeChain,
      nativeToken,
      preferredCurrency,
      storage,
      address,
    ],
    async function getSeiEvmBalance() {
      const evmBalance: Token[] = [];
      let currencyInFiatValue = new BigNumber(0);

      try {
        if (isSeiEvmChain || activeChainInfo?.evmOnlyChain) {
          if (evmJsonRpc) {
            const fetchSeiEvmBalance = async () => {
              const ethWalletAddress = pubKeyToEvmAddressToShow(activeWallet?.pubKeys?.[activeChain]);

              if (ethWalletAddress.startsWith('0x')) {
                const balance = await fetchSeiEvmBalances(evmJsonRpc, ethWalletAddress);

                const usdValue =
                  parseFloat(balance.amount) > 0 && nativeToken.coinGeckoId
                    ? await fetchCurrency(
                        balance.amount,
                        nativeToken.coinGeckoId,
                        nativeToken.chain as SupportedChain,
                        currencyDetail[preferredCurrency].currencyPointer,
                      )
                    : undefined;
                const usdPrice =
                  parseFloat(balance.amount) > 0 && usdValue
                    ? (parseFloat(usdValue) / parseFloat(balance.amount)).toString()
                    : '0';

                evmBalance.push({
                  chain: nativeToken?.chain ?? '',
                  name: nativeToken?.name,
                  amount: balance.amount,
                  symbol: nativeToken?.coinDenom,
                  usdValue: usdValue ?? '',
                  coinMinimalDenom: nativeToken?.coinMinimalDenom,
                  img: nativeToken?.icon,
                  ibcDenom: '',
                  usdPrice,
                  coinDecimals: nativeToken?.coinDecimals,
                  coinGeckoId: nativeToken?.coinGeckoId,
                  isEvm: true,
                });
              }
            };

            const storedLinkedAddressState = await storage.get(SEI_EVM_LINKED_ADDRESS_STATE_KEY);
            if (isCompassWallet && storedLinkedAddressState) {
              const linkedAddressState = JSON.parse(storedLinkedAddressState);

              if (linkedAddressState[address]?.[activeChain]?.[selectedNetwork] !== 'done') {
                await fetchSeiEvmBalance();
              }
            } else {
              await fetchSeiEvmBalance();
            }
          }
        }

        currencyInFiatValue = balanceCalculator(evmBalance);
        return { evmBalance, currencyInFiatValue };
      } catch (error) {
        return { evmBalance, currencyInFiatValue };
      }
    },
  );
}

const QUERY_EVM_BALANCE_KEY = 'query-get-evm-balance';

export function useInvalidateSeiEvmBalance() {
  const queryClient = useQueryClient();

  return useCallback(
    (activeChain: SupportedChain) => {
      queryClient.invalidateQueries([`${activeChain}-${QUERY_EVM_BALANCE_KEY}`]);
    },
    [queryClient],
  );
}
