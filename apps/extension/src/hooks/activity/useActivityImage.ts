import { ActivityType, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { useChainInfos } from 'hooks/useChainInfos'
import { useMemo } from 'react'

import { Images } from '../../images'

export const getSwapImage = (activeChain: SupportedChain): string => {
  switch (activeChain) {
    case 'juno':
      return Images.Logos.JunoSwap
    default:
      return Images.Logos.ChainLogos[activeChain] as string
  }
}

export function useActivityImage(txType: ActivityType) {
  const chainInfos = useChainInfos()
  const theme = useTheme().theme
  const activeChain = useActiveChain()
  const genericAssetIcon =
    theme === ThemeName.DARK ? Images.Logos.GenericDark : Images.Logos.GenericLight

  return useMemo(() => {
    const content: Record<ActivityType, string> = {
      send: chainInfos[activeChain].chainSymbolImageUrl as string,
      receive: chainInfos[activeChain].chainSymbolImageUrl as string,
      vote: Images.Activity.Voting,
      fallback: genericAssetIcon,
      delegate: genericAssetIcon,
      undelegate: genericAssetIcon,
      'ibc/transfer': genericAssetIcon,
      pending: genericAssetIcon,
      secretTokenTransfer: chainInfos[activeChain].chainSymbolImageUrl as string,
      swap: getSwapImage(activeChain),
      'liquidity/add': Images.Logos.ChainLogos[activeChain] as string,
      'liquidity/remove': Images.Logos.ChainLogos[activeChain] as string,
      grant: Images.Logos.ChainLogos[activeChain] as string,
      revoke: Images.Logos.ChainLogos[activeChain] as string,
      cw20TokenTransfer: genericAssetIcon,
    }
    return content[txType]
  }, [activeChain, chainInfos, genericAssetIcon, txType])
}
