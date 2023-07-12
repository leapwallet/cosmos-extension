import { Buttons } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'

import CardDivider from '~/components/card-divider'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { Colors } from '~/theme/colors'
import { voteRatio } from '~/util/vote-ratio'

import { ProposalStatus } from './status'

function convertTime(seconds: number) {
  let sec: number | string = seconds
  let hours: number | string = Math.floor(sec / 3600)
  hours >= 1 ? (sec = sec - hours * 3600) : (hours = '00')
  let min: number | string = Math.floor(sec / 60)
  min >= 1 ? (sec = sec - min * 60) : (min = '00')
  sec < 1 ? (sec = '00') : void 0

  min.toString().length == 1 ? (min = '0' + min) : void 0
  sec.toString().length == 1 ? (sec = '0' + sec) : void 0

  return hours + ':' + min + ':' + sec
}

function VoteDetails({
  selectedProp,
  onVote,
  proposalList,
  currVote,
}: {
  selectedProp: string
  onVote: () => void
  proposalList: any[]
  currVote: string
}) {
  const proposal = proposalList.find((prop) => prop.proposal_id === selectedProp)
  const [timeLeft, setTimeLeft] = useState<string | undefined>()
  const activeChain = useActiveChain()

  useEffect(() => {
    const getTime = () => {
      const now = dayjs()
      const end = dayjs(
        proposal.status === ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD
          ? proposal.deposit_end_time
          : proposal.voting_end_time,
      )
      const duration = end.diff(now, 'seconds')
      setTimeLeft(convertTime(duration))
    }

    const i = setInterval(getTime, 1000)
    return () => clearInterval(i)
  }, [proposal])

  switch (proposal.status) {
    case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
      return (
        <>
          <div className='rounded-2xl bg-white-100 dark:bg-gray-900 flex flex-col mt-4'>
            <div className='flex items-center gap-3 p-4'>
              <div className='text-black-100 w-[150px] dark:text-white-100 text-base font-bold'>
                Voting Starts
              </div>
              <div className='text-black-100 dark:text-white-100 text-sm font-bold'>
                {dayjs(proposal.voting_start_time).format('MMM DD, YYYY')}
              </div>
            </div>
            <CardDivider />
            <div className='flex items-center gap-3 p-4'>
              <div className='text-black-100 w-[150px] dark:text-white-100 text-base font-bold'>
                Voting Ends
              </div>
              <div className='text-black-100 dark:text-white-100 text-sm font-bold'>
                {dayjs(proposal.voting_end_time).format('MMM DD, YYYY')}
              </div>
            </div>
            <div className='px-4 pb-4 text-xs text-gray-600 dark:text-gray-200 min-h-[32px]'>
              {timeLeft && `Ending in ${timeLeft}`}
            </div>
          </div>
          {currVote && (
            <div
              className={classNames(
                'flex p-4 w-[344px] mt-4 bg-green-900 border-2 border-green-800 rounded-2xl',
              )}
            >
              <div className='h-10 w-10 bg-green-300 rounded-full flex items-center justify-center'>
                <span className='material-icons-round text-green-700'>thumb_up</span>
              </div>
              <div className='flex flex-col justify-center items-start px-3'>
                <div className='text-base text-white-100 text-left'>Vote submitted</div>
                <div className='text-sm text-gray-600 font-medium'>Voted {currVote}</div>
              </div>
            </div>
          )}
          <Buttons.Generic
            color={Colors.getChainColor(activeChain)}
            size='normal'
            className='w-[344px] py-4 mt-4'
            onClick={() => onVote()}
            disabled={!!currVote}
          >
            <div className={'flex justify-center text-white-100 items-center'}>
              <span className='mr-2 material-icons-round'>how_to_vote</span>
              <span>Vote</span>
            </div>
          </Buttons.Generic>
        </>
      )
    case ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD:
      return (
        <>
          <div className='rounded-2xl bg-white-100 dark:bg-gray-900 flex flex-col mt-4'>
            <div className='flex items-center gap-3 p-4'>
              <div className='text-black-100 w-[150px] dark:text-white-100 text-base font-bold'>
                Deposit Period Ends
              </div>
              <div className='text-black-100 dark:text-white-100 text-sm font-bold'>
                {dayjs(proposal.deposit_end_time).format('MMM DD, YYYY')}
              </div>
            </div>
            {timeLeft && (
              <div className='px-4 pb-4 text-xs text-gray-600 dark:text-gray-200 min-h-[32px]'>
                {timeLeft && `Ending in ${timeLeft}`}
              </div>
            )}
          </div>
        </>
      )
    case ProposalStatus.PROPOSAL_STATUS_PASSED:
    case ProposalStatus.PROPOSAL_STATUS_FAILED:
    case ProposalStatus.PROPOSAL_STATUS_REJECTED:
      return (
        <>
          <div className='rounded-2xl bg-white-100 dark:bg-gray-900 flex flex-col mt-4'>
            <div className='flex items-center gap-3 p-4'>
              <div className='text-gray-600 w-[200px] dark:text-gray-200 text-xs font-bold'>
                Results
              </div>
              <div className='text-gray-600 dark:text-gray-200 text-xs font-bold'></div>
            </div>
            <div className='flex flex-col justify-center gap-3 p-4'>
              {voteRatio(proposal.final_tally_result).map((values) => (
                <div key={values.label} className='flex rounded-2xl relative overflow-hidden'>
                  <div
                    className={classNames(
                      'text-black-100 dark:text-white-100 w-52 font-bold py-2 border-y-2 border-l-2 rounded-l-2xl z-10',
                      values.selectedBorderCSS,
                    )}
                  >
                    <span className='ml-4 max-h-10'>{values.label}</span>
                  </div>
                  <div
                    className={classNames(
                      'w-full text-black-100 py-[10px] dark:text-white-100  border-y-2 border-r-2 rounded-r-2xl',
                      values.selectedBorderCSS,
                    )}
                  >
                    <span className='absolute right-4  font-bold'>
                      {values.percentage.toFixed(2)}
                    </span>
                  </div>
                  <div
                    style={{ width: (values.percentage * 3.12).toString() + 'px' }}
                    className={classNames(
                      'h-10 absolute l-0 m-[2px]',
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
}

export default VoteDetails
