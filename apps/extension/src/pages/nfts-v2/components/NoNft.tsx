import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import React from 'react'
import { Colors } from 'theme/colors'

import { CantSeeNfts, NoCollectionCard } from './index'

type NoNftProps = {
  title?: string
  description?: string
  openManageCollectionsSheet: () => void
  openAddCollectionSheet: () => void
}

export function NoNft({
  title,
  description,
  openManageCollectionsSheet,
  openAddCollectionSheet,
}: NoNftProps) {
  const activeChain = useActiveChain()

  return (
    <>
      <div className='w-full h-[100%] px-6 pt-6 pb-8'>
        <NoCollectionCard
          title={title ?? 'No NFTs collected'}
          subTitle={description ?? 'Your assets will appear here'}
        />

        <button
          style={{ color: Colors.getChainColor(activeChain) }}
          className='font-semibold text-[18px] mt-2 mb-6 w-full'
          onClick={openManageCollectionsSheet}
        >
          Manage collections
        </button>

        <CantSeeNfts openAddCollectionSheet={openAddCollectionSheet} />
      </div>
    </>
  )
}
