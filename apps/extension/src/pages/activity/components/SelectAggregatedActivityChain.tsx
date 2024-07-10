import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import BottomModal from 'components/bottom-modal'
import { ListChains } from 'pages/home/SelectChain'
import React from 'react'

type SelectAggregatedActivityChainProps = {
  isVisible: boolean
  onClose: () => void
  chainsToShow: string[]
  selectedChain: SupportedChain
  onChainSelect: (chainName: SupportedChain) => void
}

export function SelectAggregatedActivityChain({
  isVisible,
  onClose,
  chainsToShow,
  selectedChain,
  onChainSelect,
}: SelectAggregatedActivityChainProps) {
  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      closeOnBackdropClick={true}
      title='Switch chain'
    >
      <ListChains
        selectedChain={selectedChain}
        onChainSelect={onChainSelect}
        chainsToShow={chainsToShow}
      />
    </BottomModal>
  )
}
