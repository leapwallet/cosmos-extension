import { CollectionData, useFavNftsList } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { NftInfo, NftStore } from '@leapwallet/cosmos-wallet-store'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { favNftStore, hiddenNftStore } from 'stores/manage-nft-store'

import { useNftContext } from '../context'
import { AllNftsHidden, TextHeaderCollectionCard } from './index'

type FavouritesProps = {
  nftStore: NftStore
}

export const Favourites = observer(({ nftStore }: FavouritesProps) => {
  const { activeTab } = useNftContext()

  const _collectionData = nftStore.getVisibleCollectionData(hiddenNftStore.hiddenNfts)
  const areAllNftsHidden = nftStore.getAreAllNftsHidden(hiddenNftStore.hiddenNfts)

  const { favNftsList } = useFavNftsList({
    collectionData: _collectionData as unknown as CollectionData,
    favNfts: favNftStore.favNfts,
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
