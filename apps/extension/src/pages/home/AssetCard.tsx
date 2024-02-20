import { isTerraClassic } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import { TokenCard } from 'components/token-card/TokenCard'
import React from 'react'
import { useNavigate } from 'react-router'
import { Token } from 'types/bank'

type AssetCardProps = { isLast: boolean; asset: Token }

const AssetCard: React.FC<AssetCardProps> = ({ isLast, asset }) => {
  const { symbol, amount, usdValue, img, ibcChainInfo, coinMinimalDenom, name, chain } = asset
  const navigate = useNavigate()
  let tokenChain = chain?.replace('cosmoshub', 'cosmos')

  if (isTerraClassic(ibcChainInfo?.pretty_name ?? '') && coinMinimalDenom === 'uluna') {
    tokenChain = 'terra-classic'
  }

  const handleCardClick = () => {
    if (!tokenChain) return

    navigate(
      `/assetDetails?assetName=${
        coinMinimalDenom.length > 0 ? coinMinimalDenom : symbol
      }&tokenChain=${tokenChain}`,
      { state: asset },
    )
  }

  return (
    <React.Fragment key={symbol + ibcChainInfo?.channelId}>
      <TokenCard
        title={name ?? symbol}
        ibcChainInfo={ibcChainInfo}
        usdValue={usdValue}
        amount={amount}
        symbol={symbol}
        assetImg={img}
        isRounded={isLast}
        onClick={handleCardClick}
        cardClassName='my-2'
      />
      {!isLast && <CardDivider />}
    </React.Fragment>
  )
}

export default AssetCard
