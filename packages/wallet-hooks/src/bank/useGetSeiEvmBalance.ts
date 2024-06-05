import { fetchSeiEvmBalances, getSeiEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useCallback } from 'react';

import { currencyDetail, useUserPreferredCurrency } from '../settings';
import {
  getCompassSeiEvmConfigStoreSnapshot,
  useActiveChain,
  useActiveWallet,
  useAddress,
  useChainApis,
  useDenoms,
  useSelectedNetwork,
} from '../store';
import { SupportedCurrencies, Token } from '../types';
import { balanceCalculator, fetchCurrency, useGetStorageLayer } from '../utils';
import { SEI_EVM_LINKED_ADDRESS_STATE_KEY } from '../utils-hooks';

export function useGetSeiEvmBalance(
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
  const uSeiToken = denoms.usei;
  const preferredCurrency = forceCurrencyPreferred || _preferredCurrency;

  const { evmJsonRpc } = useChainApis();
  const activeWallet = useActiveWallet();
  const storage = useGetStorageLayer();
  const address = useAddress();

  return useQuery(
    [
      `${activeChain}-${QUERY_SEI_EVM_BALANCE_KEY}`,
      activeChain,
      activeWallet?.pubKeys?.[activeChain],
      activeChain,
      uSeiToken,
      preferredCurrency,
      storage,
      address,
    ],
    async function getSeiEvmBalance() {
      const seiEvmBalance: Token[] = [];
      let currencyInFiatValue = new BigNumber(0);

      try {
        if (evmJsonRpc) {
          const { ARCTIC_CHAIN_KEY, ATLANTIC_CHAIN_KEY } = await getCompassSeiEvmConfigStoreSnapshot();
          const isSeiEvm = [ARCTIC_CHAIN_KEY, ATLANTIC_CHAIN_KEY].includes(activeChain);

          if (isSeiEvm) {
            const fetchSeiEvmBalance = async () => {
              const ethWalletAddress = getSeiEvmAddressToShow(activeWallet?.pubKeys?.[activeChain]);

              if (ethWalletAddress.startsWith('0x')) {
                const balance = await fetchSeiEvmBalances(evmJsonRpc, ethWalletAddress);

                const usdValue =
                  parseFloat(balance.amount) > 0 && uSeiToken.coinGeckoId
                    ? await fetchCurrency(
                        balance.amount,
                        uSeiToken.coinGeckoId,
                        uSeiToken.chain as SupportedChain,
                        currencyDetail[preferredCurrency].currencyPointer,
                      )
                    : undefined;
                const usdPrice =
                  parseFloat(balance.amount) > 0 && usdValue
                    ? (parseFloat(usdValue) / parseFloat(balance.amount)).toString()
                    : '0';

                seiEvmBalance.push({
                  chain: uSeiToken?.chain ?? '',
                  name: uSeiToken?.name,
                  amount: balance.amount,
                  symbol: uSeiToken?.coinDenom,
                  usdValue: usdValue ?? '',
                  coinMinimalDenom: uSeiToken?.coinMinimalDenom,
                  img: uSeiToken?.icon,
                  ibcDenom: '',
                  usdPrice,
                  coinDecimals: uSeiToken?.coinDecimals,
                  coinGeckoId: uSeiToken?.coinGeckoId,
                  isEvm: true,
                });
              }
            };

            const storedLinkedAddressState = await storage.get(SEI_EVM_LINKED_ADDRESS_STATE_KEY);
            if (storedLinkedAddressState) {
              const linkedAddressState = JSON.parse(storedLinkedAddressState);

              if (linkedAddressState[address]?.[activeChain]?.[selectedNetwork] !== 'done') {
                await fetchSeiEvmBalance();
              }
            } else {
              await fetchSeiEvmBalance();
            }
          }
        }

        currencyInFiatValue = balanceCalculator(seiEvmBalance);
        return { seiEvmBalance, currencyInFiatValue };
      } catch (error) {
        return { seiEvmBalance, currencyInFiatValue };
      }
    },
  );
}

const QUERY_SEI_EVM_BALANCE_KEY = 'query-get-sei-evm-balance';

export function useInvalidateSeiEvmBalance() {
  const queryClient = useQueryClient();

  return useCallback(
    (activeChain: SupportedChain) => {
      queryClient.invalidateQueries([`${activeChain}-${QUERY_SEI_EVM_BALANCE_KEY}`]);
    },
    [queryClient],
  );
}
