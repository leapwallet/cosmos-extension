import { sliceSearchWord, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { GovStore } from '@leapwallet/cosmos-wallet-store'
import { Header, HeaderActionType, ThemeName, useTheme } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { AggregatedSearchComponent } from 'components/aggregated'
import { EmptyCard } from 'components/empty-card'
import PopupLayout from 'components/layout/popup-layout'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import SelectChain from 'pages/home/SelectChain'
import React, { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { VariableSizeList } from 'react-window'
import { isSidePanel } from 'utils/isSidePanel'

import { filterSearchedProposal, sortProposal } from '../utils'
import GenericProposalDetails from './GenericProposalDetails'
import { ProposalCard } from './index'

const NETWORK = 'mainnet'

export type ProposalsProps = {
  governanceStore: GovStore
}

export const AggregatedGovernance = observer(({ governanceStore }: ProposalsProps) => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [showChainSelector, setShowChainSelector] = useState(false)

  const { votingProposals, nonVotingProposals, perChainShouldUseFallback } =
    governanceStore.aggregatedGov

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
    <div className='relative w-full overflow-clip enclosing-panel panel-height'>
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
          <PopupLayout
            header={
              <Header
                action={{
                  onClick: () => navigate(-1),
                  type: HeaderActionType.BACK,
                }}
                imgSrc={
                  theme === ThemeName.DARK
                    ? Images.Misc.AggregatedViewDarkSvg
                    : Images.Misc.AggregatedViewSvg
                }
                onImgClick={() => setShowChainSelector(true)}
                title='Governance'
              />
            }
          >
            <div className='flex flex-col pt-[16px] px-[24px]'>
              {showSearchInput ? (
                <AggregatedSearchComponent
                  handleClose={() => {
                    setShowSearchInput(false)
                    setSearchedText('')
                  }}
                  handleChange={(value) => setSearchedText(value)}
                  value={searchedText}
                  placeholder='Search proposal'
                />
              ) : (
                <h1 className='flex items-center justify-between text-black-100 dark:text-white-100'>
                  <span className='text-[24px] font-[700]'>Governance</span>

                  <button
                    className='bg-white-100 dark:bg-gray-950 w-[40px] h-[40px] rounded-full flex items-center justify-center'
                    onClick={() => setShowSearchInput(true)}
                  >
                    <img
                      src={Images.Misc.SearchWhiteIcon}
                      className='w-[24px] h-[24px] invert dark:invert-0'
                    />
                  </button>
                </h1>
              )}

              <div className={classNames({ 'mt-4': !showSearchInput })}>
                {allProposals.length > 0 ? (
                  <VariableSizeList
                    itemCount={allProposals.length}
                    width={352}
                    height={isSidePanel() ? Number(window.innerHeight - 160) : 440}
                    itemSize={() => 124}
                  >
                    {({ index, style }) => (
                      <div style={style}>
                        <ProposalCard
                          proposal={allProposals[index]}
                          handleClick={() =>
                            handleProposalCardClick(
                              allProposals[index].proposal_id,
                              (allProposals[index]?.chain || 'cosmos') as SupportedChain,
                            )
                          }
                        />
                      </div>
                    )}
                  </VariableSizeList>
                ) : (
                  <>
                    {searchedText.trim().length > 0 ? (
                      <EmptyCard
                        isRounded
                        subHeading='Please try again with something else'
                        heading={'No results for “' + sliceSearchWord(searchedText) + '”'}
                        src={Images.Misc.Explore}
                        classname='dark:!bg-gray-950'
                        imgContainerClassname='dark:!bg-gray-900'
                      />
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </PopupLayout>

          <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
        </>
      )}
    </div>
  )
})
