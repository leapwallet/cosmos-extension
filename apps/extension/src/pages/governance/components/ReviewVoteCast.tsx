import {
  GasOptions,
  getErrorMsg,
  useActiveChain,
  VoteOptions,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Memo } from '@leapwallet/leap-ui'
import { ThumbsUp } from '@phosphor-icons/react'
import classNames from 'classnames'
import { ErrorCard } from 'components/ErrorCard'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import { LoaderAnimation } from 'components/loader/Loader'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { useCaptureTxError } from 'hooks/utility/useCaptureTxError'
import React, { useMemo } from 'react'
import { Colors } from 'theme/colors'

export type ReviewVoteCastProps = {
  isOpen: boolean
  onCloseHandler: () => void
  // eslint-disable-next-line no-unused-vars
  onSubmitVote: (option: VoteOptions) => Promise<boolean>
  loading: boolean
  error?: string
  selectedVote: VoteOptions | undefined
  memo: string
  // eslint-disable-next-line no-unused-vars
  setMemo: (memo: string) => void
  feeText: string
  proposalId: string
  refetchCurrVote: () => void
  showLedgerPopup?: boolean
  ledgerError?: string
  gasOption: GasOptions
  forceChain?: SupportedChain
}

export function ReviewVoteCast({
  isOpen,
  onCloseHandler,
  onSubmitVote,
  selectedVote,
  error,
  feeText,
  loading,
  memo,
  setMemo,
  proposalId,
  refetchCurrVote,
  showLedgerPopup,
  ledgerError,
  gasOption,
  forceChain,
}: ReviewVoteCastProps): React.ReactElement {
  const _activeChain = useActiveChain()
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

  useCaptureTxError(error)
  if (showLedgerPopup) {
    return <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />
  }

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

        {feeText && (
          <Text size='sm' className='text-gray-400 dark:text-gray-600 justify-center'>
            {feeText}
          </Text>
        )}

        {(error ?? ledgerError) && (
          <ErrorCard text={getErrorMsg(error ?? ledgerError ?? '', gasOption, 'vote')} />
        )}

        <Button
          className='w-full mt-1'
          disabled={showLedgerPopup || loading}
          onClick={async () => {
            if (selectedVote !== undefined) {
              const txSuccess = await onSubmitVote(selectedVote)
              if (txSuccess) {
                onCloseHandler()
              }
            }
          }}
        >
          {loading ? <LoaderAnimation color={Colors.white100} /> : 'Approve'}
        </Button>
      </div>
    </BottomModal>
  )
}
