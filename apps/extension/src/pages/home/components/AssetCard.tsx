import { isTerraClassic, Token, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ChainInfosStore, PercentageChangeDataStore } from '@leapwallet/cosmos-wallet-store'
import { PageName } from 'config/analytics'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { AggregatedTokenCard } from './index'

type AssetCardProps = {
  asset: Token
  percentageChangeDataStore: PercentageChangeDataStore
  chainInfosStore: ChainInfosStore
  isPlaceholder?: boolean
}

export const AssetCard = observer(
  ({ asset, percentageChangeDataStore, chainInfosStore, isPlaceholder }: AssetCardProps) => {
    const {
      symbol,
      amount,
      usdValue,
      img,
      ibcChainInfo,
      coinMinimalDenom,
      name,
      chain,
      isEvm,
      tokenBalanceOnChain,
    } = asset
    const chains = chainInfosStore.chainInfos
    // const marketData = marketDataStore.data
    const percentageChangeData = percentageChangeDataStore.data

    const percentageChangeDataForToken = useMemo(() => {
      let key = asset.coinGeckoId ?? asset.coinMinimalDenom
      if (percentageChangeData?.[key]) {
        return percentageChangeData[key]
      }
      if (!asset.chain) {
        return undefined
      }
      const chainId = chains[asset.chain as SupportedChain]?.chainId
      key = `${chainId}-${asset.coinMinimalDenom}`
      return percentageChangeData?.[key] ?? percentageChangeData?.[key?.toLowerCase()]
    }, [asset, percentageChangeData, chains])

    const navigate = useNavigate()
    const activeChain = useActiveChain()

    const handleCardClick = () => {
      let tokenChain = chain?.replace('cosmoshub', 'cosmos')
      if (isTerraClassic(ibcChainInfo?.pretty_name ?? '') && coinMinimalDenom === 'uluna') {
        tokenChain = 'terra-classic'
      }

      if (!tokenChain) return

      sessionStorage.setItem('navigate-assetDetails-state', JSON.stringify(asset))
      navigate(
        `/assetDetails?assetName=${
          coinMinimalDenom.length > 0 ? coinMinimalDenom : symbol
        }&tokenChain=${tokenChain}&pageSource=${PageName.Home}`,
        { state: asset },
      )
    }

    return (
      <AggregatedTokenCard
        isPlaceholder={isPlaceholder}
        title={symbol ?? name}
        ibcChainInfo={ibcChainInfo}
        usdValue={usdValue}
        amount={amount}
        symbol={symbol}
        assetImg={img}
        onClick={handleCardClick}
        isEvm={isEvm}
        hasToShowEvmTag={isEvm && !chains[tokenBalanceOnChain ?? activeChain]?.evmOnlyChain}
        tokenBalanceOnChain={tokenBalanceOnChain ?? activeChain}
        percentChange24={percentageChangeDataForToken?.price_change_percentage_24h}
      />
    )
  },
)
