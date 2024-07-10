import {
  AggregatedActivity,
  useAggregatedActivityStore,
  useFillAggregatedActivity,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AggregatedNullComponents } from 'components/aggregated'
import React from 'react'

type FetchChainActivityProps = {
  chain: SupportedChain
  setAggregatedActivity: (aggregatedActivity: AggregatedActivity) => void
}

const FetchChainActivity = React.memo(function ({
  chain,
  setAggregatedActivity,
}: FetchChainActivityProps) {
  useFillAggregatedActivity(chain, setAggregatedActivity)
  return <></>
})

FetchChainActivity.displayName = 'FetchChainActivity'

export const AggregatedActivityNullComponents = React.memo(function () {
  const { setAggregatedActivity } = useAggregatedActivityStore()

  return (
    <AggregatedNullComponents
      setAggregatedStore={setAggregatedActivity}
      render={({ key, chain, setAggregatedStore }) => (
        <FetchChainActivity key={key} chain={chain} setAggregatedActivity={setAggregatedStore} />
      )}
    />
  )
})

AggregatedActivityNullComponents.displayName = 'AggregatedActivityNullComponents'
