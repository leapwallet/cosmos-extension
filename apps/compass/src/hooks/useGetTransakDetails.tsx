/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { convertObjInQueryParams } from 'pages/home/utils'
import { getCountryLogo } from 'utils/getCountryLogo'

const BASE_API = 'https://api.transak.com'

type RequestQuoteArgs = {
  partnerApiKey: string
  fiatCurrency: string
  cryptoCurrency: string
  network: string
  isBuyOrSell: string
  paymentMethod: string
  fiatAmount: number
  quoteCountryCode?: string
}

export function useTransakAssets() {
  return useQuery(
    ['transak-assets'],
    async () => {
      const res = await axios.get(`${BASE_API}/api/v2/currencies/crypto-currencies`)
      return res?.data?.response?.filter((asset: any) => asset.network.name === 'sei')
    },
    {
      staleTime: 1 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    },
  )
}

export function useGetTransakCurrencies() {
  return useQuery(
    ['transak-currency-list'],
    async () => {
      const res = await axios.get(`${BASE_API}/api/v2/countries`)
      const transakCurrencies = res?.data?.response
      const transakCurrenciesWithLogo = transakCurrencies.map((currency: any) => ({
        ...currency,
        logo: getCountryLogo(currency.currencyCode),
      }))
      return transakCurrenciesWithLogo
    },
    {
      staleTime: 1 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    },
  )
}

export async function getQuoteTransak(args: RequestQuoteArgs) {
  try {
    const queryParams = convertObjInQueryParams(args)
    const result = await axios.get(`${BASE_API}/api/v1/pricing/public/quotes?${queryParams}`, {
      timeout: 15000,
    })
    return { ...result?.data, success: true }
  } catch (error) {
    return { data: [], success: false }
  }
}
