import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ChainTagsStore } from '@leapwallet/cosmos-wallet-store'
import BottomModal from 'components/new-bottom-modal'
import { observer } from 'mobx-react-lite'
import { ListChains } from 'pages/home/SelectChain'
import React from 'react'

type SelectAggregatedActivityChainProps = {
  isVisible: boolean
  onClose: () => void
  chainsToShow: string[]
  selectedChain: SupportedChain
  onChainSelect: (chainName: SupportedChain) => void
  chainTagsStore: ChainTagsStore
}

export const SelectAggregatedActivityChain = observer(
  ({
    isVisible,
    onClose,
    chainsToShow,
    selectedChain,
    onChainSelect,
    chainTagsStore,
  }: SelectAggregatedActivityChainProps) => {
    return (
      <BottomModal isOpen={isVisible} onClose={onClose} fullScreen title='Switch chain'>
        <ListChains
          selectedChain={selectedChain}
          onChainSelect={onChainSelect}
          chainsToShow={chainsToShow}
          chainTagsStore={chainTagsStore}
        />
      </BottomModal>
    )
  },
)
