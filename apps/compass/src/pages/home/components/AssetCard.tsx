import { isTerraClassic, Token, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  ChainInfosStore,
  CompassSeiTokensAssociationStore,
  MarketDataStore,
} from '@leapwallet/cosmos-wallet-store'
import { PageName } from 'config/analytics'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { AggregatedTokenCard } from './index'

type AssetCardProps = {
  asset: Token
  marketDataStore: MarketDataStore
  compassTokensAssociationsStore: CompassSeiTokensAssociationStore
  chainInfosStore: ChainInfosStore
  isPlaceholder?: boolean
  className?: string
}

export const AssetCard = observer(
  ({
    asset,
    marketDataStore,
    compassTokensAssociationsStore,
    chainInfosStore,
    isPlaceholder,
    className,
  }: AssetCardProps) => {
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
    const marketData = marketDataStore.data
    const compassSeiToEvmMapping = compassTokensAssociationsStore.compassSeiToEvmMapping

    const marketDataForToken = useMemo(() => {
      let key = asset.coinGeckoId ?? asset.coinMinimalDenom
      if (marketData?.[key]) {
        return marketData[key]
      }
      if (!asset.chain) {
        return undefined
      }
      const chainId = chains[asset.chain as SupportedChain]?.chainId
      key = `${chainId}-${asset.coinMinimalDenom}`
      const _marketData = marketData?.[key] ?? marketData?.[key?.toLowerCase()]
      if (_marketData) {
        return _marketData
      }
      if (!compassSeiToEvmMapping[asset.coinMinimalDenom]) {
        return undefined
      }
      key = `${chainId}-${compassSeiToEvmMapping[asset.coinMinimalDenom]}`
      return marketData?.[key] ?? marketData?.[key?.toLowerCase()]
    }, [asset, marketData, chains, compassSeiToEvmMapping])

    const navigate = useNavigate()
    const activeChain = useActiveChain()

    const handleCardClick = () => {
      let tokenChain = chain?.replace('cosmoshub', 'cosmos')
      if (isTerraClassic(ibcChainInfo?.pretty_name ?? '') && coinMinimalDenom === 'uluna') {
        tokenChain = 'terra'
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
        key={`${symbol}-${coinMinimalDenom}-${ibcChainInfo?.channelId}-${ibcChainInfo?.pretty_name}`}
        isPlaceholder={isPlaceholder}
        title={symbol ?? name}
        ibcChainInfo={ibcChainInfo}
        usdValue={usdValue}
        amount={amount}
        symbol={symbol}
        assetImg={img}
        onClick={handleCardClick}
        isEvm={isEvm && !chains[tokenBalanceOnChain ?? activeChain]?.evmOnlyChain}
        tokenBalanceOnChain={tokenBalanceOnChain ?? activeChain}
        percentChange24={marketDataForToken?.price_change_percentage_24h}
        className={className}
      />
    )
  },
)
