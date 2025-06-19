/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getChains } from '@leapwallet/cosmos-wallet-hooks'
import { LineType } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import {
  chainIdToChain,
  ChainInfo,
  isAptosChain,
  isSuiChain,
  sleep,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { KeyChain } from '@leapwallet/leap-keychain'
import { initStorage } from '@leapwallet/leap-keychain'
import { base58 } from '@scure/base'
import { COMPASS_CHAINS } from 'config/config'
import { LEAPBOARD_URL, LEAPBOARD_URL_OLD } from 'config/constants'
import { MessageTypes } from 'config/message-types'
import {
  ACTIVE_CHAIN,
  ACTIVE_WALLET_ID,
  BETA_CHAINS,
  BG_RESPONSE,
  SELECTED_NETWORK,
} from 'config/storage-keys'
import CryptoJs from 'crypto-js'
import * as sol from 'micro-sol-signer'
import { addToConnections } from 'pages/ApproveConnection/utils'
import { getStorageAdapter } from 'utils/storageAdapter'
import browser, { Storage, Windows } from 'webextension-polyfill'

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
  const chainInfos = await getChains()
  const compassChainIds = (COMPASS_CHAINS as SupportedChain[])
    .map((chain: SupportedChain) => {
      if (chainInfos[chain]) {
        return [chainInfos[chain].chainId, chainInfos[chain].testnetChainId]
      }
      return []
    })
    .flat()
    .filter(Boolean)

  const supportedChains = Object.values(chainInfos)
    .filter((chain) => chain.enabled)
    .map((chain) => chain.chainId)
  const supportedTestnetChains = Object.values(chainInfos)
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
  ]?.filter((chainId) => {
    if (!chainId) return false

    if (process.env.APP?.includes('compass')) {
      if (compassChainIds.includes(chainId)) {
        return true
      }
      return false
    }

    return true
  })

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
  const chainsIds = await validateChains(chainIds)
  const validChainIds = Object.keys(chainsIds).filter((chainId) => !!chainsIds[chainId])

  if (activeWalletId) {
    validChainIds.forEach((chainId: string) => {
      const sites: [string] = connections?.[activeWalletId]?.[chainId] || []
      if (!sites.includes(msg?.origin)) {
        isNewChainPresent = true
      }
    })
  }

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

async function createBrowserWindow(popupData: Windows.CreateCreateDataType, url: string) {
  try {
    const promise = browser.windows.create(popupData)
    pendingPromises[url] = promise
    const window = await promise
    if (window.id) {
      popupIds[url] = window.id
    }
    return window
  } catch (e: any) {
    if (e.message.includes('Invalid value for bounds.')) {
      createBrowserWindow({ ...popupData, top: 0, left: 0 }, url)
    } else {
      throw e
    }
  } finally {
    delete pendingPromises[url]
  }
}

export type Page =
  | 'approveConnection'
  | 'suggestChain'
  | 'sign'
  | 'signAptos'
  | 'signBitcoin'
  | 'signSeiEvm'
  | 'signSolana'
  | 'signSui'
  | 'add-secret-token'
  | 'login'
  | 'suggest-erc-20'
  | 'switch-ethereum-chain'
  | 'switch-chain'
  | 'suggest-ethereum-chain'
  | 'switch-solana-chain'

async function getSidePanelStatus() {
  let response
  let sidePanelOptions
  let isSidePanelMounted
  let isSidePanelEnabled
  try {
    sidePanelOptions = await chrome.sidePanel.getOptions({})
    isSidePanelEnabled = sidePanelOptions?.enabled
    response = (await chrome.runtime.sendMessage({ type: 'side-panel-status' })) as any
    isSidePanelMounted =
      response?.type === 'side-panel-status' && response?.message?.enabled === true
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }

  return { isSidePanelMounted, isSidePanelEnabled }
}

async function openPageInSidePanel(page: Page, queryString?: string) {
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
    return true
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    return false
  }
}

export async function openPopup(
  page: Page,
  queryString?: string,
  isEvm?: boolean,
  sendMessageToInvoker?: (eventName: string, payload: any) => void,
) {
  const { isSidePanelMounted, isSidePanelEnabled } = await getSidePanelStatus()
  let pageOpened = false
  try {
    if (isSidePanelMounted) {
      pageOpened = await openPageInSidePanel(page, queryString)
    } else if (isSidePanelEnabled && sendMessageToInvoker) {
      // open side panel
      const currentWindow = await chrome.windows.getCurrent()
      if (!currentWindow?.id) {
        throw new Error('Unable to fetch current window id')
      }
      await sendMessageToInvoker('invokeOpenSidePanel', {
        windowId: currentWindow?.id,
      })
      let { isSidePanelMounted: updatedIsSidePanelMounted } = await getSidePanelStatus()
      let retryCount = 0
      let sleepDuration = 100
      while (!updatedIsSidePanelMounted) {
        await sleep(sleepDuration)
        const { isSidePanelMounted } = await getSidePanelStatus()
        updatedIsSidePanelMounted = isSidePanelMounted
        retryCount += 1
        if (retryCount > 5) {
          sleepDuration = 200
        }
        if (retryCount > 10) {
          throw new Error('Side panel not mounted')
        }
      }
      pageOpened = await openPageInSidePanel(page, queryString)
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    pageOpened = false
  }
  if (!pageOpened) {
    let url = `index.html#/`
    if (page !== 'login') {
      url = url + page
    }
    if (queryString) {
      url = url + queryString
    }

    let left = 0
    let top = 0

    try {
      const res = await browser.windows.getLastFocused()

      if (res.width && res.left !== undefined) {
        left = Math.round(res.width - POPUP_WIDTH + res.left)
      }
      if (res.height && res.top) {
        top = res.top
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Error calculating popup positions: ${(e as Error)?.message ?? e}`)
    }

    const popup = {
      width: POPUP_WIDTH,
      height: POPUP_HEIGHT,
      type: 'popup' as const,
      left,
      top,
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

        if (isEvm && popupId && page !== 'approveConnection') {
          if (page === 'signSeiEvm') {
            return
          }

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
        createBrowserWindow(popup, url)
      }
    } else {
      createBrowserWindow(popup, url)
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

export const getChainOriginStorageKey = (origin: string, prefix?: string) =>
  `${prefix ?? ''}origin-active-key-${origin}`

export async function disconnect(msg: { chainId?: string | string[]; origin: string }) {
  if (!msg.chainId) return false
  const isAptos = Array.isArray(msg.chainId)
    ? !!msg?.chainId?.every((_chainId) => isAptosChain(_chainId))
    : isAptosChain(msg.chainId)
  const isSui = Array.isArray(msg.chainId)
    ? !!msg?.chainId?.every((_chainId) => isSuiChain(_chainId))
    : isSuiChain(msg.chainId)

  const [activeWallet, connections] = await Promise.all([
    getActiveWallet(),
    getConnections(),
    browser.storage.local.remove(
      getChainOriginStorageKey(msg.origin, isAptos ? 'aptos-' : isSui ? 'sui-' : ''),
    ),
  ])

  if (Array.isArray(msg.chainId)) {
    let foundOneChainIdWithOrigin = false
    for (const chainId of msg.chainId) {
      let sites = connections[activeWallet.id]?.[chainId] || []
      if (sites.includes(msg.origin)) {
        sites = sites.filter((site: string) => site !== msg.origin)
        connections[activeWallet.id][chainId] = sites
        foundOneChainIdWithOrigin = true
      }
    }
    await browser.storage.local.set({ [CONNECTIONS]: connections })
    return foundOneChainIdWithOrigin
  } else {
    let sites = connections[activeWallet.id]?.[msg?.chainId] || []
    if (sites.includes(msg.origin)) {
      sites = sites.filter((site: string) => site !== msg.origin)
      connections[activeWallet.id][msg.chainId] = sites
      await browser.storage.local.set({ [CONNECTIONS]: connections })
      return true
    }
  }

  return false
}

export async function getSupportedChains(): Promise<Record<SupportedChain, ChainInfo>> {
  const chainInfos = await getChains()

  let allChains = chainInfos
  try {
    const betaChains = (await getExperimentalChains()) ?? {}
    allChains = { ...chainInfos, ...betaChains }
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

export async function getActiveNetworkInfo() {
  const store = await browser.storage.local.get([ACTIVE_CHAIN, SELECTED_NETWORK])
  const activeChain: string = store[ACTIVE_CHAIN]
  const selectedNetwork: string = store[SELECTED_NETWORK]
  const allSupportedChains = await getSupportedChains()
  const chainInfo = allSupportedChains?.[(activeChain ?? '') as SupportedChain]
  const chainId = selectedNetwork === 'testnet' ? chainInfo?.testnetChainId : chainInfo?.chainId
  const restUrl = selectedNetwork === 'testnet' ? chainInfo?.apis?.restTest : chainInfo?.apis?.rest
  const rpcUrl = selectedNetwork === 'testnet' ? chainInfo?.apis?.rpcTest : chainInfo?.apis?.rpc
  return {
    chainId,
    restUrl,
    rpcUrl,
    selectedNetwork,
  }
}

export async function getWalletAddress(chainId: string) {
  const { 'active-wallet': activeWallet } = await browser.storage.local.get([ACTIVE_WALLET])
  const _chainIdToChain = await decodeChainIdToChain()
  let chain = _chainIdToChain[chainId]
  chain = chain === 'cosmoshub' ? 'cosmos' : chain
  return activeWallet.addresses[chain]
}

export async function getSeed(password: Uint8Array) {
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

export async function awaitSigningResponse(messageType: string, payloadId?: number) {
  return new Promise((resolve, reject) => {
    const listener = (message: any) => {
      if (message.type === messageType && message.payloadId === payloadId) {
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

export const customOpenPopup = async (
  page: Page,
  sendResponse: (name: string, payload: any, id: number) => void,
  queryString?: string,
  response?: [string, any, number],
  isEvm?: boolean,
) => {
  try {
    const payloadId = response?.[2]
    if (payloadId !== undefined) {
      const sendMessageToInvoker = (eventName: string, payload: any) => {
        sendResponse(eventName, payload, payloadId)
      }
      await openPopup(page, queryString, isEvm, sendMessageToInvoker)
    } else {
      await openPopup(page, queryString, isEvm)
    }
  } catch (e: any) {
    if (response && e.message.includes('Requests exceeded')) {
      return sendResponse(...response)
    }
  }
}

function arrayEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export function validateSolanaPrivateKey(privateKey: string | number[]) {
  try {
    let privateKeyBytes: Uint8Array

    if (typeof privateKey === 'string') {
      if (privateKey.match(/^[0-9a-fA-F]+$/)) {
        const privateKeyBytes = new Uint8Array(
          privateKey.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
        )
        privateKey = base58.encode(privateKeyBytes)
      }

      if (privateKey.length === 32 || privateKey.length === 44) {
        try {
          const decoded = base58.decode(privateKey)
          if (decoded.length === 32) {
            return {
              isValid: false,
              publicAddress: '',
              privateKey: '',
            }
          }
        } catch {
          //
        }
      }

      privateKeyBytes = base58.decode(privateKey)
    } else if (Array.isArray(privateKey)) {
      privateKeyBytes = new Uint8Array(privateKey)
    } else {
      return {
        isValid: false,
        publicAddress: '',
        privateKey: '',
      }
    }

    if (privateKeyBytes.length === 64) {
      const originalPublicKey = privateKeyBytes.slice(32)
      privateKeyBytes = privateKeyBytes.slice(0, 32)

      const derivedPublicKey = sol.getPublicKey(privateKeyBytes)
      if (!arrayEqual(derivedPublicKey, originalPublicKey)) {
        return {
          isValid: false,
          publicAddress: '',
          privateKey: '',
        }
      }
    }

    if (privateKeyBytes.length !== 32) {
      return {
        isValid: false,
        publicAddress: '',
        privateKey: '',
      }
    }

    const derivedPublicKey = sol.getPublicKey(privateKeyBytes)

    const derivedAddress = sol.getAddress(privateKeyBytes)
    if (!derivedPublicKey || (typeof privateKey === 'string' && privateKey === derivedAddress)) {
      return {
        isValid: false,
        publicAddress: '',
      }
    }

    return {
      isValid: true,
      publicAddress: derivedAddress,
      privateKey: privateKeyBytes,
    }
  } catch (error) {
    return {
      isValid: false,
      publicAddress: '',
      privateKey: '',
    }
  }
}
