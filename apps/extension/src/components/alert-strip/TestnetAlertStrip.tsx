import { useActiveChain, useChainInfo, useSelectedNetwork } from '@leapwallet/cosmos-wallet-hooks'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useChainPageInfo } from 'hooks'
import React, { useMemo } from 'react'
import { AggregatedSupportedChain } from 'types/utility'

import { AlertStrip } from './index'

const TestnetAlertStrip = React.memo(() => {
  const activeNetwork = useSelectedNetwork()
  const activeChainInfo = useChainInfo()
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const { topChainColor } = useChainPageInfo()

  const chainName = useMemo(() => {
    if (!activeChainInfo) {
      return ''
    }

    if (activeChainInfo.chainName.includes('Testnet')) {
      return activeChainInfo.chainName
    }

    return activeChainInfo.chainName + ' Testnet'
  }, [activeChainInfo])

  if (activeNetwork !== 'testnet' || activeChain === AGGREGATED_CHAIN_KEY) {
    return null
  }

  return (
    <AlertStrip message={`You are on ${chainName}`} bgColor={topChainColor} alwaysShow={true} />
  )
})

TestnetAlertStrip.displayName = 'TestnetAlertStrip'

export { TestnetAlertStrip }
