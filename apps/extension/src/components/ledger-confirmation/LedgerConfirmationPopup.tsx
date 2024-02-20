import { Header } from '@leapwallet/leap-ui'
import React from 'react'

import BottomSheet from '../bottom-sheet/BottomSheet'
import RadarAnimation from '../loader/Radar'
import Text from '../text'

type Props = {
  showLedgerPopup: boolean
  onCloseLedgerPopup?: VoidFunction
}

export default function LedgerConfirmationPopup({ showLedgerPopup, onCloseLedgerPopup }: Props) {
  const onClose = () => {
    //Placeholder function
  }

  return (
    <BottomSheet
      isVisible={showLedgerPopup}
      onClose={onCloseLedgerPopup ?? onClose}
      customHeader={() => <Header title={'Confirm on Ledger'} />}
      closeOnClickBackDrop={false}
    >
      <div className='flex flex-col items-center'>
        <div className='my-10'>
          <RadarAnimation />
        </div>
        <Text size='md' className='font-bold mb-7'>
          Approve transaction on your hardware wallet
        </Text>
      </div>
    </BottomSheet>
  )
}
