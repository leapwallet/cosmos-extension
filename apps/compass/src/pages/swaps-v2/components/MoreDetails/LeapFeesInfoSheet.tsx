import BottomModal from 'components/bottom-modal'
import React from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

type LeapFeesInfoSheetProps = { isOpen: boolean; onClose: () => void; leapFeeBps: string }

function LeapFeesInfoSheet({ isOpen, onClose, leapFeeBps }: LeapFeesInfoSheetProps) {
  return (
    <BottomModal
      title={`${isCompassWallet() ? 'Compass' : 'Leap'} Fee`}
      onClose={onClose}
      isOpen={isOpen}
      className='p-6'
    >
      <div className='text-md !leading-[25.6px] font-medium text-gray-800 dark:text-gray-200 text-left'>
        {`Quote includes a ${parseFloat((Number(leapFeeBps) / 100).toFixed(2))}% ${
          isCompassWallet() ? 'Compass' : 'Leap'
        } Fee shared with swap
        infrastructure provider`}
      </div>
    </BottomModal>
  )
}

export default LeapFeesInfoSheet
