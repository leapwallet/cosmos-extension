import {
  AggregatedGovernance,
  useAggregatedGovernanceStore,
  useFillAggregatedGovernance,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AggregatedNullComponents } from 'components/aggregated'
import React from 'react'

type FetchChainGovernanceProps = {
  chain: SupportedChain
  setAggregatedGovernance: (aggregatedGovernance: AggregatedGovernance) => void
}

const FetchChainGovernance = React.memo(function ({
  chain,
  setAggregatedGovernance,
}: FetchChainGovernanceProps) {
  useFillAggregatedGovernance(chain, setAggregatedGovernance)
  return <></>
})

FetchChainGovernance.displayName = 'FetchChainGovernance'

export const AggregatedGovernanceNullComponents = React.memo(function () {
  const { setAggregatedGovernance } = useAggregatedGovernanceStore()

  return (
    <AggregatedNullComponents
      setAggregatedStore={setAggregatedGovernance}
      render={({ key, chain, setAggregatedStore }) => (
        <FetchChainGovernance
          key={key}
          chain={chain}
          setAggregatedGovernance={setAggregatedStore}
        />
      )}
    />
  )
})

AggregatedGovernanceNullComponents.displayName = 'AggregatedGovernanceNullComponents'
