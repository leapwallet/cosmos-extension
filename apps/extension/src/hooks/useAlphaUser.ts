import { getLeapapiBaseUrl } from '@leapwallet/cosmos-wallet-hooks'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { AlphaUser } from 'pages/alpha/types'

export async function getAlphaUserDetails(cosmosAddress: string) {
  const baseUrl = getLeapapiBaseUrl()
  const url = `${baseUrl}/alpha-insights/alpha-users?cosmosAddress=${cosmosAddress}`
  const response = await axios.get<{ user: AlphaUser }>(url)
  const data = response.data.user
  return data
}

export function useAlphaUser(cosmosAddress: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['alpha-user', cosmosAddress],
    queryFn: () => getAlphaUserDetails(cosmosAddress),
    enabled: !!cosmosAddress,
    staleTime: 7 * 60 * 1000, // 7 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  })

  return {
    alphaUser: error ? undefined : data,
    isAlphaUserLoading: isLoading,
    alphaUserError: error,
    refetchAlphaUser: refetch,
  }
}
