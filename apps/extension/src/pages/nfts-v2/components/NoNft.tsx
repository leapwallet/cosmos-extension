import { NftStore } from '@leapwallet/cosmos-wallet-store'
import { useChainPageInfo } from 'hooks'
import React from 'react'

import { CantSeeNfts, NoCollectionCard } from './index'

type NoNftProps = {
  title?: string
  description?: string
  openManageCollectionsSheet: () => void
  openAddCollectionSheet: () => void
  nftStore: NftStore
}

export function NoNft({
  title,
  description,
  openManageCollectionsSheet,
  openAddCollectionSheet,
  nftStore,
}: NoNftProps) {
  const { topChainColor } = useChainPageInfo()

  return (
    <>
      <div className='w-full h-[100%] px-6 pt-6 pb-8'>
        <NoCollectionCard
          title={title ?? 'No NFTs collected'}
          subTitle={description ?? 'Your assets will appear here'}
        />

        <button
          style={{ color: topChainColor }}
          className='font-semibold text-[18px] mt-2 mb-6 w-full'
          onClick={openManageCollectionsSheet}
        >
          Manage collections
        </button>

        <CantSeeNfts openAddCollectionSheet={openAddCollectionSheet} nftStore={nftStore} />
      </div>
    </>
  )
}
