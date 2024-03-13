import { useFavNftsList } from '@leapwallet/cosmos-wallet-hooks'
import { useFavNFTs } from 'hooks/settings'
import React from 'react'

import { useNftContext } from '../context'
import { AllNftsHidden, TextHeaderCollectionCard } from './index'

export function Favourites() {
  const favNfts = useFavNFTs()
  const { _collectionData, activeTab, areAllNftsHiddenRef } = useNftContext()

  const { favNftsList } = useFavNftsList({
    collectionData: _collectionData,
    favNfts,
  })

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
