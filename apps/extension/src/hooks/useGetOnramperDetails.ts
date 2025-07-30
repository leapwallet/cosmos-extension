/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { getCountryLogo } from 'utils/getCountryLogo'

const BASE_API = 'https://api.kado.money'
const ONRAMPER_API = 'https://api.onramper.com'
const SWAPPED_API = 'https://widget.swapped.com/api/v1'

type RequestQuoteArgs = {
  payment_method: string
  fiat_amount: number
  fiat_currency: string
  crypto_currency: string
  network: string
}

type RequestPaymentMethodsArgs = {
  fiat_currency: string
  crypto_currency: string
}

type OnramperDefaults = {
  message: {
    amount: number
    source: string
  }
}

export type PaymentMethod = {
  paymentTypeId: string
  name: string
  icon: string
  details: {
    currencyStatus: string
    limits: {
      aggregatedLimit: {
        min: number
        max: number
      }
    }
  }
}

export type Provider = {
  id: string
  icon: string
  displayName: string
}

export type QuoteDetails = {
  payout?: number
  ramp: string
}

export type ProviderQuote = {
  provider: Provider
  quote: QuoteDetails
}

type ConversionRateArgs = {
  from: string
  to: string
}

export function useOnramperAssets() {
  return useQuery(
    ['onramper-asset-list'],
    async () => {
      const res = await axios.get(`${ONRAMPER_API}/supported?type=buy`, {
        headers: {
          Authorization: process.env.ONRAMPER_API_KEY,
        },
      })
      const cryptoAssets = res?.data?.message?.crypto
      const fiatAssets = Object.values(res?.data?.message?.fiat ?? {}).map((item: any) => {
        return {
          code: item.code,
          name: item.name,
          logo: item?.icon ?? getCountryLogo(item.code),
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

export async function getQuoteOnramper(args: RequestQuoteArgs): Promise<QuoteDetails[]> {
  const result = await axios.get(
    `${ONRAMPER_API}/quotes/${args.fiat_currency}/${args.crypto_currency}?type=buy&amount=${args.fiat_amount}&network=${args.network}&paymentMethod=${args.payment_method}`,
    {
      headers: {
        Authorization: process.env.ONRAMPER_API_KEY,
      },
    },
  )
  return result?.data
}

export async function getPaymentMethodsOnramper(
  args: RequestPaymentMethodsArgs,
): Promise<{ message: PaymentMethod[] }> {
  const result = await axios.get(
    `${ONRAMPER_API}/supported/payment-types/${args.fiat_currency}?type=buy&destination=${args.crypto_currency}`,
    {
      headers: {
        Authorization: process.env.ONRAMPER_API_KEY,
      },
    },
  )
  return result?.data
}

export async function getProvidersOnramper(): Promise<{ message: Provider[] }> {
  const result = await axios.get(`${ONRAMPER_API}/supported/onramps/all`, {
    headers: {
      Authorization: process.env.ONRAMPER_API_KEY,
    },
  })
  return result?.data
}

export async function getConversionRateKado({ from, to }: ConversionRateArgs) {
  const result = await axios.get(`${BASE_API}/v1/ramp/currencyconvert?from=${from}&to=${to}`)
  return result?.data?.data?.conversion
}

export async function getDefaultsOnramper(): Promise<OnramperDefaults> {
  const result = await axios.get(`${ONRAMPER_API}/supported/defaults`, {
    headers: {
      Authorization: process.env.ONRAMPER_API_KEY,
    },
  })
  return result?.data
}
