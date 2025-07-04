import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import BottomModal from 'components/new-bottom-modal'
import { PriorityChains } from 'config/constants'
import { useAllChainsPlaceholder } from 'pages/swaps-v2/hooks/useAllChainsPlaceholder'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { ChainsList } from './ChainsList'

type SelectChainSheetProps = {
  title?: string
  isOpen: boolean
  onClose: () => void
  chainsToShow: ChainInfo[]
  selectedChain: ChainInfo | undefined
  onChainSelect: (chain: ChainInfo) => void
  showAllChainsOption?: boolean
  priorityChainsIds?: string[]
}

export function SelectChainSheet({
  title,
  isOpen,
  onClose,
  chainsToShow,
  onChainSelect,
  selectedChain,
  showAllChainsOption = false,
  priorityChainsIds,
}: SelectChainSheetProps) {
  const [searchedChain, setSearchedChain] = useState('')
  const allChainsPlaceholder = useAllChainsPlaceholder()

  const sortedChainsToShow = useMemo(() => {
    const priorityChains: ChainInfo[] = []
    ;(priorityChainsIds ?? PriorityChains).forEach((chain) => {
      const chainToShow = chainsToShow.find((chainToShow) => chainToShow.key === chain)
      if (chainToShow) {
        priorityChains.push(chainToShow)
      }
    })

    const otherChains = chainsToShow
      .filter((chain) => !(priorityChainsIds ?? PriorityChains).includes(chain.key))
      .sort((chainA, chainB) => chainA.chainName.localeCompare(chainB.chainName))

    const sortedChains = [...priorityChains, ...otherChains]
    if (showAllChainsOption) {
      sortedChains.unshift(allChainsPlaceholder.chain as unknown as ChainInfo)
    }
    return sortedChains
  }, [allChainsPlaceholder, chainsToShow, priorityChainsIds, showAllChainsOption])

  const handleOnChainSelect = useCallback(
    (chain: ChainInfo) => {
      onChainSelect(chain)
    },
    [onChainSelect],
  )

  useEffect(() => {
    if (!isOpen) {
      setSearchedChain('')
    }
  }, [isOpen])

  return (
    <BottomModal
      title={title ?? `Select Chain`}
      onClose={() => {
        onClose()
      }}
      fullScreen={true}
      isOpen={isOpen}
      contentClassName='!bg-white-100 dark:!bg-gray-950 !overflow-hidden'
      className='p-0'
    >
      <ChainsList
        onChainSelect={handleOnChainSelect}
        selectedChain={selectedChain}
        chainsToShow={sortedChainsToShow}
        searchedChain={searchedChain}
        setSearchedChain={setSearchedChain}
        loadingChains={false}
      />
    </BottomModal>
  )
}
