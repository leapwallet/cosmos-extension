import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import React from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'

import { SelectProviderCard } from './SelectProviderCard'

type SuggestSelectProviderSheetProps = {
  isVisible: boolean
  onClose: () => void
  setShowSelectProviderSheet: () => void
  onReviewStake: () => void
}

export default function SuggestSelectProviderSheet({
  isVisible,
  onClose,
  setShowSelectProviderSheet,
  onReviewStake,
}: SuggestSelectProviderSheetProps) {
  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      title='Restake with a Provider'
      className='p-6'
    >
      <div className='flex flex-col gap-y-6'>
        <Text className='text-gray-400 dark:text-gray-600 text-center' size='sm'>
          You&apos;re missing out on increased rewards. Select a provider to restake with for
          increased APR.
        </Text>
        <SelectProviderCard
          selectDisabled={false}
          title='Provider'
          setShowSelectProviderSheet={setShowSelectProviderSheet}
          rootDenomsStore={rootDenomsStore}
        />
        <Button onClick={onReviewStake} className='w-full'>
          Review Stake
        </Button>
      </div>
    </BottomModal>
  )
}
