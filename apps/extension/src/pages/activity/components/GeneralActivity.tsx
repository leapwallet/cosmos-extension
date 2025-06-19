import {
  removeTrailingSlash,
  TxResponse,
  useActiveChain,
  useAddress,
  useGetChains,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ChainTagsStore } from '@leapwallet/cosmos-wallet-store'
import { AggregatedLoadingList } from 'components/aggregated'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { PENDING_SWAP_TXS } from 'config/storage-keys'
import { useChainPageInfo } from 'hooks'
import { SelectedNetwork } from 'hooks/settings/useNetwork'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import PendingSwapsAlertStrip from 'pages/home/PendingSwapsAlertStrip'
import SelectChain from 'pages/home/SelectChain'
import qs from 'qs'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { globalSheetsStore } from 'stores/global-sheets-store'
import { Colors } from 'theme/colors'
import { AggregatedSupportedChain } from 'types/utility'
import { moveTxsFromCurrentToPending, TxStoreObject } from 'utils/pendingSwapsTxsStore'
import Browser from 'webextension-polyfill'

import { ActivitySwapTxPage } from '../ActivitySwapTxPage'
import { reduceActivityInSections } from '../utils'
import { ActivityHeader } from './activity-header'
import { SelectedTx } from './ChainActivity'
import {
  ActivityCard,
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
  chainTagsStore: ChainTagsStore
  setSelectedChain?: React.Dispatch<React.SetStateAction<SupportedChain>>
}

const GeneralActivity = observer(
  ({
    txResponse,
    filteredChains,
    forceChain,
    forceNetwork,
    setSelectedChain,
    chainTagsStore,
  }: GeneralActivityProps) => {
    /**
     * Custom hooks
     */
    const chains = useGetChains()
    const activeChain = useActiveChain() as AggregatedSupportedChain
    const [showActivityChainSelector, setShowActivityChainSelector] = useState(false)
    const _activeNetwork = useSelectedNetwork()
    const { headerChainImgSrc } = useChainPageInfo()
    const [pendingSwapTxs, setPendingSwapTxs] = useState<TxStoreObject[]>([])
    const [showSwapTxPageFor, setShowSwapTxPageFor] = useState<TxStoreObject | undefined>(undefined)
    const navigate = useNavigate()

    const selectedChain = useMemo(() => {
      if (activeChain !== AGGREGATED_CHAIN_KEY) {
        return activeChain
      }

      return forceChain ?? chains.cosmos.key
    }, [activeChain, forceChain, chains.cosmos.key])
    const _address = useAddress(selectedChain)
    const walletAddresses = useGetWalletAddresses()
    const address = useMemo(() => {
      if (chains[selectedChain]?.evmOnlyChain) {
        return walletAddresses[0]
      }

      return _address
    }, [_address, chains, selectedChain, walletAddresses])

    /**
     * Local states
     */
    const [showChainSelector, setShowChainSelector] = useState(false)
    const [defaultFilter, setDefaultFilter] = useState('Popular')
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
        const accountUrl = chains[selectedChain]?.txExplorer?.[activeNetwork]?.accountUrl

        if (accountUrl?.includes('PLACEHOLDER_FOR_WALLET_ADDRESS')) {
          return (
            removeTrailingSlash(
              (accountUrl ?? '').replace('PLACEHOLDER_FOR_WALLET_ADDRESS', address),
            ) ?? ''
          )
        }

        return `${removeTrailingSlash(
          chains[selectedChain]?.txExplorer?.[activeNetwork]?.accountUrl ?? '',
        )}/${address}`
      }

      return ''
    }, [activeNetwork, address, chains, selectedChain])

    useEffect(() => {
      async function updatePendingSwapTxs() {
        const storage = await Browser.storage.local.get([PENDING_SWAP_TXS])

        if (storage[PENDING_SWAP_TXS]) {
          const pendingTxs = Object.values(
            JSON.parse(storage[PENDING_SWAP_TXS]) ?? {},
          ) as TxStoreObject[]

          setPendingSwapTxs(pendingTxs)
        } else {
          setPendingSwapTxs([])
        }
      }
      moveTxsFromCurrentToPending()
      updatePendingSwapTxs()

      Browser.storage.onChanged.addListener((storage) => {
        if (storage[PENDING_SWAP_TXS]) {
          updatePendingSwapTxs()
        }
      })

      return Browser.storage.onChanged.removeListener((storage) => {
        if (storage[PENDING_SWAP_TXS]) {
          updatePendingSwapTxs()
        }
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const sections = useMemo(() => {
      const txsByDate = activity?.reduce(reduceActivityInSections, {})
      return Object.entries(txsByDate ?? {}).map((entry) => ({ title: entry[0], data: entry[1] }))
    }, [activity])

    const hasPendingSwapTxs = useMemo(() => {
      return pendingSwapTxs?.length > 0
    }, [pendingSwapTxs])

    const ShowView = useMemo(() => {
      if (!hasPendingSwapTxs && activity?.length === 0 && !txResponse?.loading) {
        return (
          <div className='mt-4'>
            <NoActivityView accountExplorerLink={accountExplorerLink} chain={selectedChain} />
          </div>
        )
      }

      if (!hasPendingSwapTxs && txResponse?.error) {
        return (
          <div className='mt-4'>
            <ErrorActivityView accountExplorerLink={accountExplorerLink} chain={selectedChain} />
          </div>
        )
      }

      return (
        <>
          {hasPendingSwapTxs ? (
            <>
              <div className='font-bold text-sm text-gray-600 dark:text-gray-200 mb-2 mt-4'>
                Recent swaps
              </div>
              <div className='flex flex-col gap-3'>
                {pendingSwapTxs.map((tx) => (
                  <PendingSwapsAlertStrip
                    key={`${tx.routingInfo?.messages?.[0]?.customTxHash}-${tx.routingInfo?.messages?.[0]?.customMessageChainId}`}
                    setShowSwapTxPageFor={setShowSwapTxPageFor}
                    selectedPendingSwapTx={tx}
                  />
                ))}
              </div>
            </>
          ) : null}

          {txResponse?.loading ? <AggregatedLoadingList className='mt-4' /> : null}

          {!txResponse?.loading &&
            sections &&
            sections.map(({ data, title }, index) => {
              return (
                <div className='mt-4' key={`${title}_${index}`} id='activity-list'>
                  <div className='font-bold text-sm text-gray-600 dark:text-gray-200 mb-2'>
                    {title}
                  </div>

                  <div className='flex flex-col gap-3'>
                    {data.map((tx) => (
                      <React.Fragment key={tx.parsedTx.txHash}>
                        <ActivityCard
                          content={tx.content}
                          isSuccessful={tx.parsedTx.code === 0}
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
              style={{ color: Colors.green600 }}
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
      sections,
      selectedChain,
      txResponse?.error,
      txResponse?.loading,
      hasPendingSwapTxs,
      pendingSwapTxs,
    ])

    useEffect(() => {
      if (!showChainSelector) {
        setDefaultFilter('Popular')
      }
    }, [showChainSelector])

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

    const onImgClick = useCallback(
      (event?: React.MouseEvent<HTMLDivElement>, props?: { defaultFilter?: string }) => {
        setShowChainSelector(true)
        if (props?.defaultFilter) {
          setDefaultFilter(props.defaultFilter)
        }
      },
      [],
    )

    const handleOpenSideNavSheet = useCallback(() => globalSheetsStore.toggleSideNav(), [])

    /**
     * Render
     */

    return (
      <>
        {selectedTx ? (
          <TxDetails
            open={!!selectedTx}
            tx={selectedTx}
            onBack={() => setSelectedTx(null)}
            forceChain={selectedChain}
          />
        ) : (
          <>
            <ActivityHeader />
            <div className='flex flex-col pt-8 px-6 pb-6 mb-16'>
              <h1 className='flex items-center justify-between text-black-100 dark:text-white-100'>
                <div className='flex flex-col items-start justify-start'>
                  <span className='text-[24px] font-[700]'>Activity</span>
                  <span className='text-[12px] font-[500] text-gray-600 dark:text-gray-400'>
                    {chains[selectedChain]?.chainName ?? 'Unknown Chain'}
                  </span>
                </div>

                {filteredChains?.length ? (
                  <button
                    className=' rounded-full flex items-center justify-center'
                    onClick={() => setShowActivityChainSelector(true)}
                  >
                    <img src={Images.Misc.TuneIcon} className='w-4 h-4 invert dark:invert-0' />
                  </button>
                ) : null}
              </h1>

              {ShowView}
            </div>

            {filteredChains?.length ? (
              <SelectAggregatedActivityChain
                isVisible={showActivityChainSelector}
                onClose={() => setShowActivityChainSelector(false)}
                onChainSelect={onChainSelect}
                chainsToShow={filteredChains}
                selectedChain={selectedChain}
                chainTagsStore={chainTagsStore}
              />
            ) : null}
            <SelectChain
              isVisible={showChainSelector}
              onClose={() => setShowChainSelector(false)}
              chainTagsStore={chainTagsStore}
              defaultFilter={defaultFilter}
            />

            {showSwapTxPageFor ? (
              <ActivitySwapTxPage
                onClose={(
                  sourceChainId?: string,
                  sourceToken?: string,
                  destinationChainId?: string,
                  destinationToken?: string,
                ) => {
                  setShowSwapTxPageFor(undefined)
                  let queryStr = ''
                  if (sourceChainId || sourceToken || destinationChainId || destinationToken) {
                    queryStr = `?${qs.stringify({
                      sourceChainId,
                      sourceToken,
                      destinationChainId,
                      destinationToken,
                      pageSource: 'swapAgain',
                    })}`
                    navigate(`/swap${queryStr}`)
                  }
                }}
                {...showSwapTxPageFor}
              />
            ) : null}
          </>
        )}
      </>
    )
  },
)

GeneralActivity.displayName = 'GeneralActivity'
export { GeneralActivity }
