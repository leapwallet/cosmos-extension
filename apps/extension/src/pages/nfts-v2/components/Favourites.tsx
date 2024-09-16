import { CollectionData, useFavNftsList } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { NftInfo, NftStore } from '@leapwallet/cosmos-wallet-store'
import { useFavNFTs, useHiddenNFTs } from 'hooks/settings'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { useNftContext } from '../context'
import { AllNftsHidden, TextHeaderCollectionCard } from './index'

type FavouritesProps = {
  nftStore: NftStore
}

export const Favourites = observer(({ nftStore }: FavouritesProps) => {
  const favNfts = useFavNFTs()
  const hiddenNfts = useHiddenNFTs()
  const { activeTab } = useNftContext()

  const _collectionData = nftStore.getVisibleCollectionData(hiddenNfts)
  const areAllNftsHidden = nftStore.getAreAllNftsHidden(hiddenNfts)

  const { favNftsList } = useFavNftsList({
    collectionData: _collectionData as unknown as CollectionData,
    favNfts,
  })

  if (favNftsList.length === 0 || areAllNftsHidden) {
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
      nfts={favNftsList as unknown as (NftInfo & { chain: SupportedChain })[]}
    />
  )
})
