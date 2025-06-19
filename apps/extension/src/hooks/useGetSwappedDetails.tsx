/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { getCountryLogo } from 'utils/getCountryLogo'

const BASE_API = 'https://api.kado.money'
const SWAPPED_API = 'https://widget.swapped.com/api/v1'

type RequestQuoteArgs = {
  payment_method: 'credit-card'
  fiat_amount: number
  fiat_currency: string
  crypto_currency: string
}

type ConversionRateArgs = {
  from: string
  to: string
}

export function useSwappedAssets() {
  return useQuery(
    ['swapped-asset-list'],
    async () => {
      const res = await axios.get(`${SWAPPED_API}/rates/get_rates`)
      const cryptoAssets = res?.data?.data?.crypto
      const fiatAssets = Object.values(res?.data?.data?.fiat ?? {}).map((item: any) => {
        return {
          code: item.iso,
          name: item.name,
          logo: getCountryLogo(item.iso),
        }
      })
      return { cryptoAssets, fiatAssets }
    },
    {
      staleTime: 1 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    },
  )
}

export async function getQuoteSwapped(args: RequestQuoteArgs) {
  const result = await axios.post(`${SWAPPED_API}/merchant/pricing`, args)
  return result?.data
}

export async function getConversionRateKado({ from, to }: ConversionRateArgs) {
  const result = await axios.get(`${BASE_API}/v1/ramp/currencyconvert?from=${from}&to=${to}`)
  return result?.data?.data?.conversion
}
