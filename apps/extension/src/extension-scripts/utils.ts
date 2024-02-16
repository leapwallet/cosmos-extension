/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Key } from '@leapwallet/cosmos-wallet-hooks'
import { getChains } from '@leapwallet/cosmos-wallet-hooks'
import { chainIdToChain, ChainInfo, sleep, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { KeyChain } from '@leapwallet/leap-keychain'
import { initStorage } from '@leapwallet/leap-keychain'
import { MessageTypes } from 'config/message-types'
import { BETA_CHAINS } from 'config/storage-keys'
import CryptoJs from 'crypto-js'
import { addToConnections } from 'pages/ApproveConnection/utils'
import { getStorageAdapter } from 'utils/storageAdapter'
import browser from 'webextension-polyfill'

import { ACTIVE_WALLET, CONNECTIONS } from '../config/storage-keys'

const POPUP_WIDTH = 400
const POPUP_HEIGHT = 600

browser.tabs.onRemoved.addListener(() => {
  //
})

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
  activeWallet: Key,
) {
  const isLeapBoardOrigin = 'https://cosmos.leapwallet.io' === msg.origin
  let isNewChainPresent = !activeWallet

  if (activeWallet) {
    chainIds.forEach((chainId: string) => {
      const sites: [string] = connections?.[activeWallet.id]?.[chainId] || []

      if (!sites.includes(msg?.origin)) {
        isNewChainPresent = true
      }
    })
  }

  const chainsIds = await validateChains(chainIds)
  const validChainIds = Object.keys(chainsIds).filter((chainId) => !!chainsIds[chainId])

  if (validChainIds.length && isLeapBoardOrigin) {
    isNewChainPresent = false
    await addToConnections(chainIds, [activeWallet], msg.origin)
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function checkConnection(chainIds: [string], msg: any) {
  const [activeWallet, connections] = await Promise.all([getActiveWallet(), getConnections()])
  return await checkChainConnections(chainIds, connections, msg, activeWallet)
}
const popupIds: Record<string, number> = {}
const pendingPromises: Array<Promise<any>> = []

type Page = 'approveConnection' | 'suggestChain' | 'sign' | 'add-secret-token' | 'login'

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

  if (pendingPromises.length > 0) {
    await pendingPromises[0]
    return
  }

  if (popupIds[url]) {
    try {
      const existingPopup = await browser.windows.get(popupIds[url], { populate: true })
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
    } catch {
      try {
        const promise = browser.windows.create(popup)
        pendingPromises.push(promise)
        const windowId = (await promise).id
        if (windowId) {
          popupIds[url] = windowId
        }
      } finally {
        pendingPromises.pop()
      }
    }
  } else {
    try {
      const promise = browser.windows.create(popup)
      pendingPromises.push(promise)
      const windowId = (await promise).id
      if (windowId) {
        popupIds[url] = windowId
      }
      return windowId
    } finally {
      pendingPromises.pop()
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
  try {
    const resp = await browser.storage.local.get([BETA_CHAINS])
    const betaChains = resp[BETA_CHAINS]
    return { ...ChainInfos, ...JSON.parse(betaChains ?? '{}') }
  } catch (e) {
    return ChainInfos
  }
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
  const signer = await KeyChain.getSigner(activeWallet.id, password, 'secret', '529')

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
