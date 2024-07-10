import {
  AggregatedStake,
  useAggregatedStakeStore,
  useFillAggregatedStake,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AggregatedNullComponents } from 'components/aggregated'
import React from 'react'

type FetchChainStakeProps = {
  chain: SupportedChain
  setAggregatedStake: (aggregatedStake: AggregatedStake) => void
}

const FetchChainStake = React.memo(function ({ chain, setAggregatedStake }: FetchChainStakeProps) {
  useFillAggregatedStake(chain, setAggregatedStake)
  return <></>
})

FetchChainStake.displayName = 'FetchChainStake'

export const AggregatedStakeNullComponents = React.memo(function () {
  const { setAggregatedStake } = useAggregatedStakeStore()

  return (
    <AggregatedNullComponents
      setAggregatedStore={setAggregatedStake}
      render={({ key, chain, setAggregatedStore }) => (
        <FetchChainStake key={key} chain={chain} setAggregatedStake={setAggregatedStore} />
      )}
    />
  )
})

AggregatedStakeNullComponents.displayName = 'AggregatedStakeNullComponents'
