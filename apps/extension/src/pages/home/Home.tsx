import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { PageName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { usePageView } from 'hooks/analytics/usePageView'
import React from 'react'
import { AggregatedSupportedChain } from 'types/utility'

import { AggregatedHome, ChainHome } from './components'

export default function Home() {
  usePageView(PageName.Home)
  const activeChain = useActiveChain() as AggregatedSupportedChain

  if (activeChain === AGGREGATED_CHAIN_KEY) {
    return <AggregatedHome />
  }

  return <ChainHome />
}
