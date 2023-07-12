/* eslint-disable react/no-children-prop */
import { Header, HeaderActionType, LineDivider } from '@leapwallet/leap-ui'
import React, { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

import PopupLayout from '~/components/popup-layout'
import { useWalletActivity } from '~/hooks/activity/use-activity'
import { VoteOptions } from '~/types/vote'

import ReviewVoteCast from './review-vote-cast'
import Status, { ProposalStatus } from './status'
import CastVoteSheet from './vote-cast-sheet'
import VoteDetails from './vote-details'

export type ProposalDetailsProps = {
  selectedProp: string | undefined
  onBack: () => void
  proposalList: any[]
}

function ProposalDetails({ selectedProp, onBack, proposalList }: ProposalDetailsProps) {
  const [castVoteSheet, setCastVoteSheet] = useState<boolean>(false)
  const [approveVoteSheet, setApproveVoteSheet] = useState<VoteOptions>(undefined)
  const [memo, setMemo] = useState('')
  const proposal = proposalList.find((prop) => prop.proposal_id === selectedProp)
  const activity = useWalletActivity()

  const currVote = useMemo(() => {
    return (
      activity
        .find(
          ({ parsedTx: { action, toAddress } }) =>
            action === 'vote' && toAddress.includes(`proposal#${selectedProp}`),
        )
        ?.content.title1.slice(5) ?? ''
    )
  }, [activity, selectedProp])

  return (
    <div className='relative w-full overflow-clip'>
      <PopupLayout>
        <Header
          action={{
            onClick: function noRefCheck() {
              onBack()
            },
            type: HeaderActionType.BACK,
          }}
          title={'Proposal'}
        />
        <div className='flex flex-col py-6 px-7 overflow-y-scroll'>
          <div className='text-gray-600 dark:text-gray-200 text-sm mb-1'>
            #{proposal.proposal_id} ·{' '}
            <Status status={proposal.status as unknown as ProposalStatus} />
          </div>
          <div className='text-black-100 dark:text-white-100 font-bold text-[28px]'>
            {proposal.content.title}
          </div>
          <VoteDetails
            selectedProp={proposal.proposal_id}
            onVote={() => setCastVoteSheet(true)}
            proposalList={proposalList}
            currVote={currVote}
          />
          <div className='my-8'>
            <LineDivider size='sm' />
          </div>
          {proposal.content.description && (
            <div>
              <div className='text-sm text-gray-600 mb-1'>Description</div>
              <div className='text-black-100 dark:text-white-100 break-words'>
                <ReactMarkdown
                  remarkPlugins={[gfm]}
                  children={proposal.content.description
                    .replace(/\/n/g, '\n')
                    .split(/\\n/)
                    .join('\n')}
                />
              </div>
            </div>
          )}
        </div>
      </PopupLayout>
      {castVoteSheet && (
        <CastVoteSheet
          isVisible={castVoteSheet}
          error=''
          onCloseHandler={() => setCastVoteSheet(false)}
          onSubmitVote={async (option) => {
            setApproveVoteSheet(option)
          }}
        />
      )}
      {!!approveVoteSheet && (
        <ReviewVoteCast
          isVisible={!!approveVoteSheet}
          proposalId={proposal.proposal_id}
          feeText='Fee is 0.005'
          memo={memo}
          setMemo={setMemo}
          selectedVote={approveVoteSheet}
          onCloseHandler={() => {
            setApproveVoteSheet(undefined)
            setCastVoteSheet(false)
          }}
          showLedgerPopup={false}
        />
      )}
    </div>
  )
}

export default ProposalDetails
