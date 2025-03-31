import { getLeapapiBaseUrl } from '@leapwallet/cosmos-wallet-hooks'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

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
interface AlphaResponse {
  records: AlphaOpportunity[]
  page: number
}

const ALPHA_INSIGHTS_API = {
  refetchInterval: 2 * 60 * 1000, // 2 mins
  staleTime: 60 * 1000, // 1 mins
  retries: 2,
} as const

async function fetchAlphaOpportunities(): Promise<AlphaOpportunity[]> {
  const baseUrl = getLeapapiBaseUrl()
  const endpoint = `${baseUrl}/alpha-insights/collection`
  const { data } = await axios.get<AlphaResponse>(endpoint)
  return data.records
}

export function useAlphaOpportunities() {
  const {
    data: opportunities = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['alpha-opportunities'],
    queryFn: fetchAlphaOpportunities,
    refetchInterval: ALPHA_INSIGHTS_API.refetchInterval,
    staleTime: ALPHA_INSIGHTS_API.staleTime,
    retry: ALPHA_INSIGHTS_API.retries,
  })

  return { opportunities, isLoading, error }
}
