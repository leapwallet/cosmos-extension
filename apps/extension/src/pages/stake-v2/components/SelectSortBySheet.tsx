import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { CheckCircle } from '@phosphor-icons/react'
import BottomModal from 'components/new-bottom-modal'
import React from 'react'

import { STAKE_SORT_BY } from './SelectValidatorSheet'

const stackSortBy: STAKE_SORT_BY[] = ['Random', 'Amount staked', 'APR']

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
    <BottomModal isOpen={isVisible} onClose={onClose} title='Sort By' className='p-6'>
      <div className='flex flex-col gap-y-3'>
        {stackSortBy.map((element) => (
          <button
            key={element}
            className='bg-secondary p-4 rounded-xl flex font-medium items-center justify-between gap-4 hover:bg-secondary-200 transition-colors'
            onClick={() => {
              setVisible(false)
              setSortBy(element)
            }}
          >
            {element}

            {sortBy === element && <CheckCircle size={24} weight='fill' />}
          </button>
        ))}
      </div>
    </BottomModal>
  )
}
