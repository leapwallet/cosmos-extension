/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getChains } from '@leapwallet/cosmos-wallet-hooks'
import { LineType } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import { chainIdToChain, ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { KeyChain } from '@leapwallet/leap-keychain'
import { initStorage } from '@leapwallet/leap-keychain'
import { COMPASS_CHAINS } from 'config/config'
import { LEAPBOARD_URL, LEAPBOARD_URL_OLD } from 'config/constants'
import { MessageTypes } from 'config/message-types'
import { ACTIVE_WALLET_ID, BETA_CHAINS, BG_RESPONSE } from 'config/storage-keys'
import CryptoJs from 'crypto-js'
import { addToConnections } from 'pages/ApproveConnection/utils'
import { getStorageAdapter } from 'utils/storageAdapter'
import browser, { Storage } from 'webextension-polyfill'

import { ACTIVE_WALLET, CONNECTIONS } from '../config/storage-keys'

const POPUP_WIDTH = 400
const POPUP_HEIGHT = 600

export async function getExperimentalChains(): Promise<Record<string, ChainInfo> | undefined> {
  const resp = await browser.storage.local.get([BETA_CHAINS])
  if (!resp[BETA_CHAINS]) return undefined
  return JSON.parse(resp[BETA_CHAINS])
}

export const decodeChainIdToChain = async (): Promise<Record<string, string>> => {
  const experimentalChains = (await getExperimentalChains()) ?? {}
  return Object.assign(
    chainIdToChain,
    Object.keys(experimentalChains).reduce((acc: Record<string, string>, cur) => {
      acc[experimentalChains[cur].chainId] = cur
      return acc
    }, {}),
    { 'elgafar-1': 'stargaze' },
  )
}

export const validateChains = async (chainIds: Array<string>) => {
  const ChainInfos = await getChains()
  const supportedChains = Object.values(ChainInfos)
    .filter((chain) => chain.enabled)
    .map((chain) => chain.chainId)
  const supportedTestnetChains = Object.values(ChainInfos)
    .filter((chain) => chain.enabled)
    .map((chain) => chain.testnetChainId)
  const experimentalChains = (await getExperimentalChains()) ?? {}
  const supportedExperimentalChains = Object.values(experimentalChains)
    .filter((chain: ChainInfo) => chain.enabled)
    .map((chain: ChainInfo) => chain.chainId)
  const supportedChainsIds = [
    ...supportedChains,
    ...supportedTestnetChains,
    ...supportedExperimentalChains,
  ]

  return chainIds.reduce((result: Record<string, boolean>, chainId) => {
    result[chainId] = supportedChainsIds.indexOf(chainId) !== -1

    return result
  }, {})
}

export async function checkChainConnections(
  chainIds: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connections: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  msg: any,
  activeWalletId: string,
) {
  const isLeapBoardOrigin = msg.origin === LEAPBOARD_URL || msg.origin === LEAPBOARD_URL_OLD
  let isNewChainPresent = !activeWalletId

  if (activeWalletId) {
    chainIds.forEach((chainId: string) => {
      const sites: [string] = connections?.[activeWalletId]?.[chainId] || []

      if (!sites.includes(msg?.origin)) {
        isNewChainPresent = true
      }
    })
  }

  const chainsIds = await validateChains(chainIds)
  const validChainIds = Object.keys(chainsIds).filter((chainId) => !!chainsIds[chainId])

  if (validChainIds.length && isLeapBoardOrigin) {
    isNewChainPresent = false
    await addToConnections(chainIds, [activeWalletId], msg.origin)
  }

  return {
    validChainIds,
    isNewChainPresent,
  }
}

const getConnections = async () => {
  const { connections = {} } = await browser.storage.local.get(CONNECTIONS)
  return connections
}

const getActiveWallet = async () => {
  const { 'active-wallet': activeWallet = {} } = await browser.storage.local.get([ACTIVE_WALLET])
  return activeWallet
}

const getActiveWalletId = async () => {
  const store = await browser.storage.local.get([ACTIVE_WALLET_ID])
  return store[ACTIVE_WALLET_ID]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function checkConnection(chainIds: string[], msg: any) {
  const [activeWalletId, connections] = await Promise.all([getActiveWalletId(), getConnections()])
  return await checkChainConnections(chainIds, connections, msg, activeWalletId)
}
const popupIds: Record<string, number> = {}
const pendingPromises: Record<string, Promise<browser.Windows.Window>> = {}

export type Page =
  | 'approveConnection'
  | 'suggestChain'
  | 'sign'
  | 'signSeiEvm'
  | 'add-secret-token'
  | 'login'
  | 'suggest-erc-20'
  | 'switch-ethereum-chain'
  | 'suggest-ethereum-chain'

async function getPopup() {
  if (popupIds.length === 0) {
    return undefined
  }
  const window = await browser.windows.get(popupIds[0], { populate: true })
  return [window]
}

function getPopupInWindows(windows: browser.Windows.Window[] | undefined) {
  return windows
    ? windows.find((window) => {
        if (!window.id) return false
        return window.type === 'popup' && Object.values(popupIds).includes(window.id)
      })
    : undefined
}

export async function openPopup(page: Page, queryString?: string) {
  let response
  try {
    response = (await chrome.runtime.sendMessage({ type: 'side-panel-status' })) as any
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }

  const isSidePanelEnabled =
    response?.type === 'side-panel-status' && response?.message?.enabled === true
  if (isSidePanelEnabled) {
    try {
      let url = '/'
      if (page !== 'login') {
        url = url + page
      }

      if (queryString) {
        url = url + queryString
      }
      await chrome.runtime.sendMessage({
        type: 'side-panel-update',
        message: {
          url,
        },
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  } else {
    let url = `index.html#/`
    if (page !== 'login') {
      url = url + page
    }
    if (queryString) {
      url = url + queryString
    }
    const popup = {
      width: POPUP_WIDTH,
      height: POPUP_HEIGHT,
      type: 'popup' as const,
      left: 0,
      top: 0,
      url,
    }

    if (popupIds[url] || !!pendingPromises[url]) {
      try {
        let popupId = popupIds[url]
        if (!popupId) {
          const popup = await pendingPromises[url]
          if (popup.id) {
            popupId = popup.id
          }
        }

        if (process.env.APP?.includes('compass') && popupId) {
          throw new Error('Requests exceeded')
        }

        const existingPopup = await browser.windows.get(popupId, { populate: true })

        if (existingPopup.tabs?.length) {
          const [tab] = existingPopup.tabs
          if (tab?.id) {
            await browser.tabs.update(tab.id, { active: true, url: url })
          } else {
            throw new Error('No tabs')
          }
        } else {
          throw new Error('No tabs')
        }
      } catch (e: any) {
        if (e.message.includes('Requests exceeded')) {
          throw e
        }
        try {
          if (e.message.includes(`No tab with id`)) {
            const promise = browser.windows.create(popup)
            pendingPromises[url] = promise

            const window = await promise
            if (window.id) {
              popupIds[url] = window.id
            }
          }
        } finally {
          delete pendingPromises[url]
        }
      }
    } else {
      try {
        const promise = browser.windows.create(popup)
        pendingPromises[url] = promise
        const window = await promise
        if (window.id) {
          popupIds[url] = window.id
        }
        return window
      } finally {
        delete pendingPromises[url]
      }
    }
  }
}

browser.windows.onRemoved.addListener((windowId) => {
  const entries = Object.entries(popupIds)
  entries.forEach(([url, popupId]) => {
    if (popupId === windowId) {
      delete popupIds[url]
    }
  })
})

export async function isConnected(msg: { chainId: string; origin: string }) {
  const [activeWallet, connections] = await Promise.all([getActiveWallet(), getConnections()])
  const sites: [string] = connections?.[activeWallet.id]?.[msg?.chainId] || []
  if (sites.includes(msg.origin)) {
    return true
  }
  return false
}
export async function disconnect(msg: { chainId: string; origin: string }) {
  const [activeWallet, connections] = await Promise.all([getActiveWallet(), getConnections()])
  let sites = connections[activeWallet.id]?.[msg?.chainId] || []
  if (sites.includes(msg.origin)) {
    sites = sites.filter((site: string) => site !== msg.origin)
    connections[activeWallet.id][msg.chainId] = sites
    await browser.storage.local.set({ [CONNECTIONS]: connections })
    return true
  }
  return false
}

export async function getSupportedChains(): Promise<Record<SupportedChain, ChainInfo>> {
  const ChainInfos = await getChains()

  let allChains = ChainInfos
  try {
    const resp = await browser.storage.local.get([BETA_CHAINS])
    const betaChains = resp[BETA_CHAINS]
    allChains = { ...ChainInfos, ...JSON.parse(betaChains ?? '{}') }
  } catch (_) {
    //
  }

  const supportedChains: Record<SupportedChain, ChainInfo> = Object.entries(allChains).reduce(
    function (_supportedChains, [currentChainKey, currentChainValue]) {
      if (process.env.APP?.includes('compass')) {
        if (COMPASS_CHAINS.includes(currentChainKey)) {
          return { ..._supportedChains, [currentChainKey]: currentChainValue }
        } else {
          return _supportedChains
        }
      }

      return { ..._supportedChains, [currentChainKey]: currentChainValue }
    },
    {} as Record<SupportedChain, ChainInfo>,
  )

  return supportedChains
}

export async function getWalletAddress(chainId: string) {
  const { 'active-wallet': activeWallet } = await browser.storage.local.get([ACTIVE_WALLET])
  const _chainIdToChain = await decodeChainIdToChain()
  let chain = _chainIdToChain[chainId]
  chain = chain === 'cosmoshub' ? 'cosmos' : chain
  return activeWallet.addresses[chain]
}

export async function getSeed(password: string) {
  const activeWallet = await getActiveWallet()
  const key = `seed-phrase/${activeWallet.id}`
  const storage = await chrome.storage.local.get([key])
  const cachedKey = storage[key]
  if (cachedKey) {
    const cachedKeyBytes = Buffer.from(cachedKey, 'hex')
    if (cachedKeyBytes.length === 32) {
      return cachedKeyBytes
    }
  }

  const address = await getWalletAddress('secret-4')
  const storageAdapter = getStorageAdapter()
  initStorage(storageAdapter)
  const signer = await KeyChain.getSigner(activeWallet.id, password, {
    addressPrefix: 'secret',
    coinType: '529',
  })

  const seed = CryptoJs.SHA256(
    //@ts-ignore
    await signer.signAmino(
      address,
      //@ts-ignore
      Buffer.from(
        JSON.stringify({
          account_number: 0,
          chain_id: 'secret-4',
          fee: [],
          memo: 'Create leap Secret encryption key. Only approve requests by Leap.',
          msgs: [],
          sequence: 0,
        }),
      ),
    ),
  )

  await chrome.storage.local.set({
    [`seed-phrase/${activeWallet.id}`]: seed.toString(),
  })
  return Buffer.from(seed.toString())
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateNewChainInfo(chainInfo: any) {
  const validUrl = new RegExp(/^(http|https):\/\/[^ "]+$/)
  const validBip44 = new RegExp(/^\d+$/)
  if (!validUrl.test(chainInfo.rpc)) {
    throw new Error('Invalid RPC URL')
  }
  if (!validUrl.test(chainInfo.rest)) {
    throw new Error('Invalid REST URL')
  }
  if (!validBip44.test(chainInfo.bip44.coinType)) {
    throw new Error('Invalid bip44 coin type')
  }
  if (chainInfo.feeCurrencies?.length < 1) {
    throw new Error('Invalid fee currencies')
  }
}

export function requestEnableAccess(payload: {
  origin: string
  validChainIds: string[]
  payloadId: string
  ecosystem?: LineType
  ethMethod?: string
  isLeap?: boolean
}) {
  // Store the listener function in a variable so we can remove it later
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listener = (message: any, sender: any) => {
    if (sender.id !== browser.runtime.id) throw new Error('Invalid sender')

    if (message.type === 'approval-popup-open') {
      browser.runtime.sendMessage({ type: 'enable-access', payload })
      // remove this listener after sending the message
      browser.runtime.onMessage.removeListener(listener)
    }
  }

  // Add the listener
  browser.runtime.onMessage.addListener(listener)
}

export async function awaitUIResponse(messageType: string) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = (message: any) => {
      if (message.type === messageType) {
        if (message.payload.status === 'success') {
          resolve('success')
        } else {
          reject('failed')
        }
        browser.runtime.onMessage.removeListener(listener)
      }
    }
    browser.runtime.onMessage.addListener(listener)
  })
}

export async function awaitApproveChainResponse(payloadId: string) {
  return new Promise((resolve, reject) => {
    const listener = async (
      message: { type: string; payload: any; status: string },
      sender: any,
    ) => {
      if (sender.id !== browser.runtime.id) reject('Invalid sender')
      if (message.type === 'chain-enabled' && message.payload.payloadId === payloadId) {
        resolve({ status: 'success', payloadId: message.payload.payloadId })
        //browser.runtime.onMessage.removeListener(listener)
      } else if (
        message.type === 'chain-approval-rejected' &&
        message.payload.payloadId === payloadId
      ) {
        reject({ status: 'rejected', payloadId: message.payload.payloadId })
        browser.runtime.onMessage.removeListener(listener)
      } else if (message.type === 'popup-closed') {
        resolve('popup-closed')
        browser.runtime.onMessage.removeListener(listener)
      } else if (message.type === 'user-logged-in' && message.status !== 'success') {
        reject('failed')
        browser.runtime.onMessage.removeListener(listener)
      }
    }
    browser.runtime.onMessage.addListener(listener)
  })
}
export function requestSignTransaction(payload: any) {
  const listener = (message: any, sender: any) => {
    if (sender.id !== browser.runtime.id) throw new Error('Invalid Sender')

    if (message.type === MessageTypes.signingPopupOpen) {
      browser.runtime.sendMessage({ type: MessageTypes.signTransaction, payload })
      browser.runtime.onMessage.removeListener(listener)
    }
  }

  browser.runtime.onMessage.addListener(listener)
}

export async function awaitSigningResponse(messageType: string) {
  return new Promise((resolve, reject) => {
    const listener = (message: any) => {
      if (message.type === messageType) {
        if (message.payload.status === 'success') {
          resolve(message.payload.data)
        } else {
          reject(message.payload.data)
        }

        browser.runtime.onMessage.removeListener(listener)
      }
    }

    browser.runtime.onMessage.addListener(listener)
  })
}

export function awaitEnableChainResponse(): Promise<any> {
  return new Promise((resolve, reject) => {
    const enableChainListener = (changes: Record<string, Storage.StorageChange>) => {
      const { newValue } = changes[BG_RESPONSE] || {}
      if (newValue) {
        if (newValue.error) {
          reject(newValue)
        } else {
          resolve(newValue)
        }
        resolve({})
        browser.storage.onChanged.removeListener(enableChainListener)
      }
    }
    browser.storage.onChanged.addListener(enableChainListener)
  })
}
