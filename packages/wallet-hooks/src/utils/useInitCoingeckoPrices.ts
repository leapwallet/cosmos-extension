import { useQuery } from '@tanstack/react-query';

import { LeapWalletApi } from '../apis';
import { currencyDetail, useUserPreferredCurrency } from '../settings';
import { useCoingeckoPricesStore } from '../store';

export function useInitCoingeckoPrices() {
  const [preferredCurrency] = useUserPreferredCurrency();
  const selectedCurrency = currencyDetail[preferredCurrency].currencyPointer;
  const { setCoingeckoPrices } = useCoingeckoPricesStore();

  useQuery(
    ['query-init-coingecko-prices', selectedCurrency],
    async function () {
      const { data } = await LeapWalletApi.getEcosystemMarketPrices(selectedCurrency);
      setCoingeckoPrices(data);
    },
    { refetchOnWindowFocus: true },
  );
}
