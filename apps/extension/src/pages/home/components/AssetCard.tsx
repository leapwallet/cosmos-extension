import { isTerraClassic, Token, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
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

  const handleCardClick = () => {
    let tokenChain = chain?.replace('cosmoshub', 'cosmos')
    if (isTerraClassic(ibcChainInfo?.pretty_name ?? '') && coinMinimalDenom === 'uluna') {
      tokenChain = 'terra-classic'
    }

    if (!tokenChain) return
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
        hasToShowEvmTag={isEvm}
        tokenBalanceOnChain={tokenBalanceOnChain ?? activeChain}
      />
    </div>
  )
}
