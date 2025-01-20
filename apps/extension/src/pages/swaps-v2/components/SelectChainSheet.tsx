import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import BottomModal from 'components/bottom-modal'
import { EventName } from 'config/analytics'
import { PriorityChains } from 'config/constants'
import mixpanel from 'mixpanel-browser'
import React, { useCallback, useMemo, useState } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

import { ChainsList } from './ChainsList'

type SelectChainSheetProps = {
  title?: string
  isOpen: boolean
  onClose: () => void
  chainsToShow: SourceChain[]
  selectedChain: SourceChain | undefined
  // eslint-disable-next-line no-unused-vars
  onChainSelect: (chain: SourceChain) => void
  destinationAssets?: SourceToken[]
}

export function SelectChainSheet({
  title,
  isOpen,
  onClose,
  chainsToShow,
  onChainSelect,
  selectedChain,
  destinationAssets,
}: SelectChainSheetProps) {
  const [searchedChain, setSearchedChain] = useState('')

  const sortedChainsToShow = useMemo(() => {
    const priorityChains: SourceChain[] = []
    PriorityChains.forEach((chain) => {
      const chainToShow = chainsToShow.find((chainToShow) => chainToShow.key === chain)
      if (chainToShow) {
        priorityChains.push(chainToShow)
      }
    })

    const otherChains = chainsToShow
      .filter((chain) => !PriorityChains.includes(chain.key))
      .sort((chainA, chainB) => chainA.chainName.localeCompare(chainB.chainName))

    return [...priorityChains, ...otherChains]
  }, [chainsToShow])

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
    (chain: SupportedChain) => {
      const selectedChain = chainsToShow.find((chainToShow) => chainToShow.key === chain)

      if (selectedChain) {
        onChainSelect(selectedChain)
        const destToken = destinationAssets?.find(
          (asset) => asset.skipAsset.chainId === selectedChain.chainId,
        )
        emitMixpanelDropdownCloseEvent(`${destToken?.symbol} (${selectedChain.chainName})`)
      }
    },
    [chainsToShow, destinationAssets, emitMixpanelDropdownCloseEvent, onChainSelect],
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
      className='p-6'
    >
      <ChainsList
        onChainSelect={handleOnChainSelect}
        selectedChain={(selectedChain?.key ?? '') as SupportedChain}
        chainsToShow={sortedChainsToShow}
        searchedChain={searchedChain}
        setSearchedChain={setSearchedChain}
      />
    </BottomModal>
  )
}
