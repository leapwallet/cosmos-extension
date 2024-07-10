import { useCustomChains, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import BottomModal from 'components/bottom-modal'
import { EmptyCard } from 'components/empty-card'
import { AGGREGATED_CHAIN_KEY, PriorityChains } from 'config/constants'
import { useStarredChains } from 'hooks/settings'
import { ManageChainSettings, useManageChainData } from 'hooks/settings/useManageChains'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AggregatedSupportedChain } from 'types/utility'
import { isCompassWallet } from 'utils/isCompassWallet'
import extension from 'webextension-polyfill'

import { useActiveChain, useSetActiveChain } from '../../hooks/settings/useActiveChain'
import AddFromChainStore from './AddFromChainStore'
import { ChainCard } from './components'

export type ListChainsProps = {
  onChainSelect: (chainName: SupportedChain) => void
  selectedChain: SupportedChain
  onPage?: 'AddCollection'
  chainsToShow?: string[]
  searchedChain?: string
  setSearchedChain?: (val: string) => void
  showAggregatedOption?: boolean
  handleAddNewChainClick?: VoidFunction | null
}

export function ListChains({
  onChainSelect,
  selectedChain,
  onPage,
  chainsToShow,
  searchedChain: paramsSearchedChain,
  setSearchedChain: paramsSetSearchedChain,
  showAggregatedOption = false,
  handleAddNewChainClick,
}: ListChainsProps) {
  const [newChain, setNewChain] = useState<string | null>(null)
  const [newSearchedChain, setNewSearchedChain] = useState('')
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
    .map((chain) => chain.chainId)

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
        (onPage === 'AddCollection' && ['omniflix', 'stargaze'].includes(chain.chainName))
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
    const favouriteChains = _filteredChains
      .filter((chain) => starredChains.includes(chain.chainName))
      .sort((chainA, chainB) => chainA.chainName.localeCompare(chainB.chainName))

    const priorityChains = _filteredChains
      .filter(
        (chain) =>
          PriorityChains.includes(chain.chainName) && !starredChains.includes(chain.chainName),
      )
      .sort(
        (chainA, chainB) =>
          PriorityChains.indexOf(chainA.chainName) - PriorityChains.indexOf(chainB.chainName),
      )

    const otherChains = _filteredChains
      .filter(
        (chain) =>
          !starredChains.includes(chain.chainName) && !PriorityChains.includes(chain.chainName),
      )
      .sort((chainA, chainB) => chainA.chainName.localeCompare(chainB.chainName))

    return [...favouriteChains, ...priorityChains, ...otherChains]
  }, [searchedChain])

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
      <div className='flex items-center gap-2 mb-6'>
        <div
          className={
            'w-full flex gap-2 items-center h-11 bg-white-100 dark:bg-gray-950 rounded-[30px] py-2 px-4'
          }
        >
          <div
            className='material-icons-round text-gray-600 dark:text-gray-400'
            style={{ fontSize: 20 }}
          >
            search
          </div>
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
            className='material-icons-round bg-white-100 dark:bg-gray-950 p-3 text-black-100 dark:text-white-100 rounded-[30px] cursor-pointer'
            style={{ fontSize: 20 }}
            onClick={handleAddNewChainClick}
          >
            add
          </div>
        )}
      </div>

      {!isCompassWallet() &&
      showAggregatedOption &&
      featureFlags?.give_all_chains_option_in_wallet?.extension === 'active' ? (
        <div className='bg-white-100 dark:bg-gray-950 rounded-xl max-h-[100px] w-full mb-5'>
          <ChainCard
            beta={false}
            handleClick={handleClick}
            formattedChainName='All chains'
            chainName={AGGREGATED_CHAIN_KEY}
            selectedChain={selectedChain}
            img={Images.Misc.AggregatedViewSvg}
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
        ) : (
          filteredChains.map((chain: ManageChainSettings, index: number) => {
            if (!chain) {
              return null
            }

            let chainInfo: ChainInfo | undefined = chainInfos[chain.chainName]
            if (!chainInfo) {
              chainInfo = customChains.find((d) => d.key === chain.chainName)
            }

            const img = chainInfo?.chainSymbolImageUrl ?? GenericLight
            const chainName = chainInfo?.chainName ?? chain.chainName

            return (
              <div
                key={chain.chainName + index}
                className='bg-white-100 dark:bg-gray-950 rounded-xl max-h-[100px] w-full mb-3'
              >
                <ChainCard
                  handleClick={handleClick}
                  beta={chain.beta}
                  formattedChainName={chainName}
                  chainName={chain.chainName}
                  selectedChain={selectedChain}
                  img={img}
                  onPage={onPage}
                  showStars
                />
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
}

type ChainSelectorProps = {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
}

export default function SelectChain({ isVisible, onClose }: ChainSelectorProps) {
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
    >
      <ListChains
        onChainSelect={onChainSelect}
        selectedChain={selectedChain}
        searchedChain={searchedChain}
        setSearchedChain={(val) => setSearchedChain(val)}
        showAggregatedOption={true}
        handleAddNewChainClick={isCompassWallet() ? null : handleAddNewChainClick}
      />
    </BottomModal>
  )
}
