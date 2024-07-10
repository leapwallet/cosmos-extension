import { useManageChainData } from 'hooks/settings/useManageChains'
import { useMemo } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

export function useDontShowSelectChain() {
  const [chains] = useManageChainData()

  const chainsInSelectChain = useMemo(() => {
    return chains.filter((chain) => {
      return !(isCompassWallet() && chain.chainName === 'cosmos')
    })
  }, [chains])

  return isCompassWallet() && chainsInSelectChain.length === 1
}
