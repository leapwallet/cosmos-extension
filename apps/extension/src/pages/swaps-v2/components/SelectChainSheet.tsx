import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import React, { useMemo } from 'react'
import { SourceChain } from 'types/swap'

import { ChainsList } from './ChainsList'

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
    <BottomModal
      title='Select Chain'
      onClose={onClose}
      isOpen={isOpen}
      closeOnBackdropClick={true}
      hideActionButton={true}
      showSecondaryActionButton={true}
      containerClassName='!bg-white-100 dark:!bg-gray-950'
      headerClassName='!bg-white-100 dark:!bg-gray-950'
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='p-6'
      secondaryActionButton={
        <div className='absolute top-1 right-6'>
          <Buttons.Cancel onClick={onClose} />
        </div>
      }
    >
      <ChainsList
        onChainSelect={handleOnChainSelect}
        selectedChain={(selectedChain?.key ?? '') as SupportedChain}
        chainsToShow={chainsToList}
      />
    </BottomModal>
  )
}
