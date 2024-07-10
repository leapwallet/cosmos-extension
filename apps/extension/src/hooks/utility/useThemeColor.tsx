import { useActiveChain, useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useMemo } from 'react'
import { Colors } from 'theme/colors'

export const useThemeColor = (forceChain?: SupportedChain) => {
  const _activeChain = useActiveChain()
  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain])

  const chainInfo = useChainInfo(activeChain)
  return Colors.getChainColor(activeChain, chainInfo)
}
