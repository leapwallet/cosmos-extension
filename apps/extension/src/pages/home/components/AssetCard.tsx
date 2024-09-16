import {
  isTerraClassic,
  Token,
  useActiveChain,
  useGetChains,
} from '@leapwallet/cosmos-wallet-hooks'
import React from 'react'
import { useNavigate } from 'react-router'

import { AggregatedTokenCard } from './index'

type AssetCardProps = { asset: Token; style?: React.CSSProperties }

export function AssetCard({ asset, style }: AssetCardProps) {
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

  const navigate = useNavigate()
  const activeChain = useActiveChain()
  const chains = useGetChains()

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
      }&tokenChain=${tokenChain}`,
      { state: asset },
    )
  }

  return (
    <div
      style={style}
      key={`${symbol}-${coinMinimalDenom}-${ibcChainInfo?.channelId}-${ibcChainInfo?.pretty_name}`}
      className='w-[352px]'
    >
      <AggregatedTokenCard
        title={name ?? symbol}
        ibcChainInfo={ibcChainInfo}
        usdValue={usdValue}
        amount={amount}
        symbol={symbol}
        assetImg={img}
        onClick={handleCardClick}
        isEvm={isEvm}
        hasToShowEvmTag={isEvm && !chains[tokenBalanceOnChain ?? activeChain]?.evmOnlyChain}
        tokenBalanceOnChain={tokenBalanceOnChain ?? activeChain}
      />
    </div>
  )
}
