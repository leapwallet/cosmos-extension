import BottomModal from 'components/new-bottom-modal'
import { EventName } from 'config/analytics'
import { PriorityChains } from 'config/constants'
import mixpanel from 'mixpanel-browser'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

import { useAllChainsPlaceholder } from '../hooks/useAllChainsPlaceholder'
import { ChainsList, TokenAssociatedChain } from './ChainsList'

type SelectChainSheetProps = {
  title?: string
  isOpen: boolean
  onClose: () => void
  chainsToShow: TokenAssociatedChain[]
  selectedChain: SourceChain | undefined
  selectedToken: SourceToken | null
  loadingChains: boolean
  // eslint-disable-next-line no-unused-vars
  onChainSelect: (chain: TokenAssociatedChain) => void
  destinationAssets?: SourceToken[]
  showAllChainsOption?: boolean
  priorityChainsIds?: string[]
}

export function SelectChainSheet({
  title,
  isOpen,
  onClose,
  chainsToShow,
  loadingChains,
  onChainSelect,
  selectedChain,
  selectedToken,
  destinationAssets,
  showAllChainsOption = false,
  priorityChainsIds,
}: SelectChainSheetProps) {
  const [searchedChain, setSearchedChain] = useState('')
  const allChainsPlaceholder = useAllChainsPlaceholder()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const sortedChainsToShow = useMemo(() => {
    const priorityChains: TokenAssociatedChain[] = []
    ;(priorityChainsIds ?? PriorityChains).forEach((chain) => {
      const chainToShow = chainsToShow.find((chainToShow) => chainToShow.chain.key === chain)
      if (chainToShow) {
        priorityChains.push(chainToShow)
      }
    })

    const otherChains = chainsToShow
      .filter((chain) => !(priorityChainsIds ?? PriorityChains).includes(chain.chain.key))
      .sort((chainA, chainB) => chainA.chain.chainName.localeCompare(chainB.chain.chainName))

    const sortedChains = [...priorityChains, ...otherChains]
    if (showAllChainsOption) {
      sortedChains.unshift(allChainsPlaceholder)
    }
    return sortedChains
  }, [allChainsPlaceholder, chainsToShow, priorityChainsIds, showAllChainsOption])

  const emitMixpanelDropdownCloseEvent = useCallback(
    (tokenSelected?: string) => {
      try {
        mixpanel.track(EventName.DropdownClosed, {
          dropdownType: 'Destination Chain',
          tokenSelected,
          searchField: searchedChain,
        })
      } catch (error) {
        // ignore
      }
    },
    [searchedChain],
  )

  const handleOnChainSelect = useCallback(
    (tokenAssociatedChain: TokenAssociatedChain) => {
      onChainSelect(tokenAssociatedChain)
      const destToken = destinationAssets?.find(
        (asset) => asset.skipAsset.chainId === tokenAssociatedChain.chain.chainId,
      )
      emitMixpanelDropdownCloseEvent(
        `${destToken?.symbol} (${tokenAssociatedChain.chain.chainName})`,
      )
    },
    [destinationAssets, emitMixpanelDropdownCloseEvent, onChainSelect],
  )

  useEffect(() => {
    if (isOpen) {
      setSearchedChain('')
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 200)
    }
  }, [isOpen])

  return (
    <BottomModal
      title={title ?? `Select Chain`}
      onClose={() => {
        emitMixpanelDropdownCloseEvent()
        onClose()
      }}
      fullScreen={true}
      isOpen={isOpen}
      contentClassName='!overflow-hidden'
      className='p-0'
    >
      <ChainsList
        ref={searchInputRef}
        onChainSelect={handleOnChainSelect}
        selectedChain={selectedChain}
        selectedToken={selectedToken}
        chainsToShow={sortedChainsToShow}
        searchedChain={searchedChain}
        setSearchedChain={setSearchedChain}
        loadingChains={loadingChains}
      />
    </BottomModal>
  )
}
