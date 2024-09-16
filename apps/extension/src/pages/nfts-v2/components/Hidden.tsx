import { NftContextType, useHiddenNftsList } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { NftInfo, NftStore } from '@leapwallet/cosmos-wallet-store'
import { useHiddenNFTs } from 'hooks/settings'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { TextHeaderCollectionCard } from './index'

type HiddenProps = {
  nftStore: NftStore
}

export const Hidden = observer(({ nftStore }: HiddenProps) => {
  const hiddenNfts = useHiddenNFTs()

  const { hiddenNftsList } = useHiddenNftsList({
    collectionData: nftStore.nftDetails
      .collectionData as unknown as NftContextType['collectionData'],
    hiddenNfts,
  })

  if (hiddenNftsList.length === 0) return <></>
  return (
    <TextHeaderCollectionCard
      headerTitle={`${hiddenNftsList.length} NFT${hiddenNftsList.length > 1 ? 's' : ''}`}
      nfts={hiddenNftsList as unknown as (NftInfo & { chain: SupportedChain })[]}
    />
  )
})
