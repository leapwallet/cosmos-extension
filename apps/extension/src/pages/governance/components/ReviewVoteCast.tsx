import {
  GasOptions,
  getErrorMsg,
  useActiveChain,
  VoteOptions,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, Memo } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import { ErrorCard } from 'components/ErrorCard'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
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
      className='!p-0'
    >
      <div className='flex flex-col items-center w-[400px] gap-y-[16px] mt-[28px] mb-[40px]'>
        <div className={classNames('flex p-4 w-[344px] bg-gray-50 dark:bg-gray-900 rounded-2xl')}>
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

        <Text size='sm' className='text-gray-400 dark:text-gray-600 justify-center'>
          {feeText}
        </Text>

        {(error ?? ledgerError) && (
          <ErrorCard text={getErrorMsg(error ?? ledgerError ?? '', gasOption, 'vote')} />
        )}

        <Buttons.Generic
          color={Colors.getChainColor(activeChain)}
          size='normal'
          className='w-[344px]'
          title='Vote'
          disabled={showLedgerPopup}
          onClick={async () => {
            if (selectedVote !== undefined) {
              const txSuccess = await onSubmitVote(selectedVote)
              if (txSuccess) {
                onCloseHandler()
                refetchCurrVote()
              }
            }
          }}
        >
          {loading ? <LoaderAnimation color={Colors.white100} /> : 'Approve'}
        </Buttons.Generic>
      </div>
    </BottomModal>
  )
}
