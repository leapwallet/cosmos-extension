import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { useChainInfos } from 'hooks/useChainInfos'
import React from 'react'

import StakeStatusCard from './StakeStatusCard'

export default function ComingSoonCard({ onAction }: { onAction: () => void }) {
  const activeChain = useActiveChain()
  const chainInfos = useChainInfos()
  const activeChainInfo = chainInfos[activeChain]

  return (
    <StakeStatusCard
      title='Coming soon!'
      onAction={onAction}
      message={`Staking for ${activeChainInfo.chainName} is coming soon. Devs are hard at work. Stay tuned.`}
      backgroundColor='bg-blue-100 dark:bg-blue-900'
      backgroundColorDark='bg-blue-200 dark:bg-blue-800'
      color='text-blue-600 dark:text-blue-400'
    />
  )
}
