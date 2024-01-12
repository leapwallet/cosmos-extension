import { useActiveChain, useChainApis, useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { getNeutronProposalVote } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, Header, HeaderActionType, LineDivider } from '@leapwallet/leap-ui'
import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import PopupLayout from 'components/layout/popup-layout'
import { ProposalDescription } from 'components/proposal-description'
import Text from 'components/text'
import dayjs from 'dayjs'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { useAddress } from 'hooks/wallet/useAddress'
import React, { useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { PieChart } from 'react-minimal-pie-chart'
import { Colors } from 'theme/colors'
import { voteRatio } from 'utils/gov/voteRatio'
import { imgOnError } from 'utils/imgOnError'

import { VoteOptions } from '../CastVoteSheet'
import {
  convertTime,
  getPercentage,
  ProposalDetailsProps,
  ShowVotes,
  Turnout,
} from '../ProposalDetails'
import { NtrnCastVote, NtrnStatus } from './index'
import { NtrnProposalStatus } from './NtrnStatus'

type VoteDetailsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  proposal: any
  onVote: () => void
  currVote: string
  isLoading: boolean
}

function VoteDetails({ proposal, onVote, currVote, isLoading }: VoteDetailsProps) {
  const [timeLeft, setTimeLeft] = useState<string | undefined>()
  const activeChain = useActiveChain()

  useEffect(() => {
    const getTime = () => {
      const now = dayjs()
      const end = dayjs(Math.ceil(proposal.proposal.expiration.at_time / 10 ** 6))
      const duration = end.diff(now, 'seconds')
      setTimeLeft(convertTime(duration))
    }

    const intervalId = setInterval(getTime, 1000)
    return () => clearInterval(intervalId)
  }, [proposal.proposal.expiration.at_time])

  switch (proposal.proposal.status) {
    case NtrnProposalStatus.OPEN:
      return (
        <>
          <div className='rounded-2xl bg-white-100 dark:bg-gray-900 flex flex-col mt-4'>
            <div className='flex items-center justify-between gap-3 p-4'>
              <div className='text-black-100 dark:text-white-100 text-base font-bold'>
                Voting Ends
              </div>
              <div className='text-black-100 dark:text-white-100 text-sm font-bold'>
                {dayjs(Math.ceil(proposal.proposal.expiration.at_time / 10 ** 6)).format(
                  'MMM DD, YYYY',
                )}
              </div>
            </div>
            <div className='px-4 pb-4 text-xs text-gray-600 dark:text-gray-200 min-h-[32px]'>
              {timeLeft && `Ending in ${timeLeft}`}
            </div>
          </div>

          {isLoading ? (
            <div className='rounded-2xl mt-4 h-18 w-full p-4 flex bg-white-100 dark:bg-gray-900'>
              <Skeleton count={1} className='rounded-full mt-4 h-10 w-10' />
              <div className='ml-3 w-full'>
                <Skeleton count={1} className='h-6' />
                <Skeleton count={1} className='h-5' />
              </div>
            </div>
          ) : null}

          {currVote && currVote !== 'NO_VOTE' && (
            <div
              className={classNames(
                'flex p-4 w-[344px] mt-4 dark:bg-green-900 bg-green-300 border-2 dark:border-green-800 border-green-600 rounded-2xl',
              )}
            >
              <div className='h-10 w-10 bg-green-400 rounded-full flex items-center justify-center'>
                <span className='material-icons-round text-green-700'>thumb_up</span>
              </div>
              <div className='flex flex-col justify-center items-start px-3'>
                <div className='text-base text-white-100 text-left'>Vote submitted</div>
                <div className='text-sm text-gray-600 font-medium'>
                  Voted {currVote.toUpperCase()}
                </div>
              </div>
            </div>
          )}

          <Buttons.Generic
            color={Colors.getChainColor(activeChain)}
            size='normal'
            className='w-[344px] py-4 mt-4'
            onClick={() => onVote()}
          >
            <div className={'flex justify-center text-white-100 items-center'}>
              <span className='mr-2 material-icons-round'>how_to_vote</span>
              <span>Vote</span>
            </div>
          </Buttons.Generic>
        </>
      )

    case NtrnProposalStatus.EXECUTED:
    case NtrnProposalStatus.PASSED:
    case NtrnProposalStatus.REJECTED:
      return (
        <div className='rounded-2xl bg-white-100 dark:bg-gray-900 flex flex-col mt-4'>
          <div className='flex items-center gap-3 p-4'>
            <div className='text-gray-600 w-[200px] dark:text-gray-200 text-xs font-bold'>
              Results
            </div>
            <div className='text-gray-600 dark:text-gray-200 text-xs font-bold'></div>
          </div>
          <div className='flex flex-col justify-center gap-3 p-4'>
            {voteRatio(proposal.proposal.votes)
              .filter((vote) => vote.label !== VoteOptions.NO_WITH_VETO)
              .map((values) => (
                <div key={values.label} className='flex rounded-2xl relative overflow-clip'>
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
                      'w-full text-black-100 py-[10px] dark:text-white-100 border-y-2 border-r-2 rounded-r-2xl',
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
                      'h-10 absolute l-0 m-[2px] rounded-2xl',
                      values.selectedBackgroundCSS,
                    )}
                  ></div>
                </div>
              ))}
          </div>
        </div>
      )
  }

  return <></>
}

export function NtrnProposalDetails({ selectedProp, onBack, proposalList }: ProposalDetailsProps) {
  const { chains } = useChainsStore()
  const activeChain = useActiveChain()
  const chain = chains[activeChain]
  const address = useAddress()

  const { rpcUrl, txUrl } = useChainApis()
  const defaultTokenLogo = useDefaultTokenLogo()
  const [showCastVoteSheet, setShowCastVoteSheet] = useState(false)

  const proposal = useMemo(
    () => proposalList.find((_proposal) => _proposal.id === selectedProp),
    [proposalList, selectedProp],
  )
  const { abstain, yes, no } = proposal.proposal.votes
  const totalVotes = [yes, no, abstain].reduce((sum, val) => sum + Number(val), 0)

  const dataMock = useMemo(() => {
    return !totalVotes
      ? [{ title: 'loading', value: 1, color: '#ccc', percent: '0%' }]
      : [
          {
            title: 'YES',
            value: +yes,
            color: '#29A874',
            percent: getPercentage(+yes, totalVotes),
          },
          {
            title: 'NO',
            value: +no,
            color: '#FF707E',
            percent: getPercentage(+no, totalVotes),
          },
          {
            title: 'Abstain',
            value: +abstain,
            color: '#D1A700',
            percent: getPercentage(+abstain, totalVotes),
          },
        ]
  }, [abstain, no, totalVotes, yes])

  const tallying = useMemo(() => {
    return [
      {
        label: 'Turnout',
        value: (totalVotes / proposal.proposal.total_power) * 100,
      },
      { label: 'Quorum', value: proposal.proposal.threshold.threshold_quorum.quorum.percent * 100 },
    ]
  }, [
    proposal.proposal.threshold.threshold_quorum.quorum.percent,
    proposal.proposal.total_power,
    totalVotes,
  ])

  const {
    data: currVote,
    refetch,
    isLoading,
  } = useQuery(
    ['neutron-currVote', activeChain, address, selectedProp, rpcUrl],
    async function () {
      return await getNeutronProposalVote(rpcUrl ?? '', Number(selectedProp ?? ''), address)
    },
    {
      retry: (failureCount) => failureCount <= 2,
      enabled: proposal.proposal.status === NtrnProposalStatus.OPEN && !!rpcUrl,
    },
  )

  return (
    <div className='relative w-[400px] overflow-clip'>
      <PopupLayout>
        <Header
          action={{
            onClick: onBack,
            type: HeaderActionType.BACK,
          }}
          title='Proposal'
        />
        <div className='flex flex-col py-6 px-7 max-h-[520px] overflow-y-scroll'>
          <div className='text-gray-600 dark:text-gray-200 text-sm mb-1'>
            #{proposal.id} · <NtrnStatus status={proposal.proposal.status} />
          </div>
          <div className='text-black-100 dark:text-white-100 font-bold text-xl break-words'>
            {proposal.proposal.title}
          </div>

          <VoteDetails
            proposal={proposal}
            onVote={() => setShowCastVoteSheet(true)}
            currVote={currVote?.vote}
            isLoading={isLoading}
          />

          <div className='my-8'>
            <LineDivider size='sm' />
          </div>

          {totalVotes && (
            <>
              <div className='w-full h-full flex items-center justify-center mb-8'>
                <div className='w-[180px] h-[180px] flex items-center justify-center relative'>
                  <PieChart data={dataMock} lineWidth={20} />
                  <p className='text-md dark:text-white-100 text-dark-gray font-bold absolute'>
                    Current Status
                  </p>
                </div>
              </div>

              <ShowVotes dataMock={dataMock} chain={chain} />
              <Turnout tallying={tallying} />
            </>
          )}

          {proposal.proposal.status === NtrnProposalStatus.OPEN && (
            <div className='rounded-2xl mt-6 h-18 w-full p-4 flex items-center justify-between roundex-xxl bg-white-100 dark:bg-gray-900'>
              <div className='flex items-center'>
                <div
                  style={{ backgroundColor: '#FFECA8', lineHeight: 28 }}
                  className='relative h-10 w-10 rounded-full flex items-center justify-center text-lg'
                >
                  <span className='leading-none'>👤</span>
                  <img
                    src={chain.chainSymbolImageUrl ?? defaultTokenLogo}
                    onError={imgOnError(defaultTokenLogo)}
                    alt='chain logo'
                    width='16'
                    height='16'
                    className='rounded-full absolute bottom-0 right-0'
                  />
                </div>

                <div className='flex flex-col ml-3'>
                  <Text size='md' color='font-bold dark:text-white-100 text-gray-800'>
                    Proposer
                  </Text>
                  <Text size='xs' color='font-medium text-gray-400'>
                    {`${proposal.proposal.proposer.slice(
                      0,
                      5,
                    )}...${proposal.proposal.proposer.slice(-6)}`}
                  </Text>
                </div>
              </div>

              <button
                className='flex items-center justify-center px-1'
                onClick={() =>
                  window.open(
                    `${txUrl?.replace('txs', 'account')}/${proposal.proposal.proposer}`,
                    '_blank',
                  )
                }
              >
                <span className='material-icons-round text-gray-400 text-[18px]'>open_in_new</span>
              </button>
            </div>
          )}

          <div className='my-8'>
            <LineDivider size='sm' />
          </div>

          {proposal.proposal.description && (
            <ProposalDescription
              description={proposal.proposal.description}
              title='Description'
              btnColor={Colors.getChainColor(activeChain, chain)}
            />
          )}
        </div>

        <NtrnCastVote
          refetchVote={refetch}
          proposalId={proposal.id}
          showCastVoteSheet={showCastVoteSheet}
          setShowCastVoteSheet={setShowCastVoteSheet}
        />
      </PopupLayout>
    </div>
  )
}
