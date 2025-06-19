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

export const enum RaffleStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export type Raffle = {
  id: string
  title: string
  secondaryTitle: string
  description: string | null
  startsAt: string
  endsAt: string
  status: RaffleStatus
  numberOfWinners: number
  ecosystem: string[] | null
  categories: string[] | null
  image: string | null
  createdAt: string
  redirectUrl: string | null
  rewardUnitName: string
}

export type RaffleWin = {
  id: string
  title: string
  secondaryTitle: string | null
  description: string | null
  rewardUnitName: string
  status: string
  startsAt: string
  endsAt: string
  image: string | null
}

interface AlphaResponse {
  records: AlphaOpportunity[]
  page: number
}

interface RaffleResponse {
  raffles: Raffle[]
}

interface RaffleWinResponse {
  raffles: RaffleWin[]
}

const ALPHA_INSIGHTS_API = {
  refetchInterval: 5 * 60 * 1000, // 5 mins
  staleTime: 3 * 60 * 1000, // 3 mins
  retries: 2,
} as const

async function fetchAlphaOpportunities(): Promise<AlphaOpportunity[]> {
  const baseUrl = getLeapapiBaseUrl()
  const endpoint = `${baseUrl}/alpha-insights/collection`
  const { data } = await axios.get<AlphaResponse>(endpoint)
  return data.records
}

async function fetchRaffles(): Promise<Raffle[]> {
  const baseUrl = getLeapapiBaseUrl()
  const endpoint = `${baseUrl}/alpha-insights/raffle/raffles`
  const { data } = await axios.get<RaffleResponse>(endpoint)
  return data.raffles
}

async function fetchRaffleWins(userId: string): Promise<RaffleWin[]> {
  const baseUrl = getLeapapiBaseUrl()
  const endpoint = `${baseUrl}/alpha-insights/raffle/user/${userId}/wins`
  const { data } = await axios.get<RaffleWinResponse>(endpoint)
  return data.raffles
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

export function useRaffles() {
  const {
    data: raffles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['raffles'],
    queryFn: fetchRaffles,
    refetchInterval: ALPHA_INSIGHTS_API.refetchInterval,
    staleTime: ALPHA_INSIGHTS_API.staleTime,
    retry: ALPHA_INSIGHTS_API.retries,
  })

  const filteredRaffles = raffles?.filter((raffle) => raffle.status !== RaffleStatus.CANCELLED)
  return { raffles: filteredRaffles, isLoading, error }
}

const RAFFLE_WINS_API = {
  refetchInterval: 5 * 60 * 1000, // 5 mins
  staleTime: 3 * 60 * 1000, // 3 mins
  retries: 2,
} as const

export function useRaffleWins(userId: string) {
  const {
    data: raffleWins = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['raffle-wins', userId],
    queryFn: () => fetchRaffleWins(userId),
    refetchInterval: RAFFLE_WINS_API.refetchInterval,
    staleTime: RAFFLE_WINS_API.staleTime,
    retry: RAFFLE_WINS_API.retries,
    enabled: !!userId,
  })

  return { raffleWins, isLoading, error }
}

export async function checkEligibility(params: {
  cosmosAddress?: string
  evmAddress?: string
  movementAddress?: string
  btcAddress?: string
}) {
  const baseUrl = getLeapapiBaseUrl()
  const res = await axios.get(`${baseUrl}/alpha-insights/alpha-users/eligibility`, { params })
  return res.data
}

export function useEligibilityCheck(params: {
  cosmosAddress?: string
  evmAddress?: string
  movementAddress?: string
  btcAddress?: string
}) {
  const hasAddresses = !!(
    params.cosmosAddress ||
    params.evmAddress ||
    params.movementAddress ||
    params.btcAddress
  )

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['eligibility-check', params],
    queryFn: () => checkEligibility(params),
    enabled: hasAddresses,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    eligibilityData: data,
    isEligibilityLoading: isLoading,
    eligibilityError: error,
    refetchEligibility: refetch,
  }
}
