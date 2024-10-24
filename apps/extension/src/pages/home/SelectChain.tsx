import { useCustomChains, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ChainTagsStore } from '@leapwallet/cosmos-wallet-store'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { MagnifyingGlass, Plus } from '@phosphor-icons/react'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import { EmptyCard } from 'components/empty-card'
import { AGGREGATED_CHAIN_KEY, PriorityChains } from 'config/constants'
import { useIsAllChainsEnabled, useStarredChains } from 'hooks/settings'
import { ManageChainSettings, useManageChainData } from 'hooks/settings/useManageChains'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AggregatedSupportedChain } from 'types/utility'
import { isCompassWallet } from 'utils/isCompassWallet'
import extension from 'webextension-polyfill'

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
    defaultFilter = 'All',
  }: ListChainsProps) => {
    const [newChain, setNewChain] = useState<string | null>(null)
    const [newSearchedChain, setNewSearchedChain] = useState('')
    const [selectedFilter, setSelectedFilter] = useState(defaultFilter)

    const isAllChainsEnabled = useIsAllChainsEnabled()
    const { theme } = useTheme()

    const uniqueTags = chainTagsStore.uniqueTags
    const allChainTags = chainTagsStore.allChainTags

    const filterOptions = useMemo(() => {
      if (isCompassWallet()) {
        return []
      }

      return ['All', ...uniqueTags]
    }, [uniqueTags])

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
        return tags
      },
      [allChainTags],
    )

    let customChains = useCustomChains()
    const { data: featureFlags } = useFeatureFlags()

    if (isCompassWallet()) {
      customChains = []
    }

    const searchedChain = paramsSearchedChain ?? newSearchedChain
    const setSearchedChain = paramsSetSearchedChain ?? setNewSearchedChain
    const starredChains = useStarredChains()

    const [chains] = useManageChainData()
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
      }))

    const showChains = useMemo(() => [...chains, ..._customChains], [_customChains, chains])

    const newChainToAdd = useMemo(
      () => customChains.find((d) => d.key === newChain),
      [customChains, newChain],
    )

    const _filteredChains = useMemo(() => {
      return showChains.filter(function (chain) {
        if (
          (isCompassWallet() && chain.chainName === 'cosmos') ||
          !chain.active ||
          (onPage === 'AddCollection' &&
            ['omniflix', 'stargaze', 'forma', 'manta', 'aura', 'mainCoreum', 'lightlink'].includes(
              chain.chainName,
            ))
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

        const chainName = chainInfos[chain.chainName]?.chainName ?? chain.chainName
        return chainName.toLowerCase().includes(searchedChain.toLowerCase())
      })
    }, [chainInfos, showChains, chainsToShow, onPage, searchedChain])

    const filteredChains = useMemo(() => {
      let chains = _filteredChains

      if (!searchedChain && selectedFilter !== 'All') {
        chains = chains.filter((chain) => {
          const tags = getChainTags(chain)
          return tags?.includes(selectedFilter)
        })
      }

      const favouriteChains = chains
        .filter((chain) => starredChains.includes(chain.chainName))
        .sort((chainA, chainB) => chainA.chainName.localeCompare(chainB.chainName))

      const priorityChains = chains
        .filter(
          (chain) =>
            PriorityChains.includes(chain.chainName) && !starredChains.includes(chain.chainName),
        )
        .sort(
          (chainA, chainB) =>
            PriorityChains.indexOf(chainA.chainName) - PriorityChains.indexOf(chainB.chainName),
        )

      const otherChains = chains
        .filter(
          (chain) =>
            !starredChains.includes(chain.chainName) && !PriorityChains.includes(chain.chainName),
        )
        .sort((chainA, chainB) => chainA.chainName.localeCompare(chainB.chainName))

      return [...favouriteChains, ...priorityChains, ...otherChains]
    }, [_filteredChains, getChainTags, searchedChain, selectedFilter, starredChains])

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

    const inputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      }
    }, [])

    return (
      <>
        {!isCompassWallet() ? (
          <div className='flex items-center gap-2 mb-6'>
            <div
              className={
                'w-full flex gap-2 items-center h-11 bg-white-100 dark:bg-gray-950 rounded-[30px] py-2 px-4'
              }
            >
              <MagnifyingGlass size={20} className='text-gray-600 dark:text-gray-400' />
              <input
                placeholder={'Search chains'}
                className={
                  'flex flex-grow text-base text-gray-600 dark:text-gray-400 outline-none bg-white-0'
                }
                value={searchedChain}
                onChange={(e) => setSearchedChain(e.target.value)}
                ref={inputRef}
              />
            </div>

            {handleAddNewChainClick && (
              <div
                className='bg-white-100 dark:bg-gray-950 p-3 text-black-100 dark:text-white-100 rounded-[30px] cursor-pointer'
                onClick={handleAddNewChainClick}
              >
                <Plus size={20} className='text-black-100 dark:text-white-100' />
              </div>
            )}
          </div>
        ) : null}

        {!searchedChain && !isCompassWallet() ? (
          <div className='mb-6 flex gap-2 justify-start items-center overflow-x-auto hide-scrollbar'>
            {filterOptions.map((filter) => (
              <button
                key={filter}
                className={classNames(
                  'rounded-full text-xs !leading-[19.2px] bg-white-100 dark:bg-gray-950 font-medium h-[36px] py-1 px-3 border',
                  {
                    'text-black-100 dark:text-white-100 border-black-100 dark:border-white-100':
                      selectedFilter === filter,
                    'text-gray-800 dark:text-gray-200 border-transparent':
                      selectedFilter !== filter,
                  },
                )}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        ) : null}

        {selectedFilter === 'All' &&
        !searchedChain &&
        !isCompassWallet() &&
        showAggregatedOption &&
        isAllChainsEnabled ? (
          <div className='bg-white-100 dark:bg-gray-950 rounded-xl max-h-[100px] w-full mb-5'>
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
              showNewTag
            />
          </div>
        ) : null}
        <>
          {filteredChains.length === 0 ? (
            <EmptyCard
              isRounded
              subHeading='Try a different search term'
              src={Images.Misc.Explore}
              heading={`No results found`}
              data-testing-id='switch-chain-empty-card-heading-ele'
            />
          ) : !searchedChain ? (
            filteredChains.map((chain: ManageChainSettings, index: number) => (
              <ChainCardWrapper
                key={chain.chainName + index}
                chain={chain}
                handleClick={handleClick}
                selectedChain={selectedChain}
                onPage={onPage}
                index={index}
                showStars
              />
            ))
          ) : (
            [...filterOptions, 'Others'].map((tag) => {
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
        />
      </>
    )
  },
)

type ChainSelectorProps = {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
  readonly chainTagsStore: ChainTagsStore
  readonly defaultFilter?: string
}

const SelectChain = observer(
  ({ isVisible, onClose, chainTagsStore, defaultFilter }: ChainSelectorProps) => {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const selectedChain = useActiveChain()
    const setActiveChain = useSetActiveChain()
    const [searchedChain, setSearchedChain] = useState('')

    const onChainSelect = (chainName: AggregatedSupportedChain) => {
      setActiveChain(chainName)
      if (pathname !== '/home') {
        navigate('/home')
      }
      onClose()
    }

    const handleAddNewChainClick = useCallback(() => {
      const views = extension.extension.getViews({ type: 'popup' })
      if (views.length === 0) navigate('/add-chain', { replace: true })
      else window.open(extension.runtime.getURL('index.html#/add-chain'))
    }, [navigate])

    return (
      <BottomModal
        isOpen={isVisible}
        onClose={onClose}
        closeOnBackdropClick={true}
        title='Switch chain'
        containerClassName={`h-[calc(100%-${isCompassWallet() ? '102px' : '34px'})]`}
        className='max-h-[calc(100%-69px)]'
      >
        <ListChains
          onChainSelect={onChainSelect}
          selectedChain={selectedChain}
          searchedChain={searchedChain}
          setSearchedChain={(val) => setSearchedChain(val)}
          showAggregatedOption={true}
          handleAddNewChainClick={isCompassWallet() ? null : handleAddNewChainClick}
          chainTagsStore={chainTagsStore}
          defaultFilter={defaultFilter}
        />
      </BottomModal>
    )
  },
)

export default SelectChain
