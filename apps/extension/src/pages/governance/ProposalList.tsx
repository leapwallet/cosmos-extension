/* eslint-disable @typescript-eslint/no-explicit-any */
import { Proposal, useStaking } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, Header, HeaderActionType } from '@leapwallet/leap-ui'
import SelectedChainAlertStrip from 'components/alert-strip/SelectedChainAlertStrip'
import BottomModal from 'components/bottom-modal'
import { EmptyCard } from 'components/empty-card'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import { SearchInput } from 'components/search-input'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import SelectChain from 'pages/home/SelectChain'
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'theme/colors'
import { sliceSearchWord } from 'utils/strings'

import GovCardSkeleton from '../../components/Skeletons/GovCardSkeleton'
import RequireMinStaking from './RequireMinStaking'
import Status, { ProposalStatus } from './Status'

export type ProposalListProps = {
  // eslint-disable-next-line no-unused-vars
  onClick: (proposal: string) => void
  proposalList: any[]
  proposalListStatus: 'success' | 'error' | 'loading' | 'fetching-more'
  fetchMore: () => void
  shouldPreferFallback?: boolean
}

const filters = [
  { key: 'all', label: 'All Proposals' },
  { key: ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD, label: 'Voting in Progress' },
  { key: ProposalStatus.PROPOSAL_STATUS_PASSED, label: 'Passed' },
  { key: ProposalStatus.PROPOSAL_STATUS_REJECTED, label: 'Rejected' },
]

function ProposalList({
  onClick,
  proposalList: _proposalList,
  proposalListStatus,
  fetchMore,
}: ProposalListProps) {
  const chainInfos = useChainInfos()
  const [propFilter, setPropFilter] = useState<string>('')
  const handleFilterChange = (event: React.FormEvent<HTMLInputElement>) => {
    setPropFilter(event.currentTarget.value.toLowerCase())
  }
  const navigate = useNavigate()

  const defaultTokenLogo = useDefaultTokenLogo()
  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState('all')
  const [showChainSelector, setShowChainSelector] = useState(false)
  const activeChain = useActiveChain()
  const loading = proposalListStatus === 'loading'

  const { totalDelegation } = useStaking()

  const hasMinAmountStaked = useMemo(() => {
    if (activeChain === 'cosmos') {
      return totalDelegation?.gte(1)
    }

    return true
  }, [activeChain, totalDelegation])

  const filteredProposalList: Proposal[] = useMemo(
    () =>
      _proposalList
        ?.filter((proposal) => proposal.status !== 'PROPOSAL_STATUS_DEPOSIT_PERIOD')
        .reduce((acc, cur) => {
          if (filter === 'all') {
            if (!propFilter) acc.push(cur)
            else if (
              cur.content?.title.toLowerCase().includes(propFilter) ||
              cur.title.toLowerCase().includes(propFilter) ||
              cur.proposal_id.toLowerCase().includes(propFilter)
            ) {
              acc.push(cur)
            }
          } else {
            if (!propFilter && cur.status === filter) {
              acc.push(cur)
            } else if (
              cur.status === filter &&
              (cur.content.title.toLowerCase().includes(propFilter) ||
                cur.title.toLowerCase().includes(propFilter) ||
                cur.proposal_id.toLowerCase().includes(propFilter))
            ) {
              acc.push(cur)
            }
          }
          return acc
        }, []),
    [filter, propFilter, _proposalList],
  )

  const onFilterClick = useCallback((key: string) => {
    setFilter(key)
    setShowFilter(false)
  }, [])

  useEffect(() => {
    const bottom = document.querySelector('#bottom')
    if (!bottom || filteredProposalList.length === 0 || proposalListStatus !== 'success') return
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        fetchMore()
      }
    }
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    })
    observer.observe(bottom)
    return () => {
      observer.disconnect()
    }
  }, [fetchMore, filteredProposalList.length, proposalListStatus])

  const activeChainInfo = chainInfos[activeChain]
  const themeColor = Colors.getChainColor(activeChain, activeChainInfo)

  return (
    <div className='relative w-[400px] overflow-clip'>
      <PopupLayout
        header={
          <Header
            action={{
              onClick: () => navigate(-1),
              type: HeaderActionType.BACK,
            }}
            imgSrc={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
            onImgClick={() => setShowChainSelector(true)}
            title={'Governance'}
            topColor={themeColor}
          />
        }
      >
        <>
          <SelectedChainAlertStrip />

          <div className='w-full flex flex-col pt-6 pb-2 px-7 '>
            <div className='text-[28px] text-black-100 dark:text-white-100 font-bold'>
              Proposals
            </div>
            <div className='text-sm text-gray-600 font-bold'>
              List of proposals in {activeChainInfo.chainName}
            </div>

            {!hasMinAmountStaked && <RequireMinStaking />}

            <div className='flex items-center justify-between mt-6 mb-4'>
              <SearchInput
                placeholder='Search proposals...'
                onChange={handleFilterChange}
                value={propFilter}
                onClear={() => setPropFilter('')}
                inputClassName='flex flex-grow text-base text-gray-600 dark:text-gray-200 outline-none bg-white-0'
                divClassName='w-full flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'
              />

              <button
                className='flex items-center justify-center h-10 bg-white-100 dark:bg-gray-900 rounded-full w-10 m-w-10 ml-3'
                style={{ minWidth: 40 }}
                onClick={() => setShowFilter(true)}
              >
                <span className='material-icons-round dark:text-white-100 text-gray-800'>sort</span>
              </button>
            </div>
          </div>

          <div id='governance-list' className='pb-8'>
            <div className='rounded-2xl flex flex-col items-center w-[344px] m-auto justify-center dark:bg-gray-900 bg-white-100'>
              {loading ? (
                <GovCardSkeleton />
              ) : (filteredProposalList?.length ?? 0) === 0 ? (
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
              ) : (
                filteredProposalList?.map((prop: any, index) => {
                  return (
                    <div key={prop.proposal_id} className='w-full'>
                      <div className='p-4 cursor-pointer' onClick={() => onClick(prop.proposal_id)}>
                        <div className='flex items-center justify-between'>
                          <div className='w-[272px]'>
                            <div className='flex flex-col'>
                              <div className='text-black-100 dark:text-white-100 font-bold text-base break-words'>
                                {prop?.title ?? prop?.content?.title}
                              </div>
                              <div className='text-gray-600 dark:text-gray-200 text-xs'>
                                #{prop.proposal_id} ·{' '}
                                <Status status={prop.status as unknown as ProposalStatus} />
                              </div>
                            </div>
                          </div>
                          <img className='ml-5' src={Images.Misc.RightArrow} />
                        </div>
                      </div>
                      {index < filteredProposalList.length - 1 ? <CardDivider /> : null}
                    </div>
                  )
                })
              )}
            </div>

            <div id='bottom' className='my-1' />

            {proposalListStatus === 'fetching-more' ? (
              <div className='px-7 flex items-center justify-center'>
                <LoaderAnimation color='white' />
              </div>
            ) : null}
          </div>
        </>
      </PopupLayout>

      <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />

      <BottomModal isOpen={showFilter} onClose={() => setShowFilter(false)} title={'Filter by'}>
        <div className='rounded-2xl flex flex-col items-center w-full justify-center dark:bg-gray-900 bg-white-100'>
          {filters.map((_filter, index) => (
            <Fragment key={_filter.label}>
              <button
                className='flex items-center justify-between text-md font-bold p-4 w-full text-gray-800 dark:text-white-100'
                onClick={() => onFilterClick(_filter.key)}
                key={_filter.label}
              >
                <span>{_filter.label}</span>
                {filter === _filter.key ? (
                  <span className='material-icons-round' style={{ color: '#E18881' }}>
                    check_circle
                  </span>
                ) : null}
              </button>
              {index === filters.length - 1 ? null : <CardDivider />}
            </Fragment>
          ))}
        </div>
      </BottomModal>
    </div>
  )
}

export default ProposalList
