import { feeDenoms, SupportedDenoms } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, HeaderActionType, Memo } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import React from 'react'

import BottomSheet from '~/components/bottom-sheet'
import Text from '~/components/text'
import { useAddActivity } from '~/hooks/activity/use-activity'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { useCurrentNetwork } from '~/hooks/settings/use-current-network'
import { useAddress } from '~/hooks/wallet/use-address'
import { Colors } from '~/theme/colors'
import { VoteOptions } from '~/types/vote'

export type ReviewVoteCastProps = {
  isVisible: boolean
  onCloseHandler?: () => void
  selectedVote: VoteOptions
  memo: string
  setMemo: (memo: string) => void
  feeText: string
  proposalId: string
  showLedgerPopup?: boolean
}
function ReviewVoteCast({
  isVisible,
  onCloseHandler,
  selectedVote,
  feeText,
  memo,
  setMemo,
  proposalId,
}: ReviewVoteCastProps): React.ReactElement {
  const fromAddress = useAddress()
  const activeChain = useActiveChain()
  const addActivity = useAddActivity()
  const network = useCurrentNetwork()

  const handleVoteSubmit = () => {
    addActivity({
      action: 'vote',
      fromAddress,
      toAddress: `${activeChain}-proposal#${proposalId}`,
      denomID: feeDenoms[network][activeChain].coinMinimalDenom as SupportedDenoms,
      amount: '0',
      feeAmount: '5000',
      title: `Vote ${selectedVote}`,
      subtitle: `Voted ${selectedVote} for proposal #${proposalId}`,
    })
    onCloseHandler()
  }

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onCloseHandler}
      headerTitle='Review Transaction'
      headerActionType={HeaderActionType.CANCEL}
    >
      <>
        <div className='flex flex-col items-center w-[420px] gap-y-[16px] mt-[28px] mb-[40px]'>
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
          <Buttons.Generic
            color={Colors.getChainColor(activeChain)}
            size='normal'
            className='w-[344px]'
            title='Vote'
            onClick={handleVoteSubmit}
          >
            Approve
          </Buttons.Generic>
        </div>
      </>
    </BottomSheet>
  )
}

export default ReviewVoteCast
