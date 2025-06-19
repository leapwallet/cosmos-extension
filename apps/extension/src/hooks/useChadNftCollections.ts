import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export type NftCollection = {
  collection: string
  icon: string
}

const CHAD_NFT_COLLECTIONS_API = {
  refetchInterval: 15 * 60 * 1000, // 15 mins
  staleTime: 10 * 60 * 1000, // 10 mins
  retries: 2,
} as const

async function fetchChadNftCollections(): Promise<NftCollection[]> {
  const endpoint = `https://assets.leapwallet.io/cosmos-registry/v1/chad-exclusives/nft-collections.json`
  const { data } = await axios.get<NftCollection[]>(endpoint)
  return data
}

export function useChadNftCollections() {
  const {
    data: nftCollections = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chadNftCollections'],
    queryFn: fetchChadNftCollections,
    refetchInterval: CHAD_NFT_COLLECTIONS_API.refetchInterval,
    staleTime: CHAD_NFT_COLLECTIONS_API.staleTime,
    retry: CHAD_NFT_COLLECTIONS_API.retries,
  })

  return { nftCollections, isLoading, error }
}
