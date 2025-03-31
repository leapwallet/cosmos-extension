/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { convertObjInQueryParams } from 'pages/home/utils'
import { getCountryLogo } from 'utils/getCountryLogo'

const BASE_API = 'https://api.moonpay.com'

type RequestQuoteArgs = {
  apiKey: string
  baseCurrencyCode: string
  baseCurrencyAmount: number
  paymentMethod: string
  symbol: string
}

export function useMoonpayAssets() {
  return useQuery(
    ['moonpay-assets'],
    async () => {
      const res = await axios.get(`${BASE_API}/v3/currencies`)
      return res?.data
        ?.filter((asset: any) => asset?.metadata?.networkCode === 'sei' && asset.type === 'crypto')
        .map((asset: any) => ({
          ...asset,
          symbol: asset.code?.split('_')?.[0]?.toUpperCase(),
          chain: asset.code?.split('_')?.[1],
        }))
    },
    {
      staleTime: 1 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    },
  )
}

export function useGetMoonpayCurrencies() {
  return useQuery(
    ['Moonpay-currency-list'],
    async () => {
      const res = await axios.get(`${BASE_API}/v3/currencies`)
      const moonpayCurrencies = res?.data?.response
      const moonpayCurrenciesWithLogo = moonpayCurrencies
        .filter((item: any) => item.type === 'fiat')
        .map((currency: any) => ({
          ...currency,
          logo: getCountryLogo(currency.code?.toUpperCase()),
        }))
      return moonpayCurrenciesWithLogo
    },
    {
      staleTime: 1 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    },
  )
}

export async function getQuoteMoonpay(args: RequestQuoteArgs) {
  try {
    const queryParams = convertObjInQueryParams(args)
    const result = await axios.get(
      `${BASE_API}/v3/currencies/${args.symbol}_sei/buy_quote?${queryParams}`,
      {
        timeout: 15000,
      },
    )
    return { ...result?.data, success: true }
  } catch (error) {
    return { data: [], success: false }
  }
}
