import { ActivityCardContent, ActivityType, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { useMemo } from 'react'

import { Images } from '~/images'

export function useActivityImage({
  txType,
  content,
}: {
  txType: ActivityType
  content: ActivityCardContent
}) {
  const theme = useTheme().theme
  const activeChain = useActiveChain()
  const genericAssetIcon =
    theme === ThemeName.DARK ? Images.Logos.GenericDark : Images.Logos.GenericLight

  return useMemo(() => {
    const tokenImgUrl = content?.sentTokenInfo?.icon ?? ChainInfos[activeChain].chainSymbolImageUrl

    return {
      send: tokenImgUrl,
      receive: tokenImgUrl,
      vote: Images.Activity.Voting,
      swap: Images.Logos.JunoSwap,
      fallback: genericAssetIcon,
      delegate: tokenImgUrl,
      undelegate: tokenImgUrl,
      'ibc/transfer': tokenImgUrl,
      pending: content.img,
      secretTokenTransfer: genericAssetIcon,
      revoke: genericAssetIcon,
      'liquidity/remove': genericAssetIcon,
      grant: genericAssetIcon,
      'liquidity/add': genericAssetIcon,
      cw20TokenTransfer: tokenImgUrl,
    }[txType]
  }, [activeChain, txType, content, genericAssetIcon])
}
