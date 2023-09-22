import { useEffect } from 'react';

import { LeapWalletApi } from '../apis';
import { currencyDetail, useUserPreferredCurrency } from '../settings';
import { useCoingeckoPricesStore } from '../store';

export function useInitCoingeckoPrices() {
  const [preferredCurrency] = useUserPreferredCurrency();
  const selectedCurrency = currencyDetail[preferredCurrency].currencyPointer;
  const { setCoingeckoPrices } = useCoingeckoPricesStore();

  useEffect(() => {
    (async () => {
      const { data } = await LeapWalletApi.getEcosystemMarketPrices(selectedCurrency);
      setCoingeckoPrices(data);
    })();
  }, [selectedCurrency]);
}
