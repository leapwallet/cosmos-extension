import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { PriorityChains } from 'config/constants'
import { MANAGE_CHAIN_SETTINGS } from 'config/storage-keys'
import { makeAutoObservable } from 'mobx'
import Browser from 'webextension-polyfill'

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
  formattedName?: string
  evmOnlyChain?: boolean
}

export class ManageChainsStore {
  chains: ManageChainSettings[] = []

  constructor() {
    makeAutoObservable(this)
  }

  private setChainData(chains: ManageChainSettings[]) {
    this.chains = chains
    return Browser.storage.local.set({ [MANAGE_CHAIN_SETTINGS]: chains })
  }

  async initManageChains(chainInfos: typeof ChainInfos) {
    const data = await Browser.storage.local.get(MANAGE_CHAIN_SETTINGS)

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
            formattedName: chainInfos[chain].chainName,
          }
        })

      this.setChainData(manageChainObject)
    } else {
      const enabledChains = data[MANAGE_CHAIN_SETTINGS].filter(
        (chainObject: ManageChainSettings) => chainInfos[chainObject.chainName]?.enabled,
      ).map((item: ManageChainSettings) => ({
        ...item,
        beta: chainInfos[item.chainName].beta ?? false,
      }))

      this.setChainData(enabledChains)
    }
  }

  toggleChain(chainName: SupportedChain) {
    const newChainData = this.chains.map((chainObject) => {
      if (chainObject.chainName === chainName) {
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

    return this.setChainData(sortedChainData)
  }

  updatePreferenceOrder(chainData: ManageChainSettings[]) {
    const newChainData = chainData.map((chainObject, index) => {
      return {
        ...chainObject,
        preferenceOrder: index,
      }
    })

    return this.setChainData(newChainData)
  }
}

export const manageChainsStore = new ManageChainsStore()
