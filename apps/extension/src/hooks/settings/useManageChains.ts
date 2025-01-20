import { ChainInfosStore } from '@leapwallet/cosmos-wallet-store'
import { useEffect } from 'react'
import { ManageChainsStore } from 'stores/manage-chains-store'

/**
 * @hook useManageChains
 * @description add an object during the initialization of the extension, and if it already exists, update the recoil atom
 * @returns null
 */
export const useInitManageChains = (
  manageChainStore: ManageChainsStore,
  chainInfoStore: ChainInfosStore,
) => {
  useEffect(() => {
    manageChainStore.initManageChains(chainInfoStore.chainInfos)
  }, [manageChainStore, chainInfoStore.chainInfos])
}
