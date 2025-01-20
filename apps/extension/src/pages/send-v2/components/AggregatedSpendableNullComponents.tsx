import {
  AggregatedSpendableToken,
  useAggregatedSpendableTokensStore,
  useFillAggregatedSpendableTokens,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AggregatedChainsStore } from '@leapwallet/cosmos-wallet-store'
import { AggregatedNullComponents } from 'components/aggregated'
import { observer } from 'mobx-react-lite'
import React from 'react'

type FetchSpendableChainBalanceProps = {
  chain: SupportedChain
  setAggregatedSpendableTokens: (aggregatedSpendableTokens: AggregatedSpendableToken) => void
}

const FetchSpendableChainBalance = React.memo(function ({
  chain,
  setAggregatedSpendableTokens,
}: FetchSpendableChainBalanceProps) {
  useFillAggregatedSpendableTokens(chain, setAggregatedSpendableTokens)
  return <></>
})

FetchSpendableChainBalance.displayName = 'FetchSpendableChainBalance'

export const AggregatedSpendableNullComponents = observer(function ({
  aggregatedChainsStore,
}: {
  aggregatedChainsStore: AggregatedChainsStore
}) {
  const { setAggregatedSpendableTokens } = useAggregatedSpendableTokensStore()

  return (
    <AggregatedNullComponents
      aggregatedChainsStore={aggregatedChainsStore}
      setAggregatedStore={setAggregatedSpendableTokens}
      render={({ key, chain, setAggregatedStore }) => (
        <FetchSpendableChainBalance
          key={key}
          chain={chain}
          setAggregatedSpendableTokens={setAggregatedStore}
        />
      )}
    />
  )
})

AggregatedSpendableNullComponents.displayName = 'AggregatedSpendableNullComponents'
