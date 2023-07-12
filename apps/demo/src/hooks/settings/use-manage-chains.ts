// file containing hooks for creating/managing a user preference object for managing chains
import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useCallback, useEffect } from 'react'
import { atom, useRecoilState, useSetRecoilState } from 'recoil'

import { AppConfig } from '~/config'

export type ManageChainSettings = {
  chainName: SupportedChain
  active: boolean
  preferenceOrder: number
  denom: string
  id: number
}

// creating a recoil atom
const manageChainState = atom<ManageChainSettings[]>({
  key: 'manage-chain-settings',
  default: [],
})

/**
 * @function useManageChainData
 * @description reads the recoil state and sends the data
 * @returns chainData - chain preference data from the recoil atom
 */
export const useManageChainData = () => {
  return useRecoilState(manageChainState)
}

/**
 * @function toggleChain
 * @description toggles the active state of a chain
 * @param chain - the chain to that needs to be toggled (either enable or disable)
 * @param chainData - the current chain preference data
 * @returns chainObject - the updated chain preference data
 */
const toggleChain = (chain: SupportedChain, chainData: ManageChainSettings[]) => {
  const newChainData = chainData.map((chainObject) => {
    if (chainObject.chainName === chain) {
      return {
        ...chainObject,
        active: !chainObject.active,
      }
    }
    return chainObject
  })
  // sort the chain data object based on the preference order
  const sortedChainData = newChainData.sort((a, b) => {
    if (a.preferenceOrder < b.preferenceOrder) {
      return -1
    }
    if (a.preferenceOrder > b.preferenceOrder) {
      return 1
    }
    return 0
  })

  return sortedChainData
}

const supportedChains = Object.keys(ChainInfos) as SupportedChain[]

/**
 * @hook useManageChains
 * @description add an object during the initialization of the extension, and if it already exists, update the recoil atom
 * @returns null
 */
export const useManageChains = () => {
  const setChains = useSetRecoilState(manageChainState)

  useEffect(() => {
    const addedChainsItem = localStorage.getItem(AppConfig.STORAGE_KEYS.MANAGE_CHAIN_SETTINGS)
    if (!addedChainsItem) {
      const manageChainObject = supportedChains
        .filter((chain) => ChainInfos[chain].enabled)
        .map((chain, index) => {
          return {
            chainName: chain,
            active: true,
            preferenceOrder: index,
            denom: ChainInfos[chain].denom,
            id: index,
          }
        })
      localStorage.setItem(
        AppConfig.STORAGE_KEYS.MANAGE_CHAIN_SETTINGS,
        JSON.stringify(manageChainObject),
      )
      setChains(manageChainObject)
    } else {
      setChains(JSON.parse(addedChainsItem))
    }
  }, [setChains])
}

/**
 * @hook useToggleChainState
 * @description toggles the chain to either active or inactive when the user clicks on the switch
 * @returns updateChainData() - function to update the toggle status of chains (active - true/false) in local storage
 */
export const useToggleChainState = () => {
  const [chainData, setChainData] = useRecoilState(manageChainState)

  /**
   * @function updateChainData
   * @description function to update the preference order in local storage
   * @param chain - the chain name to be toggled
   * @returns null
   */
  const updateChainData = useCallback(
    (chain: SupportedChain) => {
      const data = toggleChain(chain, chainData)
      setChainData(data)
      localStorage.setItem(AppConfig.STORAGE_KEYS.MANAGE_CHAIN_SETTINGS, JSON.stringify(data))
    },
    [chainData, setChainData],
  )

  return [updateChainData]
}

/**
 * @hook useUpdatePreferenceOrder
 * @description utility hook for the drag and drop feature which sorts and resets the chain order in the recoil atom and local storage
 * @returns updateChainData() - function to update the chain preference order
 */
export const useUpdatePreferenceOrder = () => {
  const setChainData = useSetRecoilState(manageChainState)

  /**
   * @function updateChainData
   * @description function to sort the chain in local storage and recoil atom based on the preference order set
   * @param chainData - the new chain data object
   * @returns null
   */
  const updateChainData = (chainData: ManageChainSettings[]) => {
    const newChainData = chainData.map((chainObject, index) => {
      return {
        ...chainObject,
        preferenceOrder: index,
      }
    })
    setChainData(newChainData)
    localStorage.setItem(AppConfig.STORAGE_KEYS.MANAGE_CHAIN_SETTINGS, JSON.stringify(newChainData))
  }

  return [updateChainData]
}
