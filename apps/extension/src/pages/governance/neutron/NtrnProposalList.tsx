import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { ChainTagsStore } from '@leapwallet/cosmos-wallet-store'
import { CardDivider, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { CheckCircle } from '@phosphor-icons/react'
import classNames from 'classnames'
import { TestnetAlertStrip } from 'components/alert-strip'
import BottomModal from 'components/bottom-modal'
import { EmptyCard } from 'components/empty-card'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import GovCardSkeleton from 'components/Skeletons/GovCardSkeleton'
import { SearchInput } from 'components/ui/input/search-input'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import Sort from 'icons/sort'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import SelectChain from 'pages/home/SelectChain'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSidePanel } from 'utils/isSidePanel'
import { sliceSearchWord } from 'utils/strings'

import { NtrnStatus } from './index'
import { NtrnProposalStatus } from './NtrnStatus'
import { getId, getStatus, getTitle } from './utils'

const FILTERS = [
  { key: 'all', label: 'All Proposals' },
  { key: NtrnProposalStatus.OPEN, label: 'In Progress' },
  { key: NtrnProposalStatus.EXECUTED, label: 'Executed' },
  { key: NtrnProposalStatus.REJECTED, label: 'Rejected' },
]

type NtrnProposalListProps = {
  onClick: (proposal: string) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  proposalList: any[]
  proposalListStatus: 'success' | 'error' | 'loading' | 'fetching-more'
  fetchMore: () => void
  chainTagsStore: ChainTagsStore
  shouldPreferFallback?: boolean
}

export const NtrnProposalList = observer(
  ({
    proposalList: _proposalList,
    proposalListStatus,
    onClick,
    shouldPreferFallback,
    fetchMore,
    chainTagsStore,
  }: NtrnProposalListProps) => {
    const [showChainSelector, setShowChainSelector] = useState(false)
    const [showFilter, setShowFilter] = useState(false)
    const [propFilter, setPropFilter] = useState<string>('')
    const [filter, setFilter] = useState('all')

    const chainInfos = useChainInfos()
    const activeChain = useActiveChain()
    const defaultTokenLogo = useDefaultTokenLogo()
    const navigate = useNavigate()

    const loading = proposalListStatus === 'loading'
    const activeChainInfo = chainInfos[activeChain]

    const filteredProposalList = useMemo(() => {
      return _proposalList?.reduce((acc, curr) => {
        if (filter === 'all') {
          if (!propFilter) acc.push(curr)
          else if (
            getTitle(curr, shouldPreferFallback ?? false)
              .toLowerCase()
              .includes(propFilter) ||
            String(curr.id) === propFilter
          ) {
            acc.push(curr)
          }
        } else {
          if (!propFilter && getStatus(curr, shouldPreferFallback ?? false) === filter) {
            acc.push(curr)
          } else if (
            getStatus(curr, shouldPreferFallback ?? false) === filter &&
            (getTitle(curr, shouldPreferFallback ?? false)
              .toLowerCase()
              .includes(propFilter) ||
              String(curr.id) === propFilter)
          ) {
            acc.push(curr)
          }
        }

        return acc
      }, [])
    }, [_proposalList, filter, propFilter, shouldPreferFallback])

    useEffect(() => {
      const bottom = document.querySelector('#bottom')
      if (!bottom || filteredProposalList?.length === 0 || proposalListStatus !== 'success') return
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
    }, [fetchMore, filteredProposalList?.length, proposalListStatus])

    return (
      <div className='relative w-full overflow-clip panel-height enclosing-panel'>
        <PopupLayout
          header={
            <Header
              action={{
                onClick: () => navigate(-1),
                type: HeaderActionType.BACK,
              }}
              imgSrc={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
              onImgClick={() => setShowChainSelector(true)}
              title='Governance'
            />
          }
        >
          <TestnetAlertStrip />

          <div className='w-full flex flex-col pt-6 pb-2 px-7 '>
            <div className='text-[28px] text-black-100 dark:text-white-100 font-bold'>
              Proposals
            </div>
            <div className='text-sm text-gray-600 font-bold'>
              List of proposals in {activeChain.toUpperCase()}
            </div>

            <div className='flex items-center justify-between mt-6 mb-4'>
              <SearchInput
                placeholder='Search proposals...'
                onChange={(event) => setPropFilter(event.currentTarget.value.toLowerCase())}
                value={propFilter}
                onClear={() => setPropFilter('')}
              />

              <button
                className='flex items-center justify-center h-10 bg-white-100 dark:bg-gray-900 rounded-full w-10 m-w-10 ml-3'
                style={{ minWidth: 40 }}
                onClick={() => setShowFilter(true)}
              >
                <Sort size={20} className='dark:text-white-100 text-gray-800' />
              </button>
            </div>
          </div>

          <div id='governance-list' className='pb-20 px-7'>
            <div className='rounded-2xl flex flex-col items-center w-full m-auto justify-center dark:bg-gray-900 bg-white-100'>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <GovCardSkeleton key={index} isLast={index === 4} />
                ))
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                filteredProposalList?.map((proposal: any, index: number) => {
                  return (
                    <div key={getId(proposal, shouldPreferFallback ?? false)} className='w-full'>
                      <div
                        className='p-4 cursor-pointer'
                        onClick={() => onClick(getId(proposal, shouldPreferFallback ?? false))}
                      >
                        <div className='flex items-center justify-between'>
                          <div
                            className={classNames('w-[272px]', {
                              '!w-[calc(100%-40px)]': isSidePanel(),
                            })}
                          >
                            <div className='flex flex-col'>
                              <div className='text-black-100 dark:text-white-100 font-bold text-base break-words'>
                                {getTitle(proposal, shouldPreferFallback ?? false)}
                              </div>
                              <div className='text-gray-600 dark:text-gray-200 text-xs'>
                                #{getId(proposal, shouldPreferFallback ?? false)} ·{' '}
                                <NtrnStatus
                                  status={getStatus(proposal, shouldPreferFallback ?? false)}
                                />
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
        </PopupLayout>

        <SelectChain
          isVisible={showChainSelector}
          onClose={() => setShowChainSelector(false)}
          chainTagsStore={chainTagsStore}
        />

        <BottomModal isOpen={showFilter} onClose={() => setShowFilter(false)} title='Filter by'>
          <div className='rounded-2xl flex flex-col items-center w-full justify-center dark:bg-gray-900 bg-white-100'>
            {FILTERS.map((_filter, index) => (
              <Fragment key={_filter.label}>
                <button
                  className='flex items-center justify-between text-md font-bold p-4 w-full text-gray-800 dark:text-white-100'
                  onClick={() => {
                    setFilter(_filter.key)
                    setShowFilter(false)
                  }}
                >
                  <span>{_filter.label}</span>
                  {filter === _filter.key ? (
                    <CheckCircle size={24} weight='fill' className='text-[#E18881]' />
                  ) : null}
                </button>
                {index === FILTERS.length - 1 ? null : <CardDivider />}
              </Fragment>
            ))}
          </div>
        </BottomModal>
      </div>
    )
  },
)
