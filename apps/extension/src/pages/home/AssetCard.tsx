import {
  convertSecretDenom,
  isTerraClassic,
  useActiveChain,
  useDenoms,
  useSecretTokenStore,
} from '@leapwallet/cosmos-wallet-hooks'
import { isValidAddressWithPrefix } from '@leapwallet/cosmos-wallet-sdk'
import { CardDivider } from '@leapwallet/leap-ui'
import { TokenCard } from 'components/token-card/TokenCard'
import React from 'react'
import { useNavigate } from 'react-router'
import { Token } from 'types/bank'

type AssetCardProps = { isLast: boolean; asset: Token }

const AssetCard: React.FC<AssetCardProps> = ({ isLast, asset }) => {
  const { symbol, amount, usdValue, img, ibcChainInfo, coinMinimalDenom } = asset

  const navigate = useNavigate()
  const { secretTokens } = useSecretTokenStore()
  const activeChain = useActiveChain()
  const denoms = useDenoms()

  let denom = denoms[coinMinimalDenom.length > 0 ? coinMinimalDenom : symbol]
  if (isValidAddressWithPrefix(coinMinimalDenom, 'secret') && secretTokens[coinMinimalDenom]) {
    const secretToken = secretTokens[coinMinimalDenom]

    denom = convertSecretDenom(secretToken, coinMinimalDenom)
  }

  let tokenChain = denom?.chain?.replace('cosmoshub', 'cosmos')
  if (activeChain === 'noble' && coinMinimalDenom === 'uusdc') {
    tokenChain = activeChain
    denom = denoms['usdc']
  }

  if (isTerraClassic(ibcChainInfo?.pretty_name ?? '') && coinMinimalDenom === 'uluna') {
    tokenChain = 'terra-classic'
    denom = denoms['lunc']
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
        title={denom?.name ?? symbol.toLowerCase()}
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
