import { useChainsStore, useCustomChains } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ChainTagsStore } from '@leapwallet/cosmos-wallet-store'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { CaretLeft, CaretRight, MagnifyingGlassMinus, Plus } from '@phosphor-icons/react'
import classNames from 'classnames'
import { EmptyCard } from 'components/empty-card'
import BottomModal from 'components/new-bottom-modal'
import { SearchInput } from 'components/ui/input/search-input'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { BETA_CHAINS, CONNECTIONS } from 'config/storage-keys'
import { disconnect } from 'extension-scripts/utils'
import { useIsAllChainsEnabled } from 'hooks/settings'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { useNonNativeCustomChains } from 'hooks/useNonNativeCustomChains'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import AddChain from 'pages/suggestChain/addChain'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { chainTagsStore as defaultChainTagsStore } from 'stores/chain-infos-store'
import { globalSheetsStore } from 'stores/global-sheets-store'
import { ManageChainSettings, manageChainsStore } from 'stores/manage-chains-store'
import { popularChainsStore } from 'stores/popular-chains-store'
import { rootStore } from 'stores/root-store'
import { starredChainsStore } from 'stores/starred-chains-store'
import { AggregatedSupportedChain } from 'types/utility'
import { cn } from 'utils/cn'
import browser from 'webextension-polyfill'

import { useActiveChain, useSetActiveChain } from '../../hooks/settings/useActiveChain'
import AddFromChainStore from './AddFromChainStore'
import { ChainCardWrapper } from './ChainCardWrapper'
import { ChainCard } from './components'

export type ListChainsProps = {
  onChainSelect: (chainName: SupportedChain) => void
  selectedChain: SupportedChain
  chainTagsStore: ChainTagsStore
  onPage?: 'AddCollection'
  chainsToShow?: string[]
  searchedChain?: string
  setSearchedChain?: (val: string) => void
  showAggregatedOption?: boolean
  handleAddNewChainClick?: VoidFunction | null
  defaultFilter?: string
}

export const ListChains = observer(
  ({
    onChainSelect,
    selectedChain,
    onPage,
    chainsToShow,
    searchedChain: paramsSearchedChain,
    setSearchedChain: paramsSetSearchedChain,
    showAggregatedOption = false,
    handleAddNewChainClick,
    chainTagsStore,
    defaultFilter = 'Popular',
  }: ListChainsProps) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeftCaret, setShowLeftCaret] = useState(false)
    const [showRightCaret, setShowRightCaret] = useState(false)

    const [newChain, setNewChain] = useState<string | null>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [newSearchedChain, setNewSearchedChain] = useState('')
    const [selectedFilter, setSelectedFilter] = useState(defaultFilter)
    const { activeWallet } = useActiveWallet()
    const setChains = useChainsStore((store) => store.setChains)
    const activeChain = useActiveChain()
    const setActiveChain = useSetActiveChain()

    const isAllChainsEnabled = useIsAllChainsEnabled()
    const { theme } = useTheme()

    const s3PriorityChains = popularChainsStore.popularChains
    const s3DeprioritizedChains = popularChainsStore.deprioritizedChains

    const uniqueTags = chainTagsStore.uniqueTags
    const allChainTags = chainTagsStore.allChainTags

    const filterOptions = useMemo(() => {
      const chainTagsForVisibleChains = Object.fromEntries(
        Object.entries(allChainTags).filter(([chainId]) =>
          manageChainsStore.chains.some((chain) => chain.chainId === chainId),
        ),
      )
      const uniqueTagsForVisibleChains = new Set(Object.values(chainTagsForVisibleChains).flat())
      const filteredTags = uniqueTags.filter((tag) => uniqueTagsForVisibleChains.has(tag))
      return [{ label: 'Popular' }, ...filteredTags.map((tag) => ({ label: tag }))]
    }, [allChainTags, uniqueTags])

    const getChainTags = useCallback(
      (chain: ManageChainSettings) => {
        let tags = allChainTags?.[chain.chainId] ?? []
        if (!tags || tags.length === 0) {
          tags = allChainTags?.[chain.testnetChainId ?? ''] ?? []
        }
        if (!tags || tags.length === 0) {
          tags = allChainTags?.[chain.evmChainId ?? ''] ?? []
        }
        if (!tags || tags.length === 0) {
          tags = allChainTags?.[chain.evmChainIdTestnet ?? ''] ?? []
        }
        if ((!tags || tags.length === 0) && chain.evmOnlyChain) {
          tags = ['EVM']
        }
        return tags
      },
      [allChainTags],
    )

    const customChains = useCustomChains()

    const searchedChain = paramsSearchedChain ?? newSearchedChain
    const setSearchedChain = paramsSetSearchedChain ?? setNewSearchedChain
    const nonNativeCustomChains = useNonNativeCustomChains()
    const chainInfos = useChainInfos()
    const allNativeChainID = Object.values(chainInfos)
      .filter((chain) => chain.enabled)
      .map((chain) => {
        if (chain.testnetChainId && chain.chainId !== chain.testnetChainId) {
          return [chain.chainId, chain.testnetChainId]
        }
        return [chain.chainId]
      })
      .flat()

    const _customChains: ManageChainSettings[] = customChains
      .filter((d) => !allNativeChainID.includes(d.chainId))
      .filter((d) => !manageChainsStore.chains.map((chain) => chain.chainId).includes(d.chainId))
      .sort((a, b) => a.chainName.localeCompare(b.chainName))
      .map((d, index) => ({
        active: d.enabled,
        beta: undefined,
        chainName: d.key,
        denom: d.denom,
        id: 100 + index,
        preferenceOrder: 100 + index,
        chainId: d.chainId,
        testnetChainId: d.testnetChainId,
        evmOnlyChain: d.evmOnlyChain,
      }))

    const showChains = useMemo(
      () => [...manageChainsStore.chains, ..._customChains],
      [_customChains],
    )

    const newChainToAdd = useMemo(
      () => customChains.find((d) => d.key === newChain),
      [customChains, newChain],
    )

    const _filteredChains = useMemo(() => {
      return showChains.filter(function (chain) {
        if (
          !chain.active ||
          (onPage === 'AddCollection' &&
            [
              'omniflix',
              'stargaze',
              'forma',
              'manta',
              'aura',
              'mainCoreum',
              'coreum',
              'lightlink',
            ].includes(chain.chainName))
        ) {
          return false
        }

        if (
          chainsToShow &&
          chainsToShow.length &&
          !chainsToShow.includes(chainInfos[chain.chainName]?.chainRegistryPath)
        ) {
          return false
        }

        const chainName =
          chainInfos[chain.chainName]?.chainName ??
          nonNativeCustomChains?.[chain.chainName]?.chainName ??
          chain.chainName
        return chainName.toLowerCase().includes(searchedChain.toLowerCase())
      })
    }, [showChains, onPage, chainsToShow, chainInfos, nonNativeCustomChains, searchedChain])

    const filteredChains = useMemo(() => {
      let chains = _filteredChains

      if (!searchedChain && selectedFilter !== 'Popular') {
        chains = chains.filter((chain) => {
          const tags = getChainTags(chain)
          return tags?.includes(selectedFilter)
        })
      }

      const favouriteChains = chains
        .filter((chain) => starredChainsStore.chains.includes(chain.chainName))
        .sort((chainA, chainB) => chainA.chainName.localeCompare(chainB.chainName))

      const priorityChains = chains
        .filter(
          (chain) =>
            s3PriorityChains.includes(chain.chainName) &&
            !starredChainsStore.chains.includes(chain.chainName),
        )
        .sort(
          (chainA, chainB) =>
            s3PriorityChains.indexOf(chainA.chainName) - s3PriorityChains.indexOf(chainB.chainName),
        )

      const deprioritizedChains = chains
        .filter(
          (chain) =>
            s3DeprioritizedChains.includes(chain.chainName) &&
            !starredChainsStore.chains.includes(chain.chainName),
        )
        .sort(
          (chainA, chainB) =>
            s3PriorityChains.indexOf(chainA.chainName) - s3PriorityChains.indexOf(chainB.chainName),
        )

      const otherChains = chains
        .filter(
          (chain) =>
            !starredChainsStore.chains.includes(chain.chainName) &&
            !s3PriorityChains.includes(chain.chainName) &&
            !s3DeprioritizedChains.includes(chain.chainName),
        )
        .sort((chainA, chainB) => chainA.chainName.localeCompare(chainB.chainName))

      const chainsList = [
        ...favouriteChains,
        ...priorityChains,
        ...otherChains,
        ...deprioritizedChains,
      ]
      if (activeWallet?.watchWallet) {
        const walletChains = new Set(Object.keys(activeWallet.addresses))
        return chainsList.sort((a, b) =>
          walletChains.has(a.chainName) === walletChains.has(b.chainName)
            ? 0
            : walletChains.has(a.chainName)
            ? -1
            : 1,
        )
      }

      return chainsList
    }, [
      _filteredChains,
      activeWallet?.addresses,
      activeWallet?.watchWallet,
      getChainTags,
      searchedChain,
      selectedFilter,
    ])

    const tagWiseChains = useMemo(() => {
      return _filteredChains.reduce((acc, chain) => {
        const tags = getChainTags(chain)
        const tag = tags?.[0] ?? 'Others'
        acc[tag] = acc[tag] || []
        acc[tag].push(chain)
        return acc
      }, {} as Record<string, ManageChainSettings[]>)
    }, [_filteredChains, getChainTags])

    const handleClick = (chainName: AggregatedSupportedChain, beta?: boolean) => {
      if (beta === undefined) {
        setNewChain(chainName)
        return
      }

      setSearchedChain('')
      onChainSelect(chainName as SupportedChain)
    }

    const handleDeleteClick = useCallback(
      async (chainKey: SupportedChain) => {
        if (activeChain === chainKey) {
          await setActiveChain('aggregated')
        }
        const oldChains = chainInfos
        const chainInfo = oldChains[chainKey]
        delete oldChains[chainKey]
        setChains(oldChains)
        rootStore.setChains(oldChains)

        chainTagsStore.removeBetaChainTags(chainKey)

        browser.storage.local.get([BETA_CHAINS, CONNECTIONS]).then(async (resp) => {
          try {
            let betaChains = resp?.[BETA_CHAINS]
            betaChains = typeof betaChains === 'string' ? JSON.parse(betaChains) : {}
            delete betaChains[chainKey]

            let connections = resp?.[CONNECTIONS]
            if (!connections) {
              connections = {}
            }
            Object.values(connections).forEach((wallet: any) => {
              const originConnections = wallet[chainInfo.chainId]
              if (originConnections && originConnections.length > 0) {
                originConnections.forEach((origin: any) =>
                  disconnect({ chainId: chainInfo.chainId, origin }),
                )
              }
            })

            browser.storage.local.set({
              [BETA_CHAINS]: JSON.stringify(betaChains),
            })
          } catch (error) {
            //
          }
        })
      },
      [activeChain, chainInfos, chainTagsStore, setActiveChain, setChains],
    )

    const updateCarets = () => {
      const el = scrollRef.current
      if (!el) return

      setShowLeftCaret(el.scrollLeft > 0)
      setShowRightCaret(Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth)
    }

    useEffect(() => {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 200)
      updateCarets()
      const el = scrollRef.current
      if (!el) return

      el.addEventListener('scroll', updateCarets)
      window.addEventListener('resize', updateCarets)

      return () => {
        el.removeEventListener('scroll', updateCarets)
        window.removeEventListener('resize', updateCarets)
      }
    }, [])

    const scrollBy = (amount: number) => {
      scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
    }

    return (
      <>
        <div className='flex items-center gap-2 mb-6'>
          <SearchInput
            ref={searchInputRef}
            value={searchedChain}
            onChange={(e) => setSearchedChain(e?.target?.value ?? '')}
            placeholder='Search by chain name'
            onClear={() => setSearchedChain('')}
          />

          {handleAddNewChainClick && (
            <div
              className='bg-secondary-100 hover:bg-secondary-200 px-4 py-3 text-muted-foreground rounded-xl cursor-pointer'
              onClick={handleAddNewChainClick}
            >
              <Plus size={20} />
            </div>
          )}
        </div>

        {!searchedChain ? (
          <div className='relative mb-5'>
            <div
              ref={scrollRef}
              className='flex gap-2 justify-start items-center overflow-x-auto hide-scrollbar'
            >
              {filterOptions.map((filter, idx) => (
                <button
                  key={filter.label}
                  className={classNames(
                    'text-xs font-medium px-4 py-2 rounded-full border whitespace-nowrap',
                    {
                      'text-green-600 bg-green-500/10 border-green-600':
                        selectedFilter === filter.label,
                      'bg-secondary-50 text-muted-foreground border-secondary-300':
                        selectedFilter !== filter.label,
                    },
                  )}
                  onClick={() => setSelectedFilter(filter.label)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            {showLeftCaret && (
              <CaretLeft
                width={28}
                height={40}
                onClick={() => scrollBy(-350)}
                className='text-muted-foreground hover:text-foreground cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-[4px] pr-2 py-3 bg-gradient-to-r from-secondary-50 from-60% to-100% to-transparent'
              />
            )}
            {showRightCaret && (
              <CaretRight
                width={28}
                height={40}
                onClick={() => scrollBy(350)}
                className='text-muted-foreground hover:text-foreground cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-[4px] pl-2 py-3 bg-gradient-to-l from-secondary-50 from-60% to-100% to-transparent'
              />
            )}
          </div>
        ) : null}

        {selectedFilter === 'Popular' &&
        !searchedChain &&
        showAggregatedOption &&
        isAllChainsEnabled ? (
          <div className='bg-secondary-100 hover:bg-secondary-200 rounded-xl max-h-[100px] w-full mb-3'>
            <ChainCard
              beta={false}
              handleClick={handleClick}
              formattedChainName='All chains'
              chainName={AGGREGATED_CHAIN_KEY}
              selectedChain={selectedChain}
              img={
                theme === ThemeName.DARK
                  ? Images.Misc.AggregatedViewDarkSvg
                  : Images.Misc.AggregatedViewSvg
              }
              showStars
            />
          </div>
        ) : null}
        <>
          {filteredChains.length === 0 ? (
            <div
              className={cn(
                'w-full flex items-center justify-center rounded-2xl border border-secondary-200 h-[calc(100%-63px)]',
              )}
            >
              <div className='flex items-center justify-center flex-col gap-4'>
                <div className='p-5 bg-secondary-200 rounded-full flex items-center justify-center'>
                  <MagnifyingGlassMinus size={24} className='text-foreground' />
                </div>
                <p className='text-[18px] !leading-[24px] font-bold text-foreground text-center'>
                  No results found
                </p>
              </div>
            </div>
          ) : !searchedChain ? (
            filteredChains.map((chain: ManageChainSettings, index: number) => (
              <ChainCardWrapper
                key={chain.chainName + index}
                chain={chain}
                handleClick={handleClick}
                handleDeleteClick={handleDeleteClick}
                selectedChain={selectedChain}
                onPage={onPage}
                index={index}
                showStars
              />
            ))
          ) : (
            [...filterOptions, { label: 'Others' }].map(({ label: tag }) => {
              const tagChains = tagWiseChains[tag]
              if (!tagChains || tagChains.length === 0) {
                return null
              }
              return (
                <div key={tag}>
                  <div className='text-black-100 dark:text-white-100 font-bold text-sm !leading-[19.2px] mb-4'>
                    {tag} <span className='font-normal !leading-[22.4px]'>{tagChains?.length}</span>
                  </div>
                  {tagChains.map((chain, index) => (
                    <ChainCardWrapper
                      key={chain.chainName + index}
                      chain={chain}
                      handleClick={handleClick}
                      handleDeleteClick={handleDeleteClick}
                      selectedChain={selectedChain}
                      onPage={onPage}
                      index={index}
                      showStars
                    />
                  ))}
                </div>
              )
            })
          )}
        </>

        <AddFromChainStore
          isVisible={!!newChain}
          onClose={() => setNewChain(null)}
          newAddChain={newChainToAdd as ChainInfo}
          successCallback={() => globalSheetsStore.toggleChainSelector()}
        />
      </>
    )
  },
)

type ChainSelectorProps = {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
  readonly chainTagsStore?: ChainTagsStore
  readonly defaultFilter?: string
  readonly onChainSelect?: (chainName: AggregatedSupportedChain) => void
  readonly selectedChain?: SupportedChain
  readonly showAggregatedOption?: boolean
}

const SelectChain = observer(
  ({
    isVisible,
    onClose,
    chainTagsStore = defaultChainTagsStore,
    defaultFilter,
    onChainSelect: onChainSelectProp,
    selectedChain: selectedChainProp,
    showAggregatedOption: showAggregatedOptionProp = true,
  }: ChainSelectorProps) => {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const selectedChain = useActiveChain()
    const setActiveChain = useSetActiveChain()
    const [searchedChain, setSearchedChain] = useState('')
    const [isAddChainOpen, setIsAddChainOpen] = useState<boolean>(false)

    const onChainSelect = (chainName: AggregatedSupportedChain) => {
      if (onChainSelectProp) {
        onChainSelectProp(chainName)
        return
      }
      setActiveChain(chainName)
      if (pathname !== '/home') {
        navigate('/home')
      }
      onClose()
    }

    const handleAddNewChainClick = useCallback(() => {
      setIsAddChainOpen(true)
    }, [])

    const handleAddChainClose = useCallback(() => {
      setIsAddChainOpen(false)
    }, [])

    return (
      <>
        <BottomModal
          isOpen={isVisible}
          onClose={onClose}
          fullScreen
          title='Switch chain'
          className='h-full'
        >
          <ListChains
            onChainSelect={onChainSelect}
            selectedChain={selectedChainProp || selectedChain}
            searchedChain={searchedChain}
            setSearchedChain={(val) => setSearchedChain(val)}
            showAggregatedOption={showAggregatedOptionProp}
            handleAddNewChainClick={handleAddNewChainClick}
            chainTagsStore={chainTagsStore}
            defaultFilter={defaultFilter}
          />
        </BottomModal>
        <AddChain isOpen={isAddChainOpen} onClose={handleAddChainClose} />
      </>
    )
  },
)

export default SelectChain
