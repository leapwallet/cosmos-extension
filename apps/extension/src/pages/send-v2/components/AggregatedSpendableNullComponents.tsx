import {
  AggregatedSpendableToken,
  useAggregatedSpendableTokensStore,
  useFillAggregatedSpendableTokens,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AggregatedNullComponents } from 'components/aggregated'
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

export const AggregatedSpendableNullComponents = React.memo(function () {
  const { setAggregatedSpendableTokens } = useAggregatedSpendableTokensStore()

  return (
    <AggregatedNullComponents
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
