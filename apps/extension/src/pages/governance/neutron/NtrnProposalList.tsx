import { useActiveChain, useSelectedNetwork } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { selectedChainAlertState } from 'atoms/selected-chain-alert'
import AlertStrip from 'components/alert-strip/AlertStrip'
import BottomModal from 'components/bottom-modal'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { EmptyCard } from 'components/empty-card'
import PopupLayout from 'components/layout/popup-layout'
import GovCardSkeleton from 'components/Skeletons/GovCardSkeleton'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import SelectChain from 'pages/home/SelectChain'
import SideNav from 'pages/home/side-nav'
import React, { Fragment, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { Colors } from 'theme/colors'
import { sliceSearchWord } from 'utils/strings'

import { ProposalListProps } from '../ProposalList'
import { NtrnStatus } from './index'
import { NtrnProposalStatus } from './NtrnStatus'

const FILTERS = [
  { key: 'all', label: 'All Proposals' },
  { key: NtrnProposalStatus.OPEN, label: 'In Progress' },
  { key: NtrnProposalStatus.EXECUTED, label: 'Executed' },
  { key: NtrnProposalStatus.REJECTED, label: 'Rejected' },
]

export function NtrnProposalList({
  proposalList: _proposalList,
  proposalListStatus,
  onClick,
}: Omit<ProposalListProps, 'fetchMore'>) {
  const [showSideNav, setShowSideNav] = useState(false)
  const [showChainSelector, setShowChainSelector] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [showSelectedChainAlert, setShowSelectedChainAlert] =
    useRecoilState(selectedChainAlertState)
  const [propFilter, setPropFilter] = useState<string>()
  const [filter, setFilter] = useState('all')

  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()
  const defaultTokenLogo = useDefaultTokenLogo()
  const isTestnet = useSelectedNetwork() === 'testnet'

  const loading = proposalListStatus === 'loading'
  const activeChainInfo = chainInfos[activeChain]
  const themeColor = Colors.getChainColor(activeChain, activeChainInfo)

  const filteredProposalList = useMemo(() => {
    return _proposalList?.reduce((acc, curr) => {
      if (filter === 'all') {
        if (!propFilter) acc.push(curr)
        else if (
          curr.proposal.title.toLowerCase().includes(propFilter) ||
          String(curr.id) === propFilter
        ) {
          acc.push(curr)
        }
      } else {
        if (!propFilter && curr.proposal.status === filter) {
          acc.push(curr)
        } else if (
          curr.proposal.status === filter &&
          (curr.proposal.title.toLowerCase().includes(propFilter) || String(curr.id) === propFilter)
        ) {
          acc.push(curr)
        }
      }

      return acc
    }, [])
  }, [_proposalList, filter, propFilter])

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
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              className:
                'w-[48px] h-[40px] px-3 bg-[#FFFFFF] dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full',
            }}
            imgSrc={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
            onImgClick={() => setShowChainSelector(true)}
            title='Governance'
            topColor={themeColor}
          />
        }
      >
        <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />

        {showSelectedChainAlert && (
          <AlertStrip
            message={`You are on ${activeChainInfo.chainName}${
              isTestnet && !activeChainInfo?.chainName.includes('Testnet') ? ' Testnet' : ''
            }`}
            bgColor={themeColor}
            alwaysShow={isTestnet}
            onHide={() => setShowSelectedChainAlert(false)}
          />
        )}

        <div className='w-full flex flex-col pt-6 pb-2 px-7 '>
          <div className='text-[28px] text-black-100 dark:text-white-100 font-bold'>Proposals</div>
          <div className='text-sm text-gray-600 font-bold'>
            List of proposals in {activeChain.toUpperCase()}
          </div>

          <div className='flex items-center justify-between mt-6 mb-4'>
            <div className='w-full flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'>
              <input
                placeholder='search proposals...'
                className='flex flex-grow text-base text-gray-600 dark:text-gray-200  outline-none bg-white-0'
                onChange={(event) => setPropFilter(event.currentTarget.value.toLowerCase())}
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              filteredProposalList?.map((proposal: any, index: number) => {
                return (
                  <div key={proposal.id} className='w-full'>
                    <div className='p-4 cursor-pointer' onClick={() => onClick(proposal.id)}>
                      <div className='flex items-center justify-between'>
                        <div className='w-[272px]'>
                          <div className='flex flex-col'>
                            <div className='text-black-100 dark:text-white-100 font-bold text-base break-words'>
                              {proposal.proposal.title}
                            </div>
                            <div className='text-gray-600 dark:text-gray-200 text-xs'>
                              #{proposal.id} · <NtrnStatus status={proposal.proposal.status} />
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
        </div>
      </PopupLayout>

      <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
      <BottomNav label={BottomNavLabel.Governance} />

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
                  <span className='material-icons-round' style={{ color: '#E18881' }}>
                    check_circle
                  </span>
                ) : null}
              </button>
              {index === FILTERS.length - 1 ? null : <CardDivider />}
            </Fragment>
          ))}
        </div>
      </BottomModal>
    </div>
  )
}
