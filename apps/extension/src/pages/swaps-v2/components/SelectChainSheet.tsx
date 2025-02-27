import BottomModal from 'components/bottom-modal'
import { EventName } from 'config/analytics'
import { PriorityChains } from 'config/constants'
import mixpanel from 'mixpanel-browser'
import React, { useCallback, useMemo, useState } from 'react'
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
  // eslint-disable-next-line no-unused-vars
  onChainSelect: (chain: TokenAssociatedChain) => void
  destinationAssets?: SourceToken[]
  showAllChainsOption?: boolean
}

export function SelectChainSheet({
  title,
  isOpen,
  onClose,
  chainsToShow,
  onChainSelect,
  selectedChain,
  selectedToken,
  destinationAssets,
  showAllChainsOption = false,
}: SelectChainSheetProps) {
  const [searchedChain, setSearchedChain] = useState('')
  const allChainsPlaceholder = useAllChainsPlaceholder()

  const sortedChainsToShow = useMemo(() => {
    const priorityChains: TokenAssociatedChain[] = []
    PriorityChains.forEach((chain) => {
      const chainToShow = chainsToShow.find((chainToShow) => chainToShow.chain.key === chain)
      if (chainToShow) {
        priorityChains.push(chainToShow)
      }
    })

    const otherChains = chainsToShow
      .filter((chain) => !PriorityChains.includes(chain.chain.key))
      .sort((chainA, chainB) => chainA.chain.chainName.localeCompare(chainB.chain.chainName))

    const sortedChains = [...priorityChains, ...otherChains]
    if (showAllChainsOption) {
      sortedChains.unshift(allChainsPlaceholder)
    }
    return sortedChains
  }, [allChainsPlaceholder, chainsToShow, showAllChainsOption])

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

  return (
    <BottomModal
      title={title ?? `Select Chain`}
      onClose={() => {
        emitMixpanelDropdownCloseEvent()
        onClose()
      }}
      isOpen={isOpen}
      closeOnBackdropClick={true}
      contentClassName='!bg-white-100 dark:!bg-gray-950 !overflow-hidden'
      className='p-0'
    >
      <ChainsList
        onChainSelect={handleOnChainSelect}
        selectedChain={selectedChain}
        selectedToken={selectedToken}
        chainsToShow={sortedChainsToShow}
        searchedChain={searchedChain}
        setSearchedChain={setSearchedChain}
      />
    </BottomModal>
  )
}
