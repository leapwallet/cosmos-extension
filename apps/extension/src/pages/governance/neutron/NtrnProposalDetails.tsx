import {
  Proposal,
  ProposalApi,
  useActiveChain,
  useAddress,
  useChainApis,
  useChainsStore,
} from '@leapwallet/cosmos-wallet-hooks'
import { getNeutronProposalVote, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons } from '@leapwallet/leap-ui'
import { ArrowSquareOut, ThumbsUp, User } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import classNames from 'classnames'
import { ProposalDescription } from 'components/proposal-description'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import dayjs from 'dayjs'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import Vote from 'icons/vote'
import React, { useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { PieChart } from 'react-minimal-pie-chart'
import { importWatchWalletSeedPopupStore } from 'stores/import-watch-wallet-seed-popup-store'
import { Colors } from 'theme/colors'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'

import { ProposalStatusEnum, ShowVotes, Turnout } from '../components'
import GovHeader from '../components/GovHeader'
import { convertTime, getPercentage, voteRatio } from '../utils'
import { NtrnCastVote, NtrnStatus } from './index'
import { NtrnProposalStatus } from './NtrnStatus'
import {
  getDescription,
  getEndTime,
  getId,
  getProposer,
  getQuorum,
  getStatus,
  getTitle,
  getTurnout,
  getVotes,
  VoteOptions,
} from './utils'

type VoteDetailsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  proposal: any
  onVote: () => void
  currVote: string
  isLoading: boolean
  shouldUseFallback: boolean
  forceChain?: SupportedChain
}

function VoteDetails({
  proposal,
  onVote,
  currVote,
  isLoading,
  shouldUseFallback,
  forceChain,
}: VoteDetailsProps) {
  const [timeLeft, setTimeLeft] = useState<string | undefined>()
  const _activeChain = useActiveChain()
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

  useEffect(() => {
    const getTime = () => {
      const now = dayjs()
      const end = dayjs(getEndTime(proposal, shouldUseFallback))
      const duration = end.diff(now, 'seconds')
      setTimeLeft(convertTime(duration))
    }

    const intervalId = setInterval(getTime, 1000)
    return () => clearInterval(intervalId)
  }, [proposal, shouldUseFallback])

  switch (getStatus(proposal, shouldUseFallback)) {
    case NtrnProposalStatus.OPEN:
    case ProposalStatusEnum.PROPOSAL_STATUS_IN_PROGRESS:
    case ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD:
      return (
        <>
          <div className='rounded-2xl bg-white-100 dark:bg-gray-900 flex flex-col mt-4'>
            <div className='flex items-center justify-between gap-3 p-4'>
              <div className='text-black-100 dark:text-white-100 text-base font-bold'>
                Voting Ends
              </div>
              <div className='text-black-100 dark:text-white-100 text-sm font-bold'>
                {dayjs(getEndTime(proposal, shouldUseFallback)).format('MMM DD, YYYY')}
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
                <ThumbsUp size={16} className='text-green-700' />
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
              <ThumbsUp size={16} className='mr-2' />
              <span>Vote</span>
            </div>
          </Buttons.Generic>
        </>
      )

    case NtrnProposalStatus.EXECUTED:
    case NtrnProposalStatus.PASSED:
    case NtrnProposalStatus.REJECTED:
    case ProposalStatusEnum.PROPOSAL_STATUS_PASSED:
    case ProposalStatusEnum.PROPOSAL_STATUS_EXECUTED:
    case ProposalStatusEnum.PROPOSAL_STATUS_FAILED:
    case ProposalStatusEnum.PROPOSAL_STATUS_REJECTED:
      return (
        <div className='rounded-2xl bg-white-100 dark:bg-gray-900 flex flex-col mt-4'>
          <div className='flex items-center gap-3 p-4'>
            <div className='text-gray-600 w-[200px] dark:text-gray-200 text-xs font-bold'>
              Results
            </div>
            <div className='text-gray-600 dark:text-gray-200 text-xs font-bold'></div>
          </div>
          <div className='flex flex-col justify-center gap-3 p-4'>
            {voteRatio(getVotes(proposal, shouldUseFallback))
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

type NtrnProposalDetailsProps = {
  selectedProp: string | undefined
  onBack: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  proposalList: any[]
  shouldUseFallback: boolean
  forceChain?: SupportedChain
  forceNetwork?: 'mainnet' | 'testnet'
}

export function NtrnProposalDetails({
  selectedProp,
  onBack,
  proposalList,
  shouldUseFallback,
  forceChain,
  forceNetwork,
}: NtrnProposalDetailsProps) {
  const { chains } = useChainsStore()
  const { activeWallet } = useActiveWallet()
  const _activeChain = useActiveChain()
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])
  const _selectedNetwork = useSelectedNetwork()
  const selectedNetwork = useMemo(
    () => forceNetwork || _selectedNetwork,
    [_selectedNetwork, forceNetwork],
  )

  const address = useAddress(activeChain)
  const chain = chains[activeChain]
  const { rpcUrl, txUrl } = useChainApis(activeChain, selectedNetwork)
  const defaultTokenLogo = useDefaultTokenLogo()
  const [showCastVoteSheet, setShowCastVoteSheet] = useState(false)

  const proposal = useMemo(
    () =>
      proposalList.find(
        (_proposal) => (shouldUseFallback ? _proposal.id : _proposal.proposal_id) === selectedProp,
      ),
    [proposalList, selectedProp, shouldUseFallback],
  )
  const { abstain, yes, no } = shouldUseFallback ? proposal.proposal.votes : proposal.tally
  const totalVotes = [yes, no, abstain].reduce((sum, val) => sum + Number(val), 0)

  const isProposalInVotingPeriod = useMemo(() => {
    return [
      NtrnProposalStatus.OPEN,
      ProposalStatusEnum.PROPOSAL_STATUS_IN_PROGRESS,
      ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD,
    ].includes(getStatus(proposal, shouldUseFallback))
  }, [proposal, shouldUseFallback])

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
        value: getTurnout(proposal, totalVotes, shouldUseFallback),
      },
      {
        label: 'Quorum',
        value: getQuorum(proposal, shouldUseFallback),
      },
    ]
  }, [proposal, shouldUseFallback, totalVotes])

  const {
    data: currVote,
    refetch,
    isLoading,
  } = useQuery(
    ['neutron-currVote', activeChain, address, selectedProp, rpcUrl],
    async function () {
      try {
        const { data } = await axios.post(
          `${process.env.LEAP_WALLET_BACKEND_API_URL}/gov/vote/${chain.chainId}/${selectedProp}`,
          { userAddress: address },
        )
        return { vote: data }
      } catch (err) {
        return await getNeutronProposalVote(rpcUrl ?? '', Number(selectedProp ?? ''), address)
      }
    },
    {
      retry: (failureCount) => failureCount <= 2,
      enabled: isProposalInVotingPeriod && !!rpcUrl,
    },
  )

  return (
    <>
      <GovHeader onBack={onBack} title='Proposal' />
      <div className='flex flex-col p-6 overflow-y-scroll'>
        <div className='text-muted-foreground text-sm mb-2 font-medium'>
          #{getId(proposal, shouldUseFallback)} ·{' '}
          <NtrnStatus status={getStatus(proposal, shouldUseFallback)} />
        </div>
        <div className='text-foreground font-bold text-lg break-words'>
          {getTitle(proposal, shouldUseFallback)}
        </div>

        <VoteDetails
          proposal={proposal}
          onVote={() => setShowCastVoteSheet(true)}
          currVote={currVote?.vote}
          isLoading={isLoading}
          shouldUseFallback={shouldUseFallback}
          forceChain={forceChain}
        />

        <div className='my-5'></div>

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

        {isProposalInVotingPeriod && (
          <div className='rounded-2xl mt-7 h-20 w-full p-5 flex items-center justify-between roundex-xxl bg-secondary-100'>
            <div className='flex items-center'>
              <div
                style={{ backgroundColor: '#FFECA8', lineHeight: 28 }}
                className='relative h-10 w-10 rounded-full flex items-center justify-center text-lg'
              >
                <User size={16} className='leading-none' />
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
                <Text size='sm' color='text-foreground' className='font-bold'>
                  Proposer
                </Text>
                <Text size='xs' color='text-muted-foreground'>
                  {`${getProposer(proposal, shouldUseFallback).slice(0, 5)}...${getProposer(
                    proposal,
                    shouldUseFallback,
                  ).slice(-6)}`}
                </Text>
              </div>
            </div>

            <button
              className='flex items-center justify-center px-1'
              onClick={() =>
                window.open(
                  `${txUrl?.replace('txs', 'account')}/${getProposer(proposal, shouldUseFallback)}`,
                  '_blank',
                )
              }
            >
              <ArrowSquareOut size={18} className='text-gray-400' />
            </button>
          </div>
        )}

        <div className='mt-7'></div>

        {getDescription(proposal, shouldUseFallback) && (
          <ProposalDescription
            description={getDescription(proposal, shouldUseFallback)}
            title='Description'
            btnColor={Colors.getChainColor(activeChain, chain)}
            forceChain={forceChain}
          />
        )}
      </div>

      {(proposal as Proposal | ProposalApi).status ===
        ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD && (
        <div className='w-full p-4 mt-auto sticky bottom-0 bg-secondary-100 '>
          <Button
            className={cn('w-full')}
            onClick={() => {
              if (activeWallet?.watchWallet) {
                importWatchWalletSeedPopupStore.setShowPopup(true)
              } else {
                setShowCastVoteSheet(true)
              }
            }}
          >
            <div className={'flex justify-center text-white-100 items-center'}>
              <Vote size={20} className='mr-2' />
              <span>Vote</span>
            </div>
          </Button>
        </div>
      )}

      <NtrnCastVote
        refetchVote={refetch}
        proposalId={getId(proposal, shouldUseFallback)}
        isProposalInVotingPeriod={isProposalInVotingPeriod}
        showCastVoteSheet={showCastVoteSheet}
        setShowCastVoteSheet={setShowCastVoteSheet}
        forceChain={forceChain}
        forceNetwork={forceNetwork}
      />
    </>
  )
}
