import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface CoingeckoChainInfoType {
  id: string
  chain_identifier: number | null
  name: string
  shortname: string
  native_coin_id: string
  image: {
    thumb: string
    small: string
    large: string
  }
}

export type CoingeckoChainInfoResponse = CoingeckoChainInfoType[]

const COINGECKO_API = {
  url: 'https://api.coingecko.com/api/v3/asset_platforms',
  refetchInterval: 30 * 60 * 1000, // 30 mins
  staleTime: 15 * 60 * 1000, // 15 mins
  retries: 2,
} as const

export interface AlphaOpportunity {
  id: string
  additionDate: string
  homepageDescription: string
  ecosystemFilter: string[]
  categoryFilter: string[]
  frequency?: string
  descriptionActions: string
  relevantLinks: string[]
  endDate?: string
  image?: string
}

async function fetchCoingeckoChains(): Promise<CoingeckoChainInfoResponse> {
  const { data } = await axios.get<CoingeckoChainInfoResponse>(COINGECKO_API.url)
  return data
}

export function useCoingeckoChains() {
  const {
    data: chains = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['coingecko-chains'],
    queryFn: fetchCoingeckoChains,
    refetchInterval: COINGECKO_API.refetchInterval,
    staleTime: COINGECKO_API.staleTime,
    retry: COINGECKO_API.retries,
  })

  return { chains, isLoading, error }
}
