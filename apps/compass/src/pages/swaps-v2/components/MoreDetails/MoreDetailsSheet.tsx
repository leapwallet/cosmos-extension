import BottomModal from 'components/bottom-modal'
import React, { Dispatch, SetStateAction } from 'react'

import { MoreDetails } from './MoreDetails'

type MoreDetailsSheetProps = {
  isOpen: boolean
  onClose: () => void
  onSlippageInfoClick: () => void
  setShowFeesSettingSheet: Dispatch<SetStateAction<boolean>>
}

export function MoreDetailsSheet({
  isOpen,
  onClose,
  onSlippageInfoClick,
  setShowFeesSettingSheet,
}: MoreDetailsSheetProps) {
  return (
    <BottomModal
      title='More Details'
      onClose={onClose}
      isOpen={isOpen}
      className='!p-6 border-t-secondary-200 border-t'
      containerClassName='bg-secondary-50'
    >
      <MoreDetails
        onSlippageInfoClick={onSlippageInfoClick}
        setShowFeesSettingSheet={setShowFeesSettingSheet}
      />
    </BottomModal>
  )
}
