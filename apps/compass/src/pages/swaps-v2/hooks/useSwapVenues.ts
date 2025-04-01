import {
  cachedRemoteDataWithLastModified,
  storage,
  useGetStorageLayer,
} from '@leapwallet/cosmos-wallet-hooks'
import { SwapVenue } from '@leapwallet/elements-core'
import { useQuery } from '@tanstack/react-query'
import { isCompassWallet } from 'utils/isCompassWallet'

const SWAP_VENUES_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/config/swap-venues.json'
const SWAP_VENUES_STORAGE_KEY = 'swap-venues'
const SEI_ASTROPORT_SWAP_VENUE: SwapVenue = {
  chain_id: 'pacific-1',
  name: 'sei-astroport',
  logo_uri: '',
}

export async function getSwapVenues(
  storage: storage,
  isCompassWallet: boolean,
): Promise<Array<SwapVenue>> {
  try {
    const res = await cachedRemoteDataWithLastModified<{
      compass: Array<SwapVenue>
      extension: Array<SwapVenue>
    }>({
      remoteUrl: SWAP_VENUES_URL,
      storageKey: SWAP_VENUES_STORAGE_KEY,
      storage,
    })
    return isCompassWallet ? res['compass'] : res['extension']
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error fetching swap venues', (e as Error)?.message ?? e)
    return isCompassWallet ? [SEI_ASTROPORT_SWAP_VENUE] : []
  }
}

export function useSwapVenues() {
  const storage = useGetStorageLayer()

  return useQuery<Array<SwapVenue>>(
    [`query-${isCompassWallet() ? 'compass' : 'leap'}-swap-venues`],
    () => getSwapVenues(storage, isCompassWallet()),
    {
      retry: 2,
      cacheTime: 1000 * 10, // 10 seconds
      staleTime: 0,
    },
  )
}
