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
      closeOnBackdropClick={true}
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='p-6'
    >
      <div className='p-4 bg-gray-50 dark:bg-gray-900 rounded-xl'>
        <MoreDetails
          onSlippageInfoClick={onSlippageInfoClick}
          setShowFeesSettingSheet={setShowFeesSettingSheet}
        />
      </div>
    </BottomModal>
  )
}
