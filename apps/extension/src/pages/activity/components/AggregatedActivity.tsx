import { useAggregatedActivity, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import React, { useMemo, useState } from 'react'

import { AggregatedActivityNullComponents, GeneralActivity } from './index'

const AggregatedActivity = React.memo(() => {
  const { perChainActivity } = useAggregatedActivity()
  const chains = useGetChains()
  const [selectedChain, setSelectedChain] = useState(chains.cosmos.key)

  const { txResponse } = useMemo(
    () => perChainActivity?.[selectedChain] ?? {},
    [perChainActivity, selectedChain],
  )

  const filteredChains = useMemo(() => {
    return ((Object.keys(perChainActivity ?? {}) ?? []) as SupportedChain[]).map(
      (chainKey) => chains[chainKey].chainRegistryPath,
    )
  }, [chains, perChainActivity])

  return (
    <>
      <AggregatedActivityNullComponents />

      <GeneralActivity
        txResponse={txResponse}
        filteredChains={filteredChains}
        forceNetwork='mainnet'
        forceChain={selectedChain}
        setSelectedChain={setSelectedChain}
      />
    </>
  )
})

AggregatedActivity.displayName = 'AggregatedActivity'
export { AggregatedActivity }
