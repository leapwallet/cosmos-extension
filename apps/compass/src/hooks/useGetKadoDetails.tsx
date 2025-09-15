/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { convertObjInQueryParams } from 'pages/home/utils'
import { getCountryLogo } from 'utils/getCountryLogo'

const BASE_API = 'https://api.kado.money'

type RequestQuoteArgs = {
  transactionType: 'buy' | 'sell'
  fiatMethod: 'card' | 'ach' | 'credit_card'
  partner: string
  amount: number
  currency: string
  asset: string
  blockchain: string
}

type ConversionRateArgs = {
  from: string
  to: string
}

export function useGetKadoChains() {
  return useQuery(
    ['kado-chains'],
    async () => {
      const res = await axios.get(`${BASE_API}/v1/ramp/blockchains`)
      return res?.data?.data?.blockchains?.map((chain: any) => chain.officialId)
    },
    {
      staleTime: 1 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    },
  )
}

export function useGetKadoAssets() {
  return useQuery(
    ['kado-assets'],
    async () => {
      const res = await axios.get(`${BASE_API}/v1/ramp/supported-assets`)
      return res?.data?.data?.assets?.map((chain: any) => chain.symbol)
    },
    {
      staleTime: 1 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    },
  )
}

export function useKadoAssets() {
  return useQuery(
    ['kado-asset-list'],
    async () => {
      const res = await axios.get(`${BASE_API}/v1/ramp/blockchains`)
      const supportedChains = res?.data?.data?.blockchains
      const supportedAssets = supportedChains.reduce((res: any, chain: any) => {
        const assets = [...res]
        chain.associatedAssets.forEach((asset: any) => {
          assets.push({
            ...asset,
            origin: chain.origin,
          })
        })
        return assets
      }, [])
      return supportedAssets
    },
    {
      staleTime: 1 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    },
  )
}

export function useGetKadoCurrencies() {
  return useQuery(
    ['kado-currency-list'],
    async () => {
      const res = await axios.get(`${BASE_API}/v1/ramp/currencies`)
      const kadoCurrencies = res?.data?.data?.currencyData
      const kadoCurrenciesWithLogo = kadoCurrencies.map((currency: any) => ({
        ...currency,
        logo: getCountryLogo(currency.code),
      }))
      return kadoCurrenciesWithLogo
    },
    {
      staleTime: 1 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    },
  )
}

export async function getQuoteKado(args: RequestQuoteArgs) {
  try {
    const queryParams = convertObjInQueryParams(args)
    const result = await axios.get(`${BASE_API}/v2/ramp/quote?${queryParams}`, {
      timeout: 15000,
    })
    return result?.data
  } catch (error) {
    return { data: [], success: false }
  }
}

export async function getConversionRateKado({ from, to }: ConversionRateArgs) {
  const result = await axios.get(`${BASE_API}/v1/ramp/currencyconvert?from=${from}&to=${to}`)
  return result?.data?.data?.conversion
}
