import { Currency } from '@leapwallet/cosmos-wallet-hooks'
import { BigNumber } from 'bignumber.js'
import { useCallback, useEffect } from 'react'
import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import { AppConfig } from '~/config'

export type SupportedCurrencies = 'US' | 'EU' | 'GB' | 'AU' | 'CN' | 'KR' | 'IN' | 'JP'
export type SupportedSymbols = '$' | '€' | '£' | 'A$' | '¥' | '₩' | '₹' | '¥'
export type SupportedCurrencyISO = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CNY' | 'KRW' | 'INR' | 'JPY'

interface CurrencyTypes {
  country: SupportedCurrencies
  name: string
}

type CurrencySymbolsTypes = {
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

export const preferredCurrencyAtom = atom<preferredCurrencySettings>({
  key: 'preferredCurrencyState',
  default: 'US',
})

/**
 * @function useUserPreferredCurrency
 * @description reads the recoil state and sends the data
 * @returns preferredCurrency - user preferred currency data from the recoil atom
 */
export const usePreferredCurrency = () => {
  return useRecoilValue(preferredCurrencyAtom)
}

/**
 * @hook useInitiateCurrencyPreference
 * @description add an object during the initialization of the extension, and if it already exists, update the recoil atom
 * @returns null
 */
export const useInitiateCurrencyPreference = () => {
  const [preferredCurrency, setPreferredCurrency] = useRecoilState(preferredCurrencyAtom)

  useEffect(() => {
    const currency = localStorage.getItem(AppConfig.STORAGE_KEYS.PREFERRED_CURRENCY)
    // if the object doesn't exists in the storage, then create a new object
    if (currency) {
      setPreferredCurrency(currency as SupportedCurrencies)
    } else {
      localStorage.setItem(AppConfig.STORAGE_KEYS.PREFERRED_CURRENCY, preferredCurrency)
    }
    // if the object exists in the storage, then update the recoil state
  }, [preferredCurrency, setPreferredCurrency])
}

/**
 * @hook useCurrencyUpdater
 * @description utility hook to change the user preferred currency
 * @returns updatePreferredCurrency - function to update currency preference
 */
export const useCurrencyUpdater = () => {
  const setCurrencyPreference = useSetRecoilState(preferredCurrencyAtom)

  /**
   * @function updateChainData
   * @description function to sort the chain in local storage and recoil atom based on the preference order set
   * @param currency - the name of the new currency
   * @returns null
   */
  const updatePreferredCurrency = useCallback(
    (currency: SupportedCurrencies) => {
      setCurrencyPreference(currency)
      localStorage.setItem(AppConfig.STORAGE_KEYS.PREFERRED_CURRENCY, currency)
    },
    [setCurrencyPreference],
  )

  return updatePreferredCurrency
}

/**
 * @function formatCurrency
 * @description utility function to format the currency based on the user preferred currency
 * @returns formattedCurrency - the formatted currency value
 */
export const useFormatCurrency = () => {
  const preferredCurrency = usePreferredCurrency()

  // * @param currencyValue - the currency value to be formatted
  const currencyFormatter = useCallback(
    (currencyValue: BigNumber) => {
      const formatCurrency = (amount: BigNumber) => {
        return new Intl.NumberFormat(currencyDetail[preferredCurrency].locale, {
          style: 'currency',
          currency: currencyDetail[preferredCurrency].ISOname,
          maximumFractionDigits: 2,
        }).format(amount.toNumber())
      }
      if (isNaN(currencyValue.toNumber())) {
        return '-'
      }
      if (currencyValue.toNumber() < 0.01 && currencyValue.toNumber() !== 0) {
        return `<${formatCurrency(new BigNumber(0.01))}`
      } else {
        return formatCurrency(currencyValue)
      }
    },
    [preferredCurrency],
  )
  return currencyFormatter
}
