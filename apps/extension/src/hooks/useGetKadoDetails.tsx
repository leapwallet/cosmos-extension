/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const BASE_API = 'https://api.kado.money'

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
