import { useHiddenNftsList } from '@leapwallet/cosmos-wallet-hooks'
import { useHiddenNFTs } from 'hooks/settings'
import React from 'react'

import { useNftContext } from '../context'
import { TextHeaderCollectionCard } from './index'

export function Hidden() {
  const hiddenNfts = useHiddenNFTs()
  const { collectionData } = useNftContext()

  const { hiddenNftsList } = useHiddenNftsList({
    collectionData,
    hiddenNfts,
  })

  if (hiddenNftsList.length === 0) return <></>
  return (
    <TextHeaderCollectionCard
      headerTitle={`${hiddenNftsList.length} NFT${hiddenNftsList.length > 1 ? 's' : ''}`}
      nfts={hiddenNftsList}
    />
  )
}
