import { getLeapapiBaseUrl } from '@leapwallet/cosmos-wallet-hooks'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface RaffleEntryResponse {
  hasEntered: boolean
}

async function fetchRaffleEntry(raffleId: string, userId: string): Promise<boolean> {
  const baseUrl = getLeapapiBaseUrl()
  const url = `${baseUrl}/alpha-insights/raffle-entries/raffle/${raffleId}/user/${userId}`
  const { data } = await axios.get<RaffleEntryResponse>(url)
  return data.hasEntered
}

export function useRaffleEntry(raffleId?: string, userId?: string) {
  const {
    data: hasEntered = false,
    isLoading,
    error,
    refetch,
  } = useQuery<boolean, Error>({
    queryKey: ['raffle-entry', raffleId, userId],
    queryFn: () => (raffleId && userId ? fetchRaffleEntry(raffleId, userId) : false),
    staleTime: 0,
    cacheTime: 0,
  })

  return { hasEntered, isLoading, error, refetch }
}
