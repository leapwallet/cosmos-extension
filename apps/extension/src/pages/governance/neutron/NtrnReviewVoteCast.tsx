import { getErrorMsg, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, Memo } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { ErrorCard } from 'components/ErrorCard'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { LoaderAnimation } from 'components/loader/Loader'
import { useCaptureTxError } from 'hooks/utility/useCaptureTxError'
import React, { useMemo } from 'react'
import { Colors } from 'theme/colors'

import { ReviewVoteCastProps } from '../components/ReviewVoteCast'

export function NtrnReviewVoteCast({
  isOpen,
  onCloseHandler,
  onSubmitVote,
  selectedVote,
  error,
  loading,
  memo,
  setMemo,
  proposalId,
  gasOption,
  forceChain,
}: Omit<ReviewVoteCastProps, 'feeText'>) {
  const _activeChain = useActiveChain()
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])
  useCaptureTxError(error)

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onCloseHandler}
      title='Review Transaction'
      className='!p-0'
    >
      <div className='flex flex-col items-center w-[400px] gap-y-[16px] mt-[28px] mb-[40px]'>
        <div className='flex p-4 w-[344px] bg-gray-50 dark:bg-gray-900 rounded-2xl'>
          <div className='h-10 w-10 bg-green-300 rounded-full flex items-center justify-center'>
            <span className='material-icons-round text-green-700'>thumb_up</span>
          </div>
          <div className='flex flex-col justify-center items-start px-3'>
            <div className='text-xs text-gray-400 text-left'>Vote message</div>
            <div className='text-base text-black-100 dark:text-white-100 font-medium'>
              Vote <b>{selectedVote}</b> on <b>Proposal #{proposalId}</b>
            </div>
          </div>
        </div>

        <Memo
          value={memo}
          onChange={(e) => {
            setMemo(e.target.value)
          }}
        />

        <DisplayFee className='mt-4' />

        <Buttons.Generic
          color={Colors.getChainColor(activeChain)}
          size='normal'
          className='w-[344px]'
          title='Vote'
          onClick={async () => {
            if (selectedVote !== undefined) {
              await onSubmitVote(selectedVote)
            }
          }}
          disabled={loading}
        >
          {loading ? <LoaderAnimation color={Colors.white100} /> : 'Approve'}
        </Buttons.Generic>

        {error && <ErrorCard text={getErrorMsg(error, gasOption, 'vote')} />}
      </div>
    </BottomModal>
  )
}
