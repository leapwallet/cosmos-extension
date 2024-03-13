import { useQuery } from '@tanstack/react-query';

import { LeapWalletApi } from '../apis';
import { Currency } from '../connectors';
import { currencyDetail, useUserPreferredCurrency } from '../settings';
import { getCoingeckoPricesStoreSnapshot, useCoingeckoPricesStore } from '../store';

export function useInitCoingeckoPrices() {
  const [preferredCurrency] = useUserPreferredCurrency();
  const selectedCurrency = currencyDetail[preferredCurrency].currencyPointer;
  const { setCoingeckoPrices } = useCoingeckoPricesStore();

  useQuery(
    ['query-init-coingecko-prices', selectedCurrency],
    async function () {
      const coingeckoPrices = await getCoingeckoPricesStoreSnapshot();

      if (Object.keys(coingeckoPrices).length && coingeckoPrices[selectedCurrency]) {
        let newCoingeckoPrices = { ...coingeckoPrices };

        for (const currency in coingeckoPrices) {
          if (currency !== selectedCurrency && currency !== Currency.Usd) continue;
          const { data } = await LeapWalletApi.getEcosystemMarketPrices(currency as Currency);
          newCoingeckoPrices = { ...newCoingeckoPrices, [currency]: data };
        }

        setCoingeckoPrices(newCoingeckoPrices);
      } else {
        const { data } = await LeapWalletApi.getEcosystemMarketPrices(selectedCurrency);
        setCoingeckoPrices({ ...coingeckoPrices, [selectedCurrency]: data });
      }
    },
    { refetchOnWindowFocus: true },
  );
}
