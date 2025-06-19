import { getErrorMsg, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, Memo } from '@leapwallet/leap-ui'
import { ThumbsUp } from '@phosphor-icons/react'
import classNames from 'classnames'
import { ErrorCard } from 'components/ErrorCard'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { LoaderAnimation } from 'components/loader/Loader'
import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
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
      className='p-6 !pt-8'
    >
      <div className='flex flex-col items-center gap-5'>
        <div className={classNames('flex p-4 w-full bg-gray-50 dark:bg-gray-900 rounded-2xl')}>
          <div className='h-10 w-10 bg-green-600 rounded-full flex items-center justify-center'>
            <ThumbsUp size={20} className='text-foreground' />
          </div>
          <div className='flex flex-col justify-center items-start px-3'>
            <div className='text-sm text-muted-foreground text-left'>Vote message</div>
            <div className='text-[18px] text-foreground font-bold'>
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

        {error && <ErrorCard text={getErrorMsg(error, gasOption, 'vote')} />}

        <Button
          className='w-full mt-1'
          onClick={async () => {
            if (selectedVote !== undefined) {
              await onSubmitVote(selectedVote)
            }
          }}
          disabled={loading}
        >
          {loading ? <LoaderAnimation color={Colors.white100} /> : 'Approve'}
        </Button>
      </div>
    </BottomModal>
  )
}
