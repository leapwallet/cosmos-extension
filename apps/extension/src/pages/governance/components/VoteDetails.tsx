import { Proposal, ProposalApi } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, CardDivider } from '@leapwallet/leap-ui'
import { ThumbsUp } from '@phosphor-icons/react'
import classNames from 'classnames'
import dayjs from 'dayjs'
import Vote from 'icons/vote'
import React, { useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Colors } from 'theme/colors'

import { convertTime, voteRatio } from '../utils'
import { ProposalStatusEnum } from './ProposalStatus'

type VoteDetailsProps = {
  proposal: Proposal | ProposalApi
  currVote: string
  isLoading: boolean
  activeChain: SupportedChain
  onVote: () => void
  hasMinStaked: boolean
}

export function VoteDetails({
  currVote,
  proposal,
  isLoading,
  activeChain,
  hasMinStaked,
  onVote,
}: VoteDetailsProps) {
  const [timeLeft, setTimeLeft] = useState<string | undefined>()

  useEffect(() => {
    const getTime = () => {
      const now = dayjs()
      const end = dayjs(
        proposal.status === ProposalStatusEnum.PROPOSAL_STATUS_DEPOSIT_PERIOD
          ? proposal.deposit_end_time
          : proposal.voting_end_time,
      )
      const duration = end.diff(now, 'seconds')
      setTimeLeft(convertTime(duration))
    }

    const i = setInterval(getTime, 1000)
    return () => clearInterval(i)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal, convertTime])

  switch (proposal.status) {
    case ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD:
      return (
        <>
          <div className='rounded-2xl bg-secondary-100 flex flex-col mt-7'>
            <div className='flex items-center justify-between gap-3 px-5 py-4'>
              <div className='text-secondary-800 text-sm'>Voting Starts</div>

              <div className='text-foreground text-sm font-bold'>
                {dayjs(proposal.voting_start_time).format('MMM DD, YYYY')}
              </div>
            </div>
            <div className='h-[1px] bg-secondary-300' />

            <div className='flex items-center justify-between gap-3 px-5 py-4'>
              <div className='text-secondary-800 text-sm'>Voting Ends</div>

              <div className='text-foreground text-sm font-bold'>
                {dayjs(proposal.voting_end_time).format('MMM DD, YYYY')}
              </div>
            </div>
            {timeLeft && (
              <>
                <div className='h-[1px] bg-secondary-300' />
                <div className='flex items-center justify-between gap-3 px-5 py-4'>
                  <div className='text-secondary-800 text-sm'>Ending in</div>

                  <div className='text-foreground text-sm font-bold'>{timeLeft}</div>
                </div>
              </>
            )}
          </div>

          {currVote && currVote !== 'NO_VOTE' && (
            <div
              className={classNames(
                'flex p-4 w-[344px] mt-4 dark:bg-green-900 bg-green-300 border-2 dark:border-green-800 border-green-600 rounded-2xl',
              )}
            >
              <div className='h-10 w-10 bg-green-400 rounded-full flex items-center justify-center'>
                <ThumbsUp size={16} className='text-green-700' />
              </div>

              <div className='flex flex-col justify-center items-start px-3'>
                <div className='text-base text-white-100 text-left'>Vote submitted</div>
                <div className='text-sm text-gray-600 font-medium'>Voted {currVote}</div>
              </div>
            </div>
          )}
        </>
      )

    case ProposalStatusEnum.PROPOSAL_STATUS_DEPOSIT_PERIOD:
      return (
        <>
          <div className='rounded-2xl bg-secondary-100 flex flex-col mt-7'>
            <div className='flex items-center justify-between gap-3 px-5 py-4'>
              <div className='text-secondary-800 text-sm'>Deposit Period Ends</div>
              <div className='text-foreground text-sm font-bold'>
                {dayjs(proposal.deposit_end_time).format('MMM DD, YYYY')}
              </div>
            </div>
            {timeLeft && (
              <>
                <div className='h-[1px] bg-secondary-300' />
                <div className='flex items-center justify-between gap-3 px-5 py-4'>
                  <div className='text-secondary-800 text-sm'>Ending in</div>

                  <div className='text-foreground text-sm font-bold'>{timeLeft}</div>
                </div>
              </>
            )}
          </div>
        </>
      )

    case ProposalStatusEnum.PROPOSAL_STATUS_PASSED:
    case ProposalStatusEnum.PROPOSAL_STATUS_FAILED:
    case ProposalStatusEnum.PROPOSAL_STATUS_REJECTED:
      return (
        <>
          <div className='rounded-2xl bg-secondary-100 flex flex-col mt-7 p-5'>
            <div className='text-secondary-800 mb-5 text-sm font-bold'>Results</div>

            <div className='flex flex-col justify-center gap-3'>
              {voteRatio(
                (proposal as unknown as ProposalApi).tally || proposal.final_tally_result,
              ).map((values) => (
                <div
                  key={values.label}
                  className={classNames(
                    'flex relative overflow-clip border rounded-lg',
                    values.selectedBorderCSS,
                  )}
                >
                  <div
                    className={classNames(
                      'text-foreground text-sm font-bold py-2 z-10 flex-1',
                      values.selectedBorderCSS,
                    )}
                  >
                    <span className='ml-4 max-h-10'>{values.label}</span>
                  </div>
                  <div
                    className={classNames(
                      'text-foreground text-sm py-[10px] shrink-0',
                      values.selectedBorderCSS,
                    )}
                  >
                    <span className='absolute right-4 font-bold'>
                      {values.percentage.toFixed(2)}
                    </span>
                  </div>
                  <div
                    style={{ width: (values.percentage * 3.12).toString() + 'px' }}
                    className={classNames(
                      'h-10 absolute l-0 rounded-xl',
                      values.selectedBackgroundCSS,
                    )}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </>
      )
  }

  return <></>
}
