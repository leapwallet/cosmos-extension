// file containing hooks for creating/managing a user preference object for managing chains
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { PriorityChains } from 'config/constants'
import { MANAGE_CHAIN_SETTINGS } from 'config/storage-keys'
import { useChainInfos } from 'hooks/useChainInfos'
import { useCallback, useEffect } from 'react'
import { atom, useRecoilState, useSetRecoilState } from 'recoil'
import browser from 'webextension-polyfill'

export type ManageChainSettings = {
  chainName: SupportedChain
  active: boolean
  preferenceOrder: number
  denom: string
  id: number
  beta: boolean | undefined
  chainId: string
  testnetChainId?: string
  evmChainId?: string
  evmChainIdTestnet?: string
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
  const chainData = useRecoilState(manageChainState)
  return chainData
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

/**
 * @hook useManageChains
 * @description add an object during the initialization of the extension, and if it already exists, update the recoil atom
 * @returns null
 */
export const useManageChains = () => {
  const setPreference = useSetRecoilState(manageChainState)
  const chainInfos = useChainInfos()
  useEffect(() => {
    browser.storage.local.get(MANAGE_CHAIN_SETTINGS).then((data) => {
      // if the object doesn't exists in the storage, then create a new object
      const addedChains = data[MANAGE_CHAIN_SETTINGS]
      let missingChains: string[] = []
      if (addedChains && addedChains.length > 0) {
        const enabledChains = Object.keys(chainInfos).filter(
          (chain) => chainInfos[chain as SupportedChain].enabled,
        )

        missingChains = enabledChains.filter(
          (chain) =>
            !addedChains.find((addedChain: ManageChainSettings) => addedChain.chainName === chain),
        )
      }

      if (!addedChains || missingChains.length > 0) {
        const _chains = (Object.keys(chainInfos) as Array<SupportedChain>).filter(
          (chain) => !PriorityChains.includes(chain),
        )
        const chains = [...PriorityChains, ..._chains]

        // create an object
        const manageChainObject = chains
          .filter((chain) => chainInfos[chain].enabled)
          .map((chain, index) => {
            return {
              chainName: chain,
              active: true,
              preferenceOrder: index,
              denom: chainInfos[chain].denom,
              id: index,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              beta: chainInfos[chain]?.beta ?? false,
              chainId: chainInfos[chain].chainId,
              testnetChainId: chainInfos[chain].testnetChainId,
              evmChainId: chainInfos[chain].evmChainId,
              evmChainIdTestnet: chainInfos[chain].evmChainIdTestnet,
            }
          })
        browser.storage.local.set({ [MANAGE_CHAIN_SETTINGS]: manageChainObject })
        setPreference(manageChainObject)
      }
      // if the object exists in the storage, then update the recoil state
      else {
        const enabledChains = data[MANAGE_CHAIN_SETTINGS].filter(
          (chainObject: ManageChainSettings) => chainInfos[chainObject.chainName]?.enabled,
        ).map((item: ManageChainSettings) => ({
          ...item,
          beta: chainInfos[item.chainName].beta ?? false,
        }))

        setPreference(enabledChains)
      }
    })
  }, [setPreference, chainInfos])
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
      browser.storage.local.set({ [MANAGE_CHAIN_SETTINGS]: data })
      setChainData(data)
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
    browser.storage.local.set({ [MANAGE_CHAIN_SETTINGS]: newChainData })
  }

  return [updateChainData]
}
