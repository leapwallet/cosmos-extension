import { usePreferredCurrencyStore } from '@leapwallet/cosmos-wallet-hooks'
import { Currency } from '@leapwallet/cosmos-wallet-hooks'
import { BigNumber } from 'bignumber.js'
import { PREFERRED_CURRENCY } from 'config/storage-keys'
import { useCallback, useEffect } from 'react'
import browser from 'webextension-polyfill'

type SupportedCurrencies = 'US' | 'EU' | 'GB' | 'AU' | 'CN' | 'KR' | 'IN' | 'JP'
type SupportedSymbols = '$' | '€' | '£' | 'A$' | '¥' | '₩' | '₹'
type SupportedCurrencyISO = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CNY' | 'KRW' | 'INR' | 'JPY'

interface CurrencyTypes {
  country: SupportedCurrencies
  name: string
}

type CurrencySymbolsTypes = {
  // eslint-disable-next-line no-unused-vars
  [key in SupportedCurrencies]: {
    symbol: SupportedSymbols
    currencyPointer: Currency
    ISOname: SupportedCurrencyISO
    locale: string
  }
}

export const CurrencyMap: CurrencyTypes[] = [
  { country: 'US', name: 'United States Dollar' },
  { country: 'EU', name: 'Euro' },
  { country: 'GB', name: 'British Pound' },
  { country: 'AU', name: 'Australian Dollar' },
  { country: 'CN', name: 'Chinese Yuan' },
  { country: 'KR', name: 'South Korean Won' },
  { country: 'IN', name: 'Indian Rupee' },
  { country: 'JP', name: 'Japanese Yen' },
]

export const currencyDetail: CurrencySymbolsTypes = {
  US: { symbol: '$', currencyPointer: Currency.Usd, ISOname: 'USD', locale: 'en-US' },
  EU: { symbol: '€', currencyPointer: Currency.Eur, ISOname: 'EUR', locale: 'fr-FR' },
  GB: { symbol: '£', currencyPointer: Currency.Gbp, ISOname: 'GBP', locale: 'en-GB' },
  AU: { symbol: 'A$', currencyPointer: Currency.Aud, ISOname: 'AUD', locale: 'en-AU' },
  CN: { symbol: '¥', currencyPointer: Currency.Cny, ISOname: 'CNY', locale: 'zh-Hans' },
  KR: { symbol: '₩', currencyPointer: Currency.Krw, ISOname: 'KRW', locale: 'ko-KR' },
  IN: { symbol: '₹', currencyPointer: Currency.Inr, ISOname: 'INR', locale: 'en-IN' },
  JP: { symbol: '¥', currencyPointer: Currency.Jpy, ISOname: 'JPY', locale: 'ja-JP' },
}

export type preferredCurrencySettings = SupportedCurrencies

/**
 * @function useUserPreferredCurrency
 * @description reads the recoil state and sends the data
 * @returns preferredCurrency - user preferred currency data from the recoil atom
 */
export const useUserPreferredCurrency = () => {
  const { preferredCurrency } = usePreferredCurrencyStore()
  return [preferredCurrency]
}

/**
 * @hook useInitiateCurrencyPreference
 * @description add an object during the initialization of the extension, and if it already exists, update the recoil atom
 * @returns null
 */
export const useInitiateCurrencyPreference = () => {
  const { setPreferredCurrency } = usePreferredCurrencyStore()
  useEffect(() => {
    browser.storage.local.get(PREFERRED_CURRENCY).then((data) => {
      // if the object doesn't exists in the storage, then create a new object
      if (JSON.stringify(data) === '{}') {
        // create an object
        const newPreference = 'US'
        browser.storage.local.set({ [PREFERRED_CURRENCY]: 'US' })

        setPreferredCurrency(newPreference)
      }
      // if the object exists in the storage, then update the recoil state
      else {
        setPreferredCurrency(data[PREFERRED_CURRENCY])
      }
    })
  }, [setPreferredCurrency])
}

/**
 * @hook useCurrencyUpdater
 * @description utility hook to change the user preferred currency
 * @returns updatePreferredCurrency - function to update currency preference
 */
export const useCurrencyUpdater = () => {
  const { setPreferredCurrency } = usePreferredCurrencyStore()

  /**
   * @function updateChainData
   * @description function to sort the chain in local storage and recoil atom based on the preference order set
   * @param currency - the name of the new currency
   * @returns null
   */
  const updatePreferredCurrency = useCallback(
    (currency: SupportedCurrencies) => {
      setPreferredCurrency(currency)
      browser.storage.local.set({ [PREFERRED_CURRENCY]: currency })
    },
    [setPreferredCurrency],
  )

  return [updatePreferredCurrency]
}

/**
 * @function formatCurrency
 * @description utility function to format the currency based on the user preferred currency
 * @returns formattedCurrency - the formatted currency value
 */
export const useFormatCurrency = () => {
  const [preferredCurrency] = useUserPreferredCurrency()

  // * @param currencyValue - the currency value to be formatted
  const currencyFormatter = useCallback(
    (currencyValue: BigNumber, returnNumber: boolean = false, precision = 2) => {
      const formatCurrency = (amount: BigNumber, precision = 2) => {
        return new Intl.NumberFormat(currencyDetail[preferredCurrency].locale, {
          style: 'currency',
          currency: currencyDetail[preferredCurrency].ISOname,
          maximumFractionDigits: precision,
        }).format(amount.toNumber())
      }

      if (isNaN(currencyValue.toNumber())) {
        return '-'
      }

      if (currencyValue.toNumber() === 0) {
        return returnNumber ? formatCurrency(new BigNumber(0.0)) : '-'
      }

      if (currencyValue.lt(1) && currencyValue.toNumber() !== 0) {
        if (currencyValue.lt(1 / Math.pow(10, precision))) {
          return `<${formatCurrency(new BigNumber(1 / Math.pow(10, precision)), precision)}`
        }

        return formatCurrency(currencyValue, precision)
      } else {
        return formatCurrency(currencyValue)
      }
    },
    [preferredCurrency],
  )

  return [currencyFormatter, preferredCurrency] as const
}
