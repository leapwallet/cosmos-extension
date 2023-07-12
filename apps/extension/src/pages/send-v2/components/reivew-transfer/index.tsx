import { Buttons } from '@leapwallet/leap-ui'
import { AutoAdjustAmountSheet } from 'components/auto-adjust-amount-sheet'
import { useSendContext } from 'pages/send-v2/context'
import React, { useCallback, useState } from 'react'

import { ReviewTransferSheet } from './review-transfer-sheet'

type ReviewTransferProps = {
  themeColor: string
}

export const ReviewTransfer: React.FC<ReviewTransferProps> = ({ themeColor }) => {
  const [showReviewTxSheet, setShowReviewTxSheet] = useState(false)
  const [checkForAutoAdjust, setCheckForAutoAdjust] = useState(false)

  const { sendDisabled, clearTxError, fee, inputAmount, setInputAmount, selectedToken } =
    useSendContext()

  const showAdjustmentSheet = useCallback(() => {
    setCheckForAutoAdjust(true)
  }, [])

  const hideAdjustmentSheet = useCallback(() => {
    setCheckForAutoAdjust(false)
  }, [])

  return (
    <div>
      <Buttons.Generic
        size='normal'
        color={themeColor}
        onClick={showAdjustmentSheet}
        disabled={sendDisabled}
        data-testing-id='send-review-transfer-btn'
      >
        Review Transfer
      </Buttons.Generic>
      {selectedToken && fee && checkForAutoAdjust ? (
        <AutoAdjustAmountSheet
          amount={inputAmount}
          setAmount={setInputAmount}
          selectedToken={selectedToken}
          fee={fee.amount[0]}
          setShowReviewSheet={setShowReviewTxSheet}
          closeAdjustmentSheet={hideAdjustmentSheet}
        />
      ) : null}
      <ReviewTransferSheet
        isOpen={showReviewTxSheet}
        onClose={() => {
          setShowReviewTxSheet(false)
          clearTxError()
        }}
        themeColor={themeColor}
      />
    </div>
  )
}
