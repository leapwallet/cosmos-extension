import {
  AggregatedActivity,
  useAggregatedActivityStore,
  useFillAggregatedActivity,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { DenomsStore } from '@leapwallet/cosmos-wallet-store'
import { AggregatedNullComponents } from 'components/aggregated'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { denomsStore } from 'stores/denoms-store-instance'

type FetchChainActivityProps = {
  denomsStore: DenomsStore
  chain: SupportedChain
  setAggregatedActivity: (aggregatedActivity: AggregatedActivity) => void
}

const FetchChainActivity = observer(
  ({ denomsStore, chain, setAggregatedActivity }: FetchChainActivityProps) => {
    useFillAggregatedActivity(denomsStore.denoms, chain, setAggregatedActivity)
    return <></>
  },
)

FetchChainActivity.displayName = 'FetchChainActivity'

export const AggregatedActivityNullComponents = React.memo(function () {
  const { setAggregatedActivity } = useAggregatedActivityStore()

  return (
    <AggregatedNullComponents
      setAggregatedStore={setAggregatedActivity}
      render={({ key, chain, setAggregatedStore }) => (
        <FetchChainActivity
          key={key}
          chain={chain}
          setAggregatedActivity={setAggregatedStore}
          denomsStore={denomsStore}
        />
      )}
    />
  )
})

AggregatedActivityNullComponents.displayName = 'AggregatedActivityNullComponents'
