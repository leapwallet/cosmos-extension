import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import React, { useState } from 'react'

import BottomNav, { BottomNavLabel } from '~/components/bottom-nav'
import CardDivider from '~/components/card-divider'
import EmptyCard from '~/components/empty-card'
import PopupLayout from '~/components/popup-layout'
import SelectChain from '~/components/select-chain'
import SideNav from '~/components/side-nav'
import { GovCardSkeleton } from '~/components/skeletons'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { Images } from '~/images'
import { ChainLogos } from '~/images/logos'
import { sliceSearchWord } from '~/util/strings'

import Status, { ProposalStatus } from './status'

export type ProposalListProps = {
  onClick: (proposal: string) => void
  proposalList: any[]
  proposalListStatus: 'success' | 'error' | 'loading'
}

function ProposalList({
  onClick,
  proposalList: _proposalList,
  proposalListStatus,
}: ProposalListProps) {
  const [propFilter, setPropFilter] = useState<string>('')
  const handleFilterChange = (event: React.FormEvent<HTMLInputElement>) => {
    setPropFilter(event.currentTarget.value.toLowerCase())
  }
  const [showSideNav, setShowSideNav] = useState(false)
  const [showChainSelector, setShowChainSelector] = useState(false)
  const activeChain = useActiveChain()

  const loading = proposalListStatus !== 'success' && proposalListStatus !== 'error'

  const proposalList = _proposalList?.filter(
    (proposal) =>
      proposal.content.title.toLowerCase().includes(propFilter) ||
      proposal.proposal_id.toLowerCase().includes(propFilter),
  )

  return (
    <div className='relative w-full overflow-clip'>
      <PopupLayout
        showBetaTag
        header={
          <Header
            action={{
              onClick: function noRefCheck() {
                setShowSideNav(true)
              },
              type: HeaderActionType.NAVIGATION,
            }}
            imgSrc={ChainLogos[activeChain]}
            onImgClick={function noRefCheck() {
              setShowChainSelector(true)
            }}
            title='Governance'
            topColor={ChainInfos[activeChain].theme.primaryColor}
          />
        }
      >
        <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
        <div className='w-full flex flex-col pt-6 pb-2 px-7 sticky top-[72px] bg-gray-50 dark:bg-black-100'>
          <div className='text-[28px] text-black-100 dark:text-white-100 font-bold'>Proposals</div>
          <div className='text-sm text-gray-600 '>
            List of proposals in {activeChain.toUpperCase()}
          </div>
          <div className='w-full flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] mt-6 mb-4 py-2 pl-5 pr-[10px]'>
            <input
              placeholder='search proposals...'
              className='flex flex-grow text-base text-gray-600 dark:text-gray-200  outline-none bg-white-0'
              onChange={handleFilterChange}
            />
            <img src={Images.Misc.SearchIcon} />
          </div>
        </div>
        <div className='overflow-y-auto pb-20'>
          <div className='rounded-2xl flex flex-col items-center mx-7 m-auto justify-center dark:bg-gray-900 bg-white-100'>
            {loading && <GovCardSkeleton />}
            {!loading && !proposalList?.length && (
              <EmptyCard
                isRounded
                subHeading={propFilter ? 'Please try again with something else' : ''}
                heading={
                  propFilter
                    ? 'No results for “' + sliceSearchWord(propFilter) + '”'
                    : 'No Proposals'
                }
                src={Images.Misc.Explore}
              />
            )}
            {!loading &&
              proposalList?.map((prop: any, index: number) => {
                const isLast = index === proposalList.length - 1
                return (
                  <div key={prop.proposal_id} className='w-full'>
                    <div
                      className='p-4 flex items-center cursor-pointer'
                      onClick={() => onClick(prop.proposal_id)}
                    >
                      <div className='w-[90%]'>
                        <div className='flex flex-col'>
                          <div className='text-black-100 dark:text-white-100 font-bold text-base'>
                            {prop.content.title}
                          </div>
                          <div className='text-gray-600 dark:text-gray-200 text-xs'>
                            #{prop.proposal_id} ·{' '}
                            <Status status={prop.status as unknown as ProposalStatus} />
                          </div>
                        </div>
                      </div>
                      <img className='ml-5' src={Images.Misc.RightArrow} />
                    </div>
                    {!isLast && <CardDivider />}
                  </div>
                )
              })}
          </div>
        </div>
      </PopupLayout>
      <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
      <BottomNav label={BottomNavLabel.Governance} />
    </div>
  )
}

export default ProposalList
