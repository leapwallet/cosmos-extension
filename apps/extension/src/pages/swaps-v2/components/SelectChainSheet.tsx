import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import BottomModal from 'components/bottom-modal'
import React, { useCallback, useMemo } from 'react'
import { SourceChain } from 'types/swap'

import { ChainsList } from './ChainsList'

type SelectChainSheetProps = {
  title?: string
  isOpen: boolean
  onClose: () => void
  chainsToShow: SourceChain[]
  selectedChain: SourceChain | undefined
  // eslint-disable-next-line no-unused-vars
  onChainSelect: (chain: SourceChain) => void
}

export function SelectChainSheet({
  title,
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

  const handleOnChainSelect = useCallback(
    (chain: SupportedChain) => {
      const selectedChain = chainsToShow.find((chainToShow) => chainToShow.key === chain)

      if (selectedChain) {
        onChainSelect(selectedChain)
      }
    },
    [chainsToShow, onChainSelect],
  )

  return (
    <BottomModal
      title={title ?? `Select Chain`}
      onClose={onClose}
      isOpen={isOpen}
      closeOnBackdropClick={true}
      contentClassName='!bg-white-100 dark:!bg-gray-950 !overflow-hidden'
      className='p-6'
    >
      <ChainsList
        onChainSelect={handleOnChainSelect}
        selectedChain={(selectedChain?.key ?? '') as SupportedChain}
        chainsToShow={chainsToList}
      />
    </BottomModal>
  )
}
