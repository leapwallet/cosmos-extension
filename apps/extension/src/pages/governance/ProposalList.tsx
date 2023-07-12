/* eslint-disable @typescript-eslint/no-explicit-any */
import { Proposal, useGetProposal } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, Header, HeaderActionType } from '@leapwallet/leap-ui'
import AlertStrip from 'components/alert-strip/AlertStrip'
import BottomModal from 'components/bottom-modal'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { EmptyCard } from 'components/empty-card'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import SelectChain from 'pages/home/SelectChain'
import SideNav from 'pages/home/side-nav'
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useRecoilState } from 'recoil'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'
import { sliceSearchWord } from 'utils/strings'

import { selectedChainAlertState } from '../../atoms/selected-chain-alert'
import GovCardSkeleton from '../../components/Skeletons/GovCardSkeleton'
import Status, { ProposalStatus } from './Status'

export type ProposalListProps = {
  // eslint-disable-next-line no-unused-vars
  onClick: (proposal: string) => void
  proposalList: any[]
  proposalListStatus: 'success' | 'error' | 'loading' | 'fetching-more'
  fetchMore: () => void
}

const getPercentage = (a: number, b: number) => {
  return `${Math.ceil((a / b) * 100)}%`
}

const filters = [
  { key: 'all', label: 'All Proposals' },
  { key: ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD, label: 'Voting in Progress' },
  { key: ProposalStatus.PROPOSAL_STATUS_PASSED, label: 'Passed' },
  { key: ProposalStatus.PROPOSAL_STATUS_REJECTED, label: 'Rejected' },
]

const VoterCount = ({ vote }: { vote: any }) => {
  const { isLoading, data } = useGetProposal(vote.proposal_id, true)
  const { yes, no, abstain, no_with_veto } = data || ({} as any)
  const totalVotes = +yes + +no + +abstain + +no_with_veto
  const votePercentages = [
    { value: yes, label: getPercentage(+yes, totalVotes), color: '#29A874' },
    { value: no, label: getPercentage(+no, totalVotes), color: '#FF707E' },
    {
      value: no_with_veto,
      label: getPercentage(+no_with_veto, totalVotes),
      color: '#8583EC',
    },
    {
      value: abstain,
      label: getPercentage(+abstain, totalVotes),
      color: '#D1A700',
    },
  ]
  return isLoading && !totalVotes ? (
    <Skeleton count={1} width='100%' className='mt-3' height='8px' />
  ) : totalVotes ? (
    <div className='relative h-2 w-full rounded-[20px] mt-3 overflow-hidden'>
      <div className='absolute top-0 left-0 right-0 w-full h-full flex items-center'>
        {votePercentages.map((_vote) => (
          <div
            className='h-full'
            style={{
              width: _vote.label,
              backgroundColor: _vote.color,
            }}
            key={_vote.color}
          />
        ))}
      </div>
    </div>
  ) : null
}

function ProposalList({
  onClick,
  proposalList: _proposalList,
  proposalListStatus,
  fetchMore,
}: ProposalListProps) {
  const chainInfos = useChainInfos()
  const [propFilter, setPropFilter] = useState<string>()
  const handleFilterChange = (event: React.FormEvent<HTMLInputElement>) => {
    setPropFilter(event.currentTarget.value.toLowerCase())
  }

  const defaultTokenLogo = useDefaultTokenLogo()
  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState('all')
  const [showSideNav, setShowSideNav] = useState(false)
  const [showSelectedChainAlert, setShowSelectedChainAlert] =
    useRecoilState(selectedChainAlertState)
  const [showChainSelector, setShowChainSelector] = useState(false)
  const activeChain = useActiveChain()
  const isTestnet = useSelectedNetwork() === 'testnet'
  const loading = proposalListStatus === 'loading'

  const filteredProposalList: Proposal[] = useMemo(
    () =>
      _proposalList
        ?.filter((proposal) => proposal.status !== 'PROPOSAL_STATUS_DEPOSIT_PERIOD')
        .reduce((acc, cur) => {
          if (filter === 'all') {
            if (!propFilter) acc.push(cur)
            else if (
              cur.content.title.toLowerCase().includes(propFilter) ||
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
              onClick: function noRefCheck() {
                setShowSideNav(true)
              },
              type: HeaderActionType.NAVIGATION,
            }}
            imgSrc={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
            onImgClick={
              isCompassWallet()
                ? undefined
                : function noRefCheck() {
                    setShowChainSelector(true)
                  }
            }
            title={'Governance'}
            topColor={themeColor}
          />
        }
      >
        <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
        {showSelectedChainAlert && !isCompassWallet() && (
          <AlertStrip
            message={`You are on ${activeChainInfo.chainName}${isTestnet ? ' Testnet' : ''}`}
            bgColor={themeColor}
            alwaysShow={isTestnet}
            onHide={() => {
              setShowSelectedChainAlert(false)
            }}
          />
        )}
        <div className='w-full flex flex-col pt-6 pb-2 px-7 '>
          <div className='text-[28px] text-black-100 dark:text-white-100 font-bold'>Proposals</div>
          <div className='text-sm text-gray-600 font-bold'>
            List of proposals in{' '}
            {activeChain.toLowerCase() === 'maincoreum' ? 'COREUM' : activeChain.toUpperCase()}
          </div>
          <div className='flex items-center justify-between mt-6 mb-4'>
            <div className='w-full flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'>
              <input
                placeholder='search proposals...'
                className='flex flex-grow text-base text-gray-600 dark:text-gray-200  outline-none bg-white-0'
                onChange={handleFilterChange}
              />
              <img src={Images.Misc.SearchIcon} />
            </div>
            <button
              className='flex items-center justify-center h-10 bg-white-100 dark:bg-gray-900 rounded-full w-10 m-w-10 ml-3'
              style={{ minWidth: 40 }}
              onClick={() => setShowFilter(true)}
            >
              <span className='material-icons-round dark:text-white-100 text-gray-800'>sort</span>
            </button>
          </div>
        </div>
        <div id='governance-list' className='pb-20'>
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
                      {ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD === prop.status ? (
                        <VoterCount vote={prop} />
                      ) : null}
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
      <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
      <BottomNav label={BottomNavLabel.Governance} />
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
