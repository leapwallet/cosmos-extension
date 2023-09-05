import { OmniflixNft } from '@leapwallet/cosmos-wallet-hooks'
import { useEffect } from 'react'

import { Collection, useNftContext } from '../context'

export function useCollectEndpointNfts(
  index: string,
  status: 'loading' | 'success' | 'error',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  chain: string,
) {
  const { setIsLoading, setCollectionData } = useNftContext()

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading((prevValue) => ({ ...prevValue, [index]: true }))
    }

    if (status === 'success') {
      setIsLoading((prevValue) => ({ ...prevValue, [index]: false }))
    }

    if (data && data.length) {
      const collections: Collection[] = data.reduce(
        (_collections: Collection[], nft: OmniflixNft) => {
          const { address, image, name } = nft.collection
          const collection = _collections.find((_collection) => _collection.address === address)

          if (collection) {
            return [
              ..._collections.filter((_collection) => _collection.address !== address),
              {
                ...collection,
                totalNfts: (collection.totalNfts ?? 0) + 1,
              },
            ]
          }

          return [..._collections, { address, image, name, totalNfts: 1, chain }]
        },
        [],
      )

      setCollectionData((prevValue) => {
        const _collections = (prevValue?.collections ?? []).filter(
          (collection) =>
            !collections.find((_collection) => _collection.address === collection.address),
        )
        const prevNfts = prevValue?.nfts ?? {}

        return {
          ...prevValue,
          collections: [..._collections, ...collections],
          nfts: {
            ...prevNfts,
            [chain]: data,
          },
        }
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, index, status, chain])
}
