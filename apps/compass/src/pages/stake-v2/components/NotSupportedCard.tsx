import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { useChainInfos } from 'hooks/useChainInfos'
import React from 'react'

import StakeStatusCard from './StakeStatusCard'

export default function NotSupportedCard({ onAction }: { onAction: () => void }) {
  const activeChain = useActiveChain()
  const chainInfos = useChainInfos()
  const activeChainInfo = chainInfos[activeChain]
  return (
    <StakeStatusCard
      title='Uh oh! Staking Unavailable...'
      onAction={onAction}
      message={`Staking is not yet available for ${activeChainInfo.chainName}. You can stake on other
          chains.`}
      backgroundColor='bg-orange-100 dark:bg-orange-900'
      backgroundColorDark='bg-orange-200 dark:bg-orange-800'
      color='text-orange-500 dark:text-orange-300'
    />
  )
}
