import { useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ChainTagsStore, GovStore } from '@leapwallet/cosmos-wallet-store'
import { useTheme } from '@leapwallet/leap-ui'
import GovCardSkeleton from 'components/Skeletons/GovCardSkeleton'
import { SearchInput } from 'components/ui/input/search-input'
import { CompassIcon } from 'icons/compass-icon'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Virtuoso } from 'react-virtuoso'

import { filterSearchedProposal, sortProposal } from '../utils'
import GenericProposalDetails from './GenericProposalDetails'
import GovHeader from './GovHeader'
import { ProposalCard } from './index'

const NETWORK = 'mainnet'

export type ProposalsProps = {
  governanceStore: GovStore
  chainTagsStore: ChainTagsStore
}

export const AggregatedGovernance = observer(
  ({ governanceStore, chainTagsStore }: ProposalsProps) => {
    const navigate = useNavigate()
    const { theme } = useTheme()
    const [showChainSelector, setShowChainSelector] = useState(false)

    const { votingProposals, nonVotingProposals, perChainShouldUseFallback } =
      governanceStore.aggregatedGov

    const isLoading = governanceStore.aggregatedGovStatus

    const chains = useGetChains()
    const [showSearchInput, setShowSearchInput] = useState(false)
    const [searchedText, setSearchedText] = useState('')
    const [selectedProposalId, setSelectedProposalId] = useState<string | undefined>()
    const [shouldUseFallback, setShouldUseFallback] = useState(false)
    const [selectedProposalChain, setSelectedProposalChain] = useState<SupportedChain | undefined>()

    const allProposals = useMemo(() => {
      const formattedVotingProposals = votingProposals
        .filter((proposal) => filterSearchedProposal(proposal, searchedText, chains))
        .sort((itemA, itemB) => sortProposal(itemA, itemB, chains))

      const formattedNonVotingProposals = nonVotingProposals
        .filter((proposal) => filterSearchedProposal(proposal, searchedText, chains))
        .sort((itemA, itemB) => sortProposal(itemA, itemB, chains))

      return [...formattedVotingProposals, ...formattedNonVotingProposals]
    }, [votingProposals, nonVotingProposals, searchedText, chains])

    const handleProposalCardClick = useCallback(
      (proposalId: string, chain: SupportedChain) => {
        setSelectedProposalId(proposalId)
        setShouldUseFallback(perChainShouldUseFallback[chain])
        setSelectedProposalChain(chain)
      },
      [perChainShouldUseFallback],
    )

    const handleProposalDetailsBack = useCallback(() => {
      setSelectedProposalId(undefined)
      setSelectedProposalChain(undefined)
      setShouldUseFallback(false)
    }, [])

    return (
      <>
        {selectedProposalId && selectedProposalChain ? (
          <GenericProposalDetails
            selectedProposalChain={selectedProposalChain}
            selectedProposalId={selectedProposalId}
            handleProposalDetailsBack={handleProposalDetailsBack}
            allProposals={allProposals}
            forceNetwork={NETWORK}
            shouldUseFallback={shouldUseFallback}
          />
        ) : (
          <>
            <GovHeader />
            <div className='flex flex-col p-6 !pb-0 h-full'>
              <div className='flex flex-col items-center w-full pb-6'>
                <SearchInput
                  onClear={() => setSearchedText('')}
                  placeholder='Search proposal'
                  onChange={(e) => setSearchedText(e.target.value)}
                  value={searchedText}
                />
              </div>

              <div className='flex h-full'>
                {isLoading ? (
                  <div className='w-full flex flex-col gap-3'>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <GovCardSkeleton key={index} isLast={index === 4} aggregatedView />
                    ))}
                  </div>
                ) : allProposals.length > 0 ? (
                  <Virtuoso
                    data={allProposals}
                    style={{ flexGrow: '1', width: '100%' }}
                    itemContent={(index, proposal) => (
                      <ProposalCard
                        proposal={proposal}
                        handleClick={() =>
                          handleProposalCardClick(
                            allProposals[index].proposal_id,
                            (allProposals[index]?.chain || 'cosmos') as SupportedChain,
                          )
                        }
                      />
                    )}
                  />
                ) : (
                  <>
                    <div className='w-full pb-6 h-full '>
                      <div className='h-full px-5 w-full flex-col flex justify-center items-center gap-4 border border-secondary-200 rounded-2xl'>
                        <div className='p-2 bg-secondary-200 rounded-full'>
                          <CompassIcon size={40} className='text-muted-foreground' />
                        </div>
                        <div className='flex flex-col justify-start items-center w-full gap-3'>
                          <div className='text-[18px] !leading-[24px] text-center font-bold text-foreground'>
                            No proposals found
                          </div>
                          {searchedText.trim().length > 0 ? (
                            <div className='text-xs !leading-[16px] text-secondary-800 text-center'>
                              We couldn&apos;t find a match. Try searching again or use a different
                              keyword.
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </>
    )
  },
)
