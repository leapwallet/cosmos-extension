import {
  OwnedCollectionTokenInfo,
  useDisabledNFTsCollections,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useFavNFTs } from 'hooks/settings'
import React, { useMemo } from 'react'

import { useNftContext } from '../context'
import { AllNftsHidden, TextHeaderCollectionCard } from './index'

export type FavNftsList = OwnedCollectionTokenInfo & { chain: SupportedChain }

export function Favourites() {
  const favNfts = useFavNFTs()
  const { _collectionData, activeTab, areAllNftsHiddenRef } = useNftContext()
  const disabledNFTsCollections = useDisabledNFTsCollections()

  const favNftsList = useMemo(() => {
    if (!_collectionData) return []

    const _favNftsList: FavNftsList[] = favNfts.reduce((nfts: FavNftsList[], favNft) => {
      const [address, tokenId] = favNft.split('-')

      const collection = _collectionData.collections?.find(
        (collection) =>
          collection.address === address && !disabledNFTsCollections.includes(collection.address),
      )

      if (collection) {
        const { chain } = collection
        const _nfts: OwnedCollectionTokenInfo[] = _collectionData.nfts[chain]
        const nft = _nfts?.find((_nft) => (_nft.tokenId ?? _nft.domain) === tokenId)

        if (nft) {
          return [...nfts, { ...nft, chain }]
        }
      }

      return nfts
    }, [])

    return _favNftsList
  }, [_collectionData, disabledNFTsCollections, favNfts])

  if (favNftsList.length === 0 || areAllNftsHiddenRef.current) {
    if (activeTab === 'All') {
      return <></>
    }

    return <AllNftsHidden />
  }

  return (
    <TextHeaderCollectionCard
      headerTitle={
        activeTab === 'All'
          ? 'Favorites'
          : `${favNftsList.length} NFT${favNftsList.length > 1 ? 's' : ''}`
      }
      nfts={favNftsList}
    />
  )
}
