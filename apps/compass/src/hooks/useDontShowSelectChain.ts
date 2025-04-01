import { useMemo } from 'react'
import { ManageChainsStore } from 'stores/manage-chains-store'
import { isCompassWallet } from 'utils/isCompassWallet'

export function useDontShowSelectChain(store: ManageChainsStore) {
  const chainsInSelectChain = useMemo(() => {
    return store.chains.filter((chain) => {
      return !(isCompassWallet() && chain.chainName === 'cosmos')
    })
  }, [store.chains])

  return isCompassWallet() && chainsInSelectChain.length === 1
}
