import { ActivityType, useActiveChain, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
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

export function useActivityImage(txType: ActivityType, forceChain?: SupportedChain) {
  const chains = useGetChains()
  const theme = useTheme().theme
  const _activeChain = useActiveChain()
  const activeChain = forceChain || _activeChain
  const genericAssetIcon =
    theme === ThemeName.DARK ? Images.Logos.GenericDark : Images.Logos.GenericLight

  return useMemo(() => {
    const content: Record<ActivityType, string> = {
      send: chains[activeChain]?.chainSymbolImageUrl ?? genericAssetIcon,
      receive: chains[activeChain]?.chainSymbolImageUrl ?? genericAssetIcon,
      vote: Images.Activity.Voting,
      fallback: genericAssetIcon,
      delegate: genericAssetIcon,
      undelegate: genericAssetIcon,
      'ibc/transfer': genericAssetIcon,
      pending: genericAssetIcon,
      secretTokenTransfer: chains[activeChain]?.chainSymbolImageUrl ?? genericAssetIcon,
      swap: getSwapImage(activeChain),
      'liquidity/add': Images.Logos.ChainLogos[activeChain] ?? genericAssetIcon,
      'liquidity/remove': Images.Logos.ChainLogos[activeChain] ?? genericAssetIcon,
      grant: Images.Logos.ChainLogos[activeChain] ?? genericAssetIcon,
      revoke: Images.Logos.ChainLogos[activeChain] ?? genericAssetIcon,
      cw20TokenTransfer: genericAssetIcon,
    }
    return content[txType]
  }, [activeChain, chains, genericAssetIcon, txType])
}
