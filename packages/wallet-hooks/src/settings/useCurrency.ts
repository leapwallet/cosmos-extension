import { BigNumber } from 'bignumber.js';
import { useCallback } from 'react';

import { Currency } from '../connectors';
import { usePreferredCurrencyStore } from '../store/usePreferredCurrencyStore';
import { CurrencySymbolsTypes, SupportedCurrencies } from '../types/currencies';

export const currencyDetail: CurrencySymbolsTypes = {
  US: { symbol: '$', currencyPointer: Currency.Usd, ISOname: 'USD', locale: 'en-US' },
  EU: { symbol: '€', currencyPointer: Currency.Eur, ISOname: 'EUR', locale: 'fr-FR' },
  GB: { symbol: '£', currencyPointer: Currency.Gbp, ISOname: 'GBP', locale: 'en-GB' },
  AU: { symbol: 'A$', currencyPointer: Currency.Aud, ISOname: 'AUD', locale: 'en-AU' },
  CN: { symbol: '¥', currencyPointer: Currency.Cny, ISOname: 'CNY', locale: 'zh-Hans' },
  KR: { symbol: '₩', currencyPointer: Currency.Krw, ISOname: 'KRW', locale: 'ko-KR' },
  IN: { symbol: '₹', currencyPointer: Currency.Inr, ISOname: 'INR', locale: 'en-IN' },
  JP: { symbol: '¥', currencyPointer: Currency.Jpy, ISOname: 'JPY', locale: 'ja-JP' },
  PH: { symbol: '₱', currencyPointer: Currency.Php, ISOname: 'PHP', locale: 'fil-PH' },
  ID: { symbol: 'Rp', currencyPointer: Currency.Idr, ISOname: 'IDR', locale: 'id-ID' },
};

export type preferredCurrencySettings = SupportedCurrencies;

/**
 * @function useUserPreferredCurrency
 * @description reads the recoil state and sends the data
 * @returns preferredCurrency - user preferred currency data from the recoil atom
 */
export const useUserPreferredCurrency = () => {
  const { preferredCurrency } = usePreferredCurrencyStore();
  return [preferredCurrency];
};

/**
 * @hook useCurrencyUpdater
 * @description utility hook to change the user preferred currency
 * @returns updatePreferredCurrency - function to update currency preference
 */
// export const useCurrencyUpdater = () => {
//   const [currencyPreference, setCurrencyPreference] = useRecoilState(preferredCurrencyState)
//
//   /**
//    * @function updateChainData
//    * @description function to sort the chain in local storage and recoil atom based on the preference order set
//    * @param currency - the name of the new currency
//    * @returns null
//    */
//   const updatePreferredCurrency = useCallback(
//     (currency: SupportedCurrencies) => {
//       setCurrencyPreference(currency)
//       browser.storage.local.set({ [PREFERRED_CURRENCY]: currency })
//     },
//     [setCurrencyPreference],
//   )
//
//   return [updatePreferredCurrency]
// }

/**
 * @function formatCurrency
 * @description utility function to format the currency based on the user preferred currency
 * @returns formattedCurrency - the formatted currency value
 */
export const useformatCurrency = () => {
  const [preferredCurrency] = useUserPreferredCurrency();

  // * @param currencyValue - the currency value to be formatted
  const currencyFormatter = useCallback(
    (currencyValue: BigNumber, precision = 2) => {
      const formatCurrency = (amount: BigNumber, precision = 2) => {
        return new Intl.NumberFormat(currencyDetail[preferredCurrency].locale, {
          style: 'currency',
          currency: currencyDetail[preferredCurrency].ISOname,
          maximumFractionDigits: precision,
        }).format(amount.toNumber());
      };

      if (isNaN(currencyValue.toNumber())) {
        return '-';
      }

      if (currencyValue.lt(1) && currencyValue.toNumber() !== 0) {
        if (currencyValue.lt(1 / Math.pow(10, precision))) {
          return `<${formatCurrency(new BigNumber(1 / Math.pow(10, precision)), precision)}`;
        }

        return formatCurrency(currencyValue, precision);
      } else {
        return formatCurrency(currencyValue);
      }
    },
    [preferredCurrency],
  );
  return [currencyFormatter];
};
