import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { GenericCard } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { Images } from 'images'
import React from 'react'

import { STAKE_SORT_BY } from './SelectValidatorSheet'

type SelectSortByProps = {
  sortBy: STAKE_SORT_BY
  setSortBy: (s: STAKE_SORT_BY) => void
  isVisible: boolean
  setVisible: (v: boolean) => void
  onClose: () => void
  activeChain: SupportedChain
}

export default function SelectSortBySheet({
  sortBy,
  setSortBy,
  isVisible,
  setVisible,
  onClose,
}: SelectSortByProps) {
  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      closeOnBackdropClick={true}
      title='Sort By'
      className='p-6'
    >
      <div className='flex flex-col gap-y-3'>
        {(['Random', 'Amount staked', 'APY'] as STAKE_SORT_BY[]).map((element) => (
          <GenericCard
            key={element}
            onClick={() => {
              setVisible(false)
              setSortBy(element)
            }}
            icon={
              sortBy === (element as STAKE_SORT_BY) ? (
                <img width={24} height={24} src={Images.Misc.CheckGreenNew} />
              ) : undefined
            }
            size='md'
            title={element}
            isRounded={true}
            className='p-4 !h-auto bg-white-100 dark:bg-gray-950'
          />
        ))}
      </div>
    </BottomModal>
  )
}
