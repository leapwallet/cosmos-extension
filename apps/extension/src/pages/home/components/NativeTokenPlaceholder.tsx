import { Token, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { marketDataStore } from 'stores/balance-store'
import { chainInfoStore, compassTokensAssociationsStore } from 'stores/chain-infos-store'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { AggregatedSupportedChain } from 'types/utility'

import { AssetCard } from './AssetCard'

export const NativeTokenPlaceholder = observer(() => {
  const chains = useGetChains()
  const activeChain = useActiveChain() as AggregatedSupportedChain

  const emptyNativeTokens = useMemo(() => {
    if (activeChain === AGGREGATED_CHAIN_KEY || !chains) {
      return null
    }

    const chainInfo = chains[activeChain]
    return Object.keys(chainInfo.nativeDenoms).map((item): Token => {
      const denom = rootDenomsStore.allDenoms[item]
      return {
        ...denom,
        amount: '0',
        symbol: denom.name ?? denom.coinDenom,
        img: denom.icon,
        chain: denom.chain ?? chainInfo.key,
        tokenBalanceOnChain: chainInfo.key,
      }
    })
  }, [activeChain, chains])

  return (
    <>
      {emptyNativeTokens?.map((asset) => (
        <AssetCard
          key={asset.symbol}
          asset={asset}
          style={{ marginBottom: 16 }}
          marketDataStore={marketDataStore}
          compassTokensAssociationsStore={compassTokensAssociationsStore}
          chainInfosStore={chainInfoStore}
          isPlaceholder
        />
      ))}
    </>
  )
})
