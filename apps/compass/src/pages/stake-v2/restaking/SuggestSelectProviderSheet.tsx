import { Buttons } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import React from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { Colors } from 'theme/colors'

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
        <Buttons.Generic
          onClick={onReviewStake}
          size='normal'
          className='w-full'
          color={Colors.green600}
        >
          Review Stake
        </Buttons.Generic>
      </div>
    </BottomModal>
  )
}
