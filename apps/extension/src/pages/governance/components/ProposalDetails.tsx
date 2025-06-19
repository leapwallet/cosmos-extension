/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useActiveChain,
  useAddress,
  useChainApis,
  useChainInfo,
  useGetProposal,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { axiosWrapper, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { GovStore, Proposal, ProposalApi } from '@leapwallet/cosmos-wallet-store'
import { Header, HeaderActionType, LineDivider } from '@leapwallet/leap-ui'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import PopupLayout from 'components/layout/popup-layout'
import { ProposalDescription } from 'components/proposal-description'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { useChainPageInfo } from 'hooks'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import Vote from 'icons/vote'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { PieChart } from 'react-minimal-pie-chart'
import { importWatchWalletSeedPopupStore } from 'stores/import-watch-wallet-seed-popup-store'
import { delegationsStore } from 'stores/stake-store'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'
import { uiErrorTags } from 'utils/sentry'

import { getPercentage } from '../utils'
import GovHeader from './GovHeader'
import { CastVote, RequireMinStaking, ShowVotes, Turnout, VoteDetails } from './index'
import { ProposalStatus, ProposalStatusEnum } from './ProposalStatus'

export type ProposalDetailsProps = {
  selectedProp: string | undefined
  onBack: () => void
  forceChain?: SupportedChain
  forceNetwork?: 'mainnet' | 'testnet'
  governanceStore: GovStore
}

const activeProposalStatusTypes = [
  ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD,
  ProposalStatusEnum.PROPOSAL_STATUS_DEPOSIT_PERIOD,
]

export const ProposalDetails = observer(
  ({ selectedProp, onBack, forceChain, forceNetwork, governanceStore }: ProposalDetailsProps) => {
    const { data: proposalList, shouldUseFallback } = governanceStore.chainProposals

    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])
    const _selectedNetwork = useSelectedNetwork()
    const selectedNetwork = useMemo(
      () => forceNetwork || _selectedNetwork,
      [_selectedNetwork, forceNetwork],
    )
    const { activeWallet } = useActiveWallet()
    const address = useAddress(activeChain)
    const activeChainInfo = useChainInfo(activeChain)
    const { lcdUrl, txUrl } = useChainApis(activeChain, selectedNetwork)
    const [showCastVoteSheet, setShowCastVoteSheet] = useState<boolean>(false)
    const defaultTokenLogo = useDefaultTokenLogo()

    const { delegationInfo } = delegationsStore.delegationsForChain(activeChain)
    const hasMinAmountStaked = useMemo(() => {
      if (activeChain === 'cosmos' || activeChainInfo.chainId === 'atomone-1') {
        return delegationInfo?.totalDelegation?.gte(1)
      }

      return true
    }, [activeChain, delegationInfo?.totalDelegation, activeChainInfo.chainId])

    const { topChainColor } = useChainPageInfo()
    const proposal = useMemo(
      () => (proposalList as any[]).find((prop) => prop.proposal_id === selectedProp),
      [proposalList, selectedProp],
    )

    const isProposalInVotingPeriod = useMemo(() => {
      return [
        ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD,
        ProposalStatusEnum.PROPOSAL_STATUS_IN_PROGRESS,
      ].includes(proposal.status)
    }, [proposal.status])

    const {
      data: currVote,
      refetch,
      isLoading,
    } = useQuery(
      ['currVote', activeChain, address, selectedProp],
      async (): Promise<string | undefined> => {
        if (activeChain) {
          try {
            const { data } = await axios.post(
              `${process.env.LEAP_WALLET_BACKEND_API_URL}/gov/vote/${activeChainInfo.chainId}/${selectedProp}`,
              { userAddress: address },
            )
            return data
          } catch (error: any) {
            try {
              let prefix = '/cosmos'
              if (activeChainInfo?.chainId === 'govgen-1') {
                prefix = '/govgen'
              }
              if (activeChainInfo?.chainId === 'atomone-1') {
                prefix = '/atomone'
              }
              const data = await axiosWrapper(
                {
                  baseURL: lcdUrl ?? '',
                  method: 'get',
                  url: `${prefix}/gov/v1beta1/proposals/${selectedProp}/votes/${address}`,
                },
                1,
                'proposals-votes',
              )

              const voteOption = data.data.vote.options[0].option
              return voteOption.replace('VOTE_OPTION_', '')
            } catch (error: any) {
              if (error.response.data.code === 3 || error.response.data.error?.code === -32700) {
                return 'NO_VOTE'
              } else {
                captureException(error, {
                  tags: uiErrorTags,
                })
                throw new Error(error)
              }
            }
          }
        }
      },
      {
        retry: (failureCount) => {
          return failureCount !== 2
        },
        enabled: isProposalInVotingPeriod,
      },
    )

    // eslint-disable-next-line prefer-const
    let { data: _proposalVotes, status } = useGetProposal(
      proposal.proposal_id,
      shouldUseFallback,
      activeChain,
      selectedNetwork,
    )

    status = shouldUseFallback ? status : 'success'
    const { yes, no, abstain, no_with_veto } = (proposal.tally ||
      _proposalVotes ||
      proposal.final_tally_result) as any
    const totalVotes =
      [yes, no, abstain, no_with_veto].reduce((sum, val) => sum + Number(val ?? 0), 0) || 1

    const dataMock = useMemo(() => {
      if (!totalVotes) {
        return [{ title: 'loading', value: 1, color: '#ccc', percent: '0%' }]
      }
      const data = [
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
      ]
      if (activeChainInfo.chainId !== 'atomone-1') {
        data.push({
          title: 'No with Veto',
          value: +no_with_veto,
          color: '#8583EC',
          percent: getPercentage(+no_with_veto, totalVotes),
        })
      }
      data.push({
        title: 'Abstain',
        value: +abstain,
        color: '#D1A700',
        percent: getPercentage(+abstain, totalVotes),
      })
      return data
    }, [abstain, no, no_with_veto, totalVotes, yes, activeChainInfo.chainId])

    const tallying = useMemo(() => {
      let votingPower = (_proposalVotes as any)?.bonded_tokens
      if (
        ['initia', 'initiaEvm'].includes(activeChain) &&
        Array.isArray(votingPower) &&
        Array.isArray((_proposalVotes as any)?.voting_power_weights)
      ) {
        const bondedTokens: { amount: string; denom: string }[] = (_proposalVotes as any)
          ?.bonded_tokens
        const votingPowerWeights = (_proposalVotes as any)?.voting_power_weights
        votingPower = bondedTokens
          .reduce((acc: bigint, val: { amount: string; denom: string }) => {
            const individualVotingPowerWeight = votingPowerWeights?.find(
              (votingPowerWeight: { amount: string; denom: string }) =>
                votingPowerWeight.denom === val.denom,
            )?.amount
            if (!individualVotingPowerWeight) {
              return acc
            }
            acc += BigInt(parseInt(val.amount)) * BigInt(parseInt(individualVotingPowerWeight))
            return acc
          }, BigInt(0))
          ?.toString()
      }

      return [
        {
          label: 'Turnout',
          value: !shouldUseFallback ? proposal.turnout : (totalVotes / votingPower) * 100,
        },
        {
          label: 'Quorum',
          value: !shouldUseFallback ? proposal.quorum : (_proposalVotes as any)?.quorum * 100,
        },
      ]
    }, [
      _proposalVotes,
      activeChain,
      proposal.quorum,
      proposal.turnout,
      shouldUseFallback,
      totalVotes,
    ])

    const proposer = useMemo(() => {
      if (!shouldUseFallback) {
        return proposal?.proposer?.address
          ? {
              address: proposal?.proposer?.address,
              url:
                proposal?.proposer?.url ??
                `${txUrl?.replace('txs', 'account')}/${proposal?.proposer?.address}`,
            }
          : undefined
      }
      return _proposalVotes?.proposer?.depositor
        ? {
            address: _proposalVotes?.proposer?.depositor as string,
            url: _proposalVotes?.proposerTxUrl as string | undefined,
          }
        : undefined
    }, [
      _proposalVotes?.proposer?.depositor,
      _proposalVotes?.proposerTxUrl,
      proposal?.proposer?.address,
      proposal?.proposer?.url,
      shouldUseFallback,
      txUrl,
    ])

    return (
      <>
        <GovHeader onBack={onBack} title='Proposal' />
        <div className='flex flex-col p-6 overflow-y-scroll'>
          <div className='text-muted-foreground text-sm mb-2 font-medium'>
            #{proposal.proposal_id} ·{' '}
            <ProposalStatus status={proposal.status as ProposalStatusEnum} />
          </div>
          <div className='text-foreground font-bold text-lg break-words'>
            {proposal?.title ?? proposal?.content?.title}
          </div>

          {proposal.status === ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD &&
            !hasMinAmountStaked && (
              <RequireMinStaking forceChain={activeChain} forceNetwork={selectedNetwork} />
            )}

          <VoteDetails
            proposal={proposal}
            activeChain={activeChain}
            onVote={() => {
              if (activeWallet?.watchWallet) {
                importWatchWalletSeedPopupStore.setShowPopup(true)
              } else {
                setShowCastVoteSheet(true)
              }
            }}
            currVote={currVote ?? ''}
            isLoading={isLoading}
            hasMinStaked={hasMinAmountStaked}
          />

          <div className='my-5'></div>

          {proposal.status !== ProposalStatusEnum.PROPOSAL_STATUS_DEPOSIT_PERIOD && totalVotes && (
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

              <ShowVotes dataMock={dataMock} chain={activeChainInfo} />
              <Turnout tallying={tallying} />
            </>
          )}

          {activeProposalStatusTypes.includes(proposal.status) && proposer?.address && (
            <div
              className={`rounded-2xl ${
                ProposalStatusEnum.PROPOSAL_STATUS_DEPOSIT_PERIOD === proposal.status ? '' : 'mt-7'
              } h-20 w-full p-5 flex items-center justify-between roundex-xxl bg-secondary-100`}
            >
              <div className='flex items-center'>
                <div
                  style={{ backgroundColor: '#FFECA8', lineHeight: 28 }}
                  className='relative h-10 w-10 rounded-full flex items-center justify-center text-lg'
                >
                  <span className='leading-none'>👤</span>
                  <img
                    src={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
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
                  {proposer ? (
                    <Text size='xs' color='text-muted-foreground'>
                      {`${proposer.address.slice(0, 5)}...${proposer.address.slice(-6)}`}
                    </Text>
                  ) : (
                    <Skeleton count={1} height='16px' width='150px' className='z-0' />
                  )}
                </div>
              </div>

              {proposer?.url && (
                <button
                  className='flex items-center justify-center px-1'
                  onClick={() => window.open(proposer?.url, '_blank')}
                >
                  <ArrowSquareOut size={18} className='text-muted-foreground' />
                </button>
              )}
            </div>
          )}

          <div className='mt-7'></div>

          {(proposal?.description || proposal?.content?.description) && (
            <ProposalDescription
              description={proposal?.description || proposal?.content?.description}
              title='Description'
              btnColor={topChainColor}
              forceChain={activeChain}
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
              disabled={!hasMinAmountStaked}
            >
              <div className={'flex justify-center text-white-100 items-center'}>
                <Vote size={20} className='mr-2' />
                <span>Vote</span>
              </div>
            </Button>
          </div>
        )}

        <CastVote
          refetchVote={refetch}
          proposalId={proposal.proposal_id}
          isProposalInVotingPeriod={isProposalInVotingPeriod}
          showCastVoteSheet={showCastVoteSheet}
          setShowCastVoteSheet={setShowCastVoteSheet}
          forceChain={activeChain}
          forceNetwork={selectedNetwork}
        />
      </>
    )
  },
)
