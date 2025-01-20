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
  selectedChain,
  onPage,
  index,
}: {
  chain: ManageChainSettings
  handleClick: (chainName: AggregatedSupportedChain, beta?: boolean) => void
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
  const chainName = chainInfo?.chainName ?? chain.chainName

  return (
    <div
      key={chain.chainName + index}
      className='bg-white-100 dark:bg-gray-950 rounded-xl max-h-[100px] w-full mb-3'
    >
      <ChainCard
        handleClick={handleClick}
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
