import {
  AggregatedToken,
  getCw20TokensSupportedChains,
  getErc20TokensSupportedChains,
  useAggregatedTokensStore,
  useFetchCW20Tokens,
  useFetchERC20Tokens,
  useFillAggregatedTokens,
  useGetStorageLayer,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AggregatedNullComponents } from 'components/aggregated'
import React, { useEffect, useState } from 'react'

type FetchChainBalanceProps = {
  chain: SupportedChain
  setAggregatedTokens: (aggregatedTokens: AggregatedToken) => void
  forceCw20SupportedChains?: string[]
  forceErc20SupportedChains?: string[]
}

const FetchChainBalance = React.memo(function ({
  chain,
  setAggregatedTokens,
  forceCw20SupportedChains,
  forceErc20SupportedChains,
}: FetchChainBalanceProps) {
  useFillAggregatedTokens(chain, setAggregatedTokens)

  useFetchCW20Tokens(chain, forceCw20SupportedChains)
  useFetchERC20Tokens(chain, forceErc20SupportedChains)
  return <></>
})

FetchChainBalance.displayName = 'FetchChainBalance'

export const AggregatedHomeNullComponents = React.memo(function () {
  const { setAggregatedTokens } = useAggregatedTokensStore()
  const [cw20SupportedChains, setCw20SupportedChains] = useState<string[]>([])
  const [erc20SupportedChains, setErc20SupportedChains] = useState<string[]>([])
  const storage = useGetStorageLayer()

  useEffect(() => {
    ;(async function () {
      const { chains } = await getCw20TokensSupportedChains(storage)
      setCw20SupportedChains(chains)
    })()
  }, [storage])

  useEffect(() => {
    ;(async function () {
      const { chains } = await getErc20TokensSupportedChains(storage)
      setErc20SupportedChains(chains)
    })()
  }, [storage])

  return (
    <AggregatedNullComponents
      setAggregatedStore={setAggregatedTokens}
      render={({ key, chain, setAggregatedStore }) => (
        <FetchChainBalance
          key={key}
          chain={chain}
          setAggregatedTokens={setAggregatedStore}
          forceCw20SupportedChains={cw20SupportedChains}
          forceErc20SupportedChains={erc20SupportedChains}
        />
      )}
    />
  )
})

AggregatedHomeNullComponents.displayName = 'AggregatedHomeNullComponents'
