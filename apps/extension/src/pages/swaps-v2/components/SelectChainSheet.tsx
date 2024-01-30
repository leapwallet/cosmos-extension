import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { SelectChainSheet as SelectChain } from 'pages/home/side-nav/CustomEndpoints'
import React, { useMemo } from 'react'
import { SourceChain } from 'types/swap'

type SelectChainSheetProps = {
  isOpen: boolean
  onClose: () => void
  chainsToShow: SourceChain[]
  selectedChain: SourceChain | undefined
  // eslint-disable-next-line no-unused-vars
  onChainSelect: (chain: SourceChain) => void
}

export function SelectChainSheet({
  isOpen,
  onClose,
  chainsToShow,
  onChainSelect,
  selectedChain,
}: SelectChainSheetProps) {
  const chainsToList = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return chainsToShow.map((chainToShow) => chainToShow.chainRegistryPath)
  }, [chainsToShow])

  const handleOnChainSelect = (chain: SupportedChain) => {
    const selectedChain = chainsToShow.find((chainToShow) => chainToShow.key === chain)

    if (selectedChain) {
      onChainSelect(selectedChain)
    }
  }

  return (
    <SelectChain
      isVisible={isOpen}
      onClose={onClose}
      chainsToShow={chainsToList}
      selectedChain={(selectedChain?.key ?? '') as SupportedChain}
      onChainSelect={handleOnChainSelect}
    />
  )
}
