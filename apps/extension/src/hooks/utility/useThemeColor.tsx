import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import { useMemo } from 'react'
import { Colors } from 'theme/colors'

export const useThemeColor = () => {
  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()

  const chainInfo = useMemo(() => chainInfos[activeChain], [activeChain, chainInfos])

  return Colors.getChainColor(activeChain, chainInfo)
}
