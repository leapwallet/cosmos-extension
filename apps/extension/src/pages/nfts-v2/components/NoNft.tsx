import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import React, { useState } from 'react'
import { Colors } from 'theme/colors'

import { ManageCollections, NoCollectionCard } from './index'

type NoNftProps = {
  title?: string
  description?: string
}

export function NoNft({ title, description }: NoNftProps) {
  const [showManageCollections, setShowManageCollections] = useState(false)
  const activeChain = useActiveChain()

  return (
    <div className='w-full h-[80%] px-6 pt-6 pb-8 flex flex-col text-center'>
      <NoCollectionCard
        title={title ?? 'No NFTs collected'}
        subTitle={description ?? 'Your assets will appear here'}
      />

      <button
        style={{ color: Colors.getChainColor(activeChain) }}
        className='font-semibold text-[18px] mt-2'
        onClick={() => setShowManageCollections(true)}
      >
        Manage collections
      </button>

      <ManageCollections
        isVisible={showManageCollections}
        onClose={() => setShowManageCollections(false)}
      />
    </div>
  )
}
