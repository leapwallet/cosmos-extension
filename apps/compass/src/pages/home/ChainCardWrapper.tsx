import { useCustomChains } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useChainInfos } from 'hooks/useChainInfos'
import { GenericLight } from 'images/logos'
import React from 'react'
import { ManageChainSettings } from 'stores/manage-chains-store'
import { AggregatedSupportedChain } from 'types/utility'

import { ChainCard } from './components'

export function ChainCardWrapper({
  chain,
  handleClick,
  handleDeleteClick,
  selectedChain,
  onPage,
  index,
}: {
  chain: ManageChainSettings
  handleClick: (chainName: AggregatedSupportedChain, beta?: boolean) => void
  handleDeleteClick?: (chainKey: SupportedChain) => void
  selectedChain: SupportedChain
  onPage: 'AddCollection' | undefined
  showStars: boolean
  index: number
}) {
  const chainInfos = useChainInfos()
  const customChains = useCustomChains()

  if (!chain) {
    return null
  }

  let chainInfo: ChainInfo | undefined = chainInfos[chain.chainName]
  if (!chainInfo) {
    chainInfo = customChains.find((d) => d.key === chain.chainName)
  }

  const img = chainInfo?.chainSymbolImageUrl ?? GenericLight
  const chainName = chainInfo?.chainName ?? chain.formattedName ?? chain.chainName

  return (
    <div
      key={chain.chainName + index}
      className='bg-white-100 dark:bg-gray-950 rounded-xl max-h-[100px] w-full mb-3'
    >
      <ChainCard
        handleClick={handleClick}
        handleDeleteClick={handleDeleteClick}
        beta={chain.beta}
        formattedChainName={chainName}
        chainName={chain.chainName}
        selectedChain={selectedChain}
        img={img}
        onPage={onPage}
        showStars
      />
    </div>
  )
}
