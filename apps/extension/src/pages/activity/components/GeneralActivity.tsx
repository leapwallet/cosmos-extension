import {
  removeTrailingSlash,
  TxResponse,
  useActiveChain,
  useAddress,
  useGetChains,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AggregatedLoading } from 'components/aggregated'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { PageHeader } from 'components/header'
import PopupLayout from 'components/layout/popup-layout'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useChainPageInfo } from 'hooks'
import { SelectedNetwork } from 'hooks/settings/useNetwork'
import { Images } from 'images'
import SelectChain from 'pages/home/SelectChain'
import SideNav from 'pages/home/side-nav'
import React, { useCallback, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import { HeaderActionType } from 'types/components'
import { AggregatedSupportedChain } from 'types/utility'

import { reduceActivityInSections } from '../utils'
import { SelectedTx } from './ChainActivity'
import {
  ActivityCard,
  AggregatedActivityNullComponents,
  ErrorActivityView,
  NoActivityView,
  SelectAggregatedActivityChain,
  TxDetails,
} from './index'

type GeneralActivityProps = {
  txResponse: TxResponse
  filteredChains?: string[]
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
  setSelectedChain?: React.Dispatch<React.SetStateAction<SupportedChain>>
}

const GeneralActivity = React.memo(
  ({
    txResponse,
    filteredChains,
    forceChain,
    forceNetwork,
    setSelectedChain,
  }: GeneralActivityProps) => {
    /**
     * Custom hooks
     */
    const chains = useGetChains()
    const activeChain = useActiveChain() as AggregatedSupportedChain
    const [showActivityChainSelector, setShowActivityChainSelector] = useState(false)
    const _activeNetwork = useSelectedNetwork()
    const { headerChainImgSrc } = useChainPageInfo()

    const selectedChain = useMemo(() => {
      if (activeChain !== AGGREGATED_CHAIN_KEY) {
        return activeChain
      }

      return forceChain ?? chains.cosmos.key
    }, [activeChain, forceChain, chains.cosmos.key])
    const address = useAddress(selectedChain)

    /**
     * Local states
     */
    const [showSideNav, setShowSideNav] = useState(false)
    const [showChainSelector, setShowChainSelector] = useState(false)
    const [selectedTx, setSelectedTx] = useState<SelectedTx | null>(null)

    /**
     * Memoized values
     */
    const { activity } = useMemo(() => txResponse ?? {}, [txResponse])
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [_activeNetwork, forceNetwork],
    )

    const accountExplorerLink = useMemo(() => {
      if (chains[selectedChain]?.txExplorer?.[activeNetwork]?.accountUrl) {
        return `${removeTrailingSlash(
          chains[selectedChain]?.txExplorer?.[activeNetwork]?.accountUrl ?? '',
        )}/${address}`
      }

      return ''
    }, [activeNetwork, address, chains, selectedChain])

    const sections = useMemo(() => {
      const txsByDate = activity?.reduce(reduceActivityInSections, {})
      return Object.entries(txsByDate ?? {}).map((entry) => ({ title: entry[0], data: entry[1] }))
    }, [activity])

    const ShowView = useMemo(() => {
      if (activity?.length === 0 && !txResponse?.loading) {
        return (
          <div className='mt-4'>
            <NoActivityView accountExplorerLink={accountExplorerLink} chain={selectedChain} />
          </div>
        )
      }

      if (txResponse?.error) {
        return (
          <div className='mt-4'>
            <ErrorActivityView accountExplorerLink={accountExplorerLink} chain={selectedChain} />
          </div>
        )
      }

      return (
        <>
          {txResponse?.loading ? (
            <div className='flex flex-col mt-4'>
              <AggregatedLoading className='mb-2' />
              <AggregatedLoading />
            </div>
          ) : null}

          {!txResponse?.loading &&
            sections &&
            sections.map(({ data, title }, index) => {
              return (
                <div className='mt-4' key={`${title}_${index}`} id='activity-list'>
                  <div className='font-bold text-sm text-gray-600 dark:text-gray-200 mb-2'>
                    {title}
                  </div>

                  <div className='flex flex-col'>
                    {data.map((tx) => (
                      <React.Fragment key={tx.parsedTx.txHash}>
                        <ActivityCard
                          content={tx.content}
                          isSuccessful={tx.parsedTx.code === 0}
                          containerClassNames='dark:!bg-gray-950 mb-2 !p-[12px] !rounded-xl'
                          forceChain={selectedChain}
                          titleClassName='!font-normal'
                          imgSize='sm'
                          onClick={() => setSelectedTx(tx)}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )
            })}

          {!txResponse?.loading && accountExplorerLink ? (
            <a
              href={accountExplorerLink}
              target='_blank'
              className='font-semibold text-base mt-4 text-center block'
              style={{ color: Colors.getChainColor(selectedChain, chains[selectedChain]) }}
              rel='noreferrer'
            >
              Check more on Explorer
            </a>
          ) : null}
        </>
      )
    }, [
      accountExplorerLink,
      activity?.length,
      chains,
      sections,
      selectedChain,
      txResponse?.error,
      txResponse?.loading,
    ])

    /**
     * Memoized functions
     */

    const onChainSelect = useCallback(
      (chainName: SupportedChain) => {
        setSelectedChain && setSelectedChain(chainName)
        setShowActivityChainSelector(false)
      },
      [setSelectedChain],
    )

    const handleOpenSelectChainSheet = useCallback(() => setShowChainSelector(true), [])
    const handleOpenSideNavSheet = useCallback(() => setShowSideNav(true), [])

    /**
     * Render
     */

    return (
      <div className='relative w-[400px] overflow-clip'>
        <AggregatedActivityNullComponents />

        {selectedTx ? (
          <TxDetails
            content={selectedTx.content}
            parsedTx={selectedTx.parsedTx}
            onBack={() => setSelectedTx(null)}
            forceChain={selectedChain}
          />
        ) : (
          <>
            <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
            <PopupLayout
              header={
                <PageHeader
                  title='Activity'
                  imgSrc={headerChainImgSrc}
                  onImgClick={handleOpenSelectChainSheet}
                  action={{
                    onClick: handleOpenSideNavSheet,
                    type: HeaderActionType.NAVIGATION,
                    className: 'w-[48px] h-[40px] px-3 bg-[#FFFFFF] dark:bg-gray-950 rounded-full',
                  }}
                />
              }
            >
              <div className='flex flex-col pt-[16px] pb-24 px-[24px]'>
                <h1 className='flex items-center justify-between text-black-100 dark:text-white-100'>
                  <div className='flex flex-col items-start justify-start'>
                    <span className='text-[24px] font-[700]'>Activity</span>
                    <span className='text-[12px] font-[500] text-gray-600 dark:text-gray-400'>
                      {chains[selectedChain]?.chainName ?? 'Unknown Chain'}
                    </span>
                  </div>

                  {filteredChains?.length ? (
                    <button
                      className='bg-white-100 dark:bg-gray-950 w-[40px] h-[40px] rounded-full flex items-center justify-center'
                      onClick={() => setShowActivityChainSelector(true)}
                    >
                      <img
                        src={Images.Misc.TuneIcon}
                        className='w-[16px] h-[16px] invert dark:invert-0'
                      />
                    </button>
                  ) : null}
                </h1>

                {ShowView}
              </div>
            </PopupLayout>

            {filteredChains?.length ? (
              <SelectAggregatedActivityChain
                isVisible={showActivityChainSelector}
                onClose={() => setShowActivityChainSelector(false)}
                onChainSelect={onChainSelect}
                chainsToShow={filteredChains}
                selectedChain={selectedChain}
              />
            ) : null}
            <SelectChain
              isVisible={showChainSelector}
              onClose={() => setShowChainSelector(false)}
            />
            <BottomNav label={BottomNavLabel.Activity} />
          </>
        )}
      </div>
    )
  },
)

GeneralActivity.displayName = 'GeneralActivity'
export { GeneralActivity }
