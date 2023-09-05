import {
  OwnedCollectionTokenInfo,
  useDisabledNFTsCollections,
} from '@leapwallet/cosmos-wallet-hooks'
import { useHiddenNFTs } from 'hooks/settings'
import React, { useMemo } from 'react'

import { useNftContext } from '../context'
import { FavNftsList, TextHeaderCollectionCard } from './index'

export function Hidden() {
  const hiddenNfts = useHiddenNFTs()
  const { collectionData } = useNftContext()
  const disabledNFTsCollections = useDisabledNFTsCollections()

  const hiddenNftsList = useMemo(() => {
    if (!collectionData) return []

    const _hiddenNftsList: FavNftsList[] = hiddenNfts.reduce((nfts: FavNftsList[], hiddenNft) => {
      const [address, tokenId] = hiddenNft.split('-')

      const collection = collectionData.collections?.find(
        (collection) =>
          collection.address === address && !disabledNFTsCollections.includes(collection.address),
      )

      if (collection) {
        const { chain } = collection
        const _nfts: OwnedCollectionTokenInfo[] = collectionData.nfts[chain]
        const nft = _nfts?.find((_nft) => (_nft.tokenId ?? _nft.domain) === tokenId)

        if (nft) {
          return [...nfts, { ...nft, chain }]
        }
      }

      return nfts
    }, [])

    return _hiddenNftsList
  }, [collectionData, disabledNFTsCollections, hiddenNfts])

  if (hiddenNftsList.length === 0) return <></>
  return (
    <TextHeaderCollectionCard
      headerTitle={`${hiddenNftsList.length} NFT${hiddenNftsList.length > 1 ? 's' : ''}`}
      nfts={hiddenNftsList}
    />
  )
}
