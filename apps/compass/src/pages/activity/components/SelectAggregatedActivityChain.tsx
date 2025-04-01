import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import BottomModal from 'components/bottom-modal'
import { observer } from 'mobx-react-lite'
import { ListChains } from 'pages/home/SelectChain'
import React from 'react'

type SelectAggregatedActivityChainProps = {
  isVisible: boolean
  onClose: () => void
  chainsToShow: string[]
  selectedChain: SupportedChain
  onChainSelect: (chainName: SupportedChain) => void
}

export const SelectAggregatedActivityChain = observer(
  ({
    isVisible,
    onClose,
    chainsToShow,
    selectedChain,
    onChainSelect,
  }: SelectAggregatedActivityChainProps) => {
    return (
      <BottomModal isOpen={isVisible} onClose={onClose} title='Switch chain'>
        <ListChains
          selectedChain={selectedChain}
          onChainSelect={onChainSelect}
          chainsToShow={chainsToShow}
        />
      </BottomModal>
    )
  },
)
