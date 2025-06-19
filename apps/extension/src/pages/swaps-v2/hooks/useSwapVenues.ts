import {
  cachedRemoteDataWithLastModified,
  storage,
  useGetStorageLayer,
} from '@leapwallet/cosmos-wallet-hooks'
import { SwapVenue } from '@leapwallet/elements-core'
import { useQuery } from '@tanstack/react-query'

const SWAP_VENUES_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/config/swap-venues.json'
const SWAP_VENUES_STORAGE_KEY = 'swap-venues'

export async function getSwapVenues(storage: storage): Promise<Array<SwapVenue>> {
  try {
    const res = await cachedRemoteDataWithLastModified<{
      compass: Array<SwapVenue>
      extension: Array<SwapVenue>
    }>({
      remoteUrl: SWAP_VENUES_URL,
      storageKey: SWAP_VENUES_STORAGE_KEY,
      storage,
    })
    return res['extension']
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error fetching swap venues', (e as Error)?.message ?? e)
    return []
  }
}

export function useSwapVenues() {
  const storage = useGetStorageLayer()

  return useQuery<Array<SwapVenue>>(['query-leap-swap-venues'], () => getSwapVenues(storage), {
    retry: 2,
    cacheTime: 1000 * 10, // 10 seconds
    staleTime: 0,
  })
}
