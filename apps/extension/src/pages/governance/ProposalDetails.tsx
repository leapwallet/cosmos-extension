/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-children-prop */
import { useChainApis, useChainsStore, useGetProposal } from '@leapwallet/cosmos-wallet-hooks'
import { axiosWrapper, ChainInfo, CoinType } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, CardDivider, Header, HeaderActionType, LineDivider } from '@leapwallet/leap-ui'
import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import PopupLayout from 'components/layout/popup-layout'
import { ProposalDescription } from 'components/proposal-description'
import Text from 'components/text'
import dayjs from 'dayjs'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useHorizontalScroll from 'hooks/useHorizontalScroll'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { useAddress } from 'hooks/wallet/useAddress'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { PieChart } from 'react-minimal-pie-chart'
import { Colors } from 'theme/colors'
import { voteRatio } from 'utils/gov/voteRatio'
import { imgOnError } from 'utils/imgOnError'

import { CastVote } from './CastVote'
import Status, { ProposalStatus } from './Status'

export type ProposalDetailsProps = {
  selectedProp: string | undefined
  onBack: () => void
  proposalList: any[]
}

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

type IShowVotes = {
  dataMock: {
    title: string
    value: number
    color: string
    percent: string
  }[]
  chain: ChainInfo
}

const chainDecimals: Record<CoinType, number> = {
  '60': 18,
  '118': 6,
  '529': 6,
  '750': 6,
  '394': 8,
  '234': 6,
  '564': 6,
  '852': 6,
  '639': 6,
  '459': 6,
  '330': 6,
  '990': 6,
  '931': 6,
  '4444': 6,
}

const ShowVotes = ({ dataMock, chain }: IShowVotes) => {
  const { scrollRef, props } = useHorizontalScroll<HTMLDivElement>()
  const decimals =
    Object.values(chain.nativeDenoms)?.[0]?.coinDecimals ??
    (chainDecimals as any)[chain.bip44.coinType]

  return (
    <div className='h-[52px]'>
      <div
        className='flex items-start no-scrollbar overflow-y-auto whitespace-nowrap'
        ref={scrollRef}
        {...props}
      >
        {dataMock.map((item) => {
          const isLoading = item.title === 'loading'
          return (
            <div
              key={item.color}
              className={`px-3 py-2 dark:bg-gray-900 bg-white-100 rounded-[12px] mr-3${
                isLoading ? ' w-[150px]' : ''
              }`}
            >
              {isLoading ? (
                <Skeleton count={2} />
              ) : (
                <>
                  <div className='flex items-center'>
                    <div
                      className='rounded-[2px] w-3 h-3 mr-1'
                      style={{ backgroundColor: item.color }}
                    />
                    <p className='dark:text-white-100 text-gray-400 whitespace-nowrap text-xs font-bold'>{`${item.title} - ${item.percent}`}</p>
                  </div>
                  <Text
                    size='xs'
                    color='text-gray-400 font-medium whitespace-nowrap'
                    style={{ lineHeight: '20px' }}
                  >
                    {`${new Intl.NumberFormat('en-US').format(
                      +Number(item.value / Math.pow(10, decimals)).toFixed(2),
                    )} ${chain.denom}`}
                  </Text>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function VoteDetails({
  selectedProp,
  onVote,
  proposalList,
  currVote,
  isLoading,
}: {
  selectedProp: string
  onVote: () => void
  proposalList: any[]
  currVote: string
  isLoading: boolean
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal, convertTime])

  switch (proposal.status) {
    case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
      return (
        <>
          <div className='rounded-2xl bg-white-100 dark:bg-gray-900 flex flex-col mt-4'>
            <div className='flex items-center justify-between gap-3 p-4'>
              <div className='text-black-100 dark:text-white-100 text-base font-bold'>
                Voting Starts
              </div>
              <div className='text-black-100 dark:text-white-100 text-sm font-bold'>
                {dayjs(proposal.voting_start_time).format('MMM DD, YYYY')}
              </div>
            </div>
            <CardDivider />
            <div className='flex items-center justify-between gap-3 p-4'>
              <div className='text-black-100 dark:text-white-100 text-base font-bold'>
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
                <div className='text-sm text-gray-600 font-medium'>Voted {currVote}</div>
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
    case ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD:
      return (
        <>
          <div className='rounded-2xl bg-white-100 dark:bg-gray-900 flex flex-col mt-4'>
            <div className='flex items-center justify-between gap-3 p-4'>
              <div className='text-black-100 dark:text-white-100 text-base font-bold'>
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
        </>
      )
  }

  return <></>
}

type ITally = {
  label: string
  value: number
}
const Turnout = ({ tallying }: { tallying: ITally[] }) => {
  const [detail, showDetail] = useState('')
  return (
    <>
      <div className='rounded-2xl mt-6 h-18 w-full roundex-xxl bg-white-100 dark:bg-gray-900'>
        {tallying.map((tally, index) => (
          <Fragment key={tally.label}>
            <div className='flex items-center justify-between p-4' key={tally.label}>
              <div className='flex flex-row items-center'>
                <p className='text-md font-bold text-gray-800 dark:text-white-100'>{tally.label}</p>
                <button onClick={() => showDetail(tally.label)} className='h-[18px] w-[18px]'>
                  <span
                    className='material-icons-round text-gray-400 ml-1'
                    style={{ fontSize: '18px' }}
                  >
                    info
                  </span>
                </button>
              </div>
              {tally.value ? (
                <p className='text-sm font-bold text-gray-800 dark:text-white-100'>
                  {`${Number(tally.value).toFixed(2)}%`}
                </p>
              ) : (
                <Skeleton count={1} width='50px' />
              )}
            </div>
            {index === 0 && <CardDivider />}
          </Fragment>
        ))}
      </div>
      <BottomSheet
        isVisible={!!detail}
        onClose={() => showDetail('')}
        headerTitle={detail}
        headerActionType={HeaderActionType.CANCEL}
        closeOnClickBackDrop
      >
        <Text size='sm' color='w-[344px] m-auto text-gray-800 dark:text-white-100 my-10'>
          {detail === 'Turnout'
            ? 'Defined as the percentage of voting power already casted on a proposal  as a percentage of total staked tokens.'
            : 'Defined as the minimum percentage of voting power that needs to be cast on a proposal for the result to be valid.'}
        </Text>
      </BottomSheet>
    </>
  )
}

const getPercentage = (a: number, b: number) => {
  if (b === 0) return '0%'
  return `${Number((a / b) * 100).toFixed(2)}%`
}

const activeProposalStatusTypes = [
  ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD,
  ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD,
]

function ProposalDetails({ selectedProp, onBack, proposalList }: ProposalDetailsProps) {
  const { chains } = useChainsStore()
  const activeChain = useActiveChain()
  const address = useAddress()

  const chain = chains[activeChain]
  const { lcdUrl } = useChainApis()

  const [showCastVoteSheet, setShowCastVoteSheet] = useState<boolean>(false)

  const proposal = useMemo(
    () => proposalList.find((prop) => prop.proposal_id === selectedProp),
    [proposalList, selectedProp],
  )

  const defaultTokenLogo = useDefaultTokenLogo()

  const {
    data: currVote,
    refetch,
    isLoading,
  } = useQuery(
    ['currVote', activeChain, address, selectedProp],
    async (): Promise<string | undefined> => {
      if (activeChain) {
        try {
          const data = await axiosWrapper({
            baseURL: lcdUrl ?? '',
            method: 'get',
            url: `/cosmos/gov/v1beta1/proposals/${selectedProp}/votes/${address}`,
          })

          const voteOption = data.data.vote.options[0].option
          return voteOption.replace('VOTE_OPTION_', '')
        } catch (e: any) {
          if (e.response.data.code === 3) {
            return 'NO_VOTE'
          } else {
            throw new Error(e)
          }
        }
      }
    },
    {
      retry: (failureCount) => {
        return failureCount !== 2
      },
      enabled: proposal.status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD,
    },
  )

  const { data: _proposalVotes, status } = useGetProposal(proposal.proposal_id, true)
  const { yes, no, abstain, no_with_veto } = (_proposalVotes || proposal.final_tally_result) as any
  const totalVotes = [yes, no, abstain, no_with_veto].reduce((sum, val) => sum + Number(val), 0)

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
            title: 'No with Veto',
            value: +no_with_veto,
            color: '#8583EC',
            percent: getPercentage(+no_with_veto, totalVotes),
          },
          {
            title: 'Abstain',
            value: +abstain,
            color: '#D1A700',
            percent: getPercentage(+abstain, totalVotes),
          },
        ]
  }, [abstain, no, no_with_veto, totalVotes, yes])

  const tallying = useMemo(() => {
    return [
      {
        label: 'Turnout',
        value: (totalVotes / (_proposalVotes as any)?.bonded_tokens) * 100,
      },
      { label: 'Quorum', value: (_proposalVotes as any)?.quorum * 100 },
    ]
  }, [_proposalVotes, totalVotes])

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
            #{proposal.proposal_id} ·{' '}
            <Status status={proposal.status as unknown as ProposalStatus} />
          </div>
          <div className='text-black-100 dark:text-white-100 font-bold text-xl break-words'>
            {proposal.content.title}
          </div>
          <VoteDetails
            selectedProp={proposal.proposal_id}
            onVote={() => setShowCastVoteSheet(true)}
            proposalList={proposalList}
            currVote={currVote as string}
            isLoading={isLoading}
          />
          <div className='my-8'>
            <LineDivider size='sm' />
          </div>
          {proposal.status !== ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD && totalVotes && (
            <>
              <div className='w-full h-full flex items-center justify-center mb-8'>
                <div className='w-[180px] h-[180px] flex items-center justify-center relative'>
                  {status !== 'success' ? (
                    <Skeleton circle={true} count={1} width='180px' height='180px' />
                  ) : (
                    <PieChart data={dataMock} lineWidth={20} />
                  )}
                  <p className='text-md dark:text-white-100 text-dark-gray font-bold absolute'>
                    Current Status
                  </p>
                </div>
              </div>
              <ShowVotes dataMock={dataMock} chain={chain} />
              <Turnout tallying={tallying} />
            </>
          )}
          {activeProposalStatusTypes.includes(proposal.status) && (
            <div
              className={`rounded-2xl ${
                ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD === proposal.status ? '' : 'mt-6'
              } h-18 w-full p-4 flex items-center justify-between roundex-xxl bg-white-100 dark:bg-gray-900`}
            >
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
                  {_proposalVotes?.proposer ? (
                    <Text size='xs' color='font-medium text-gray-400'>
                      {`${_proposalVotes.proposer.depositor.slice(
                        0,
                        5,
                      )}...${_proposalVotes.proposer.depositor.slice(-6)}`}
                    </Text>
                  ) : (
                    <Skeleton count={1} height='16px' width='150px' className='z-0' />
                  )}
                </div>
              </div>
              {_proposalVotes?.proposerTxUrl && (
                <button
                  className='flex items-center justify-center px-1'
                  onClick={() => window.open(_proposalVotes?.proposerTxUrl, '_blank')}
                >
                  <span className='material-icons-round text-gray-400 text-[18px]'>
                    open_in_new
                  </span>
                </button>
              )}
            </div>
          )}
          <div className='my-8'>
            <LineDivider size='sm' />
          </div>
          {proposal.content.description && (
            <ProposalDescription
              description={proposal.content.description}
              title='Description'
              btnColor={Colors.getChainColor(activeChain, chain)}
            />
          )}
        </div>
        <CastVote
          refetchVote={refetch}
          proposalId={proposal.proposal_id}
          showCastVoteSheet={showCastVoteSheet}
          setShowCastVoteSheet={setShowCastVoteSheet}
        />
      </PopupLayout>
    </div>
  )
}

export default ProposalDetails
