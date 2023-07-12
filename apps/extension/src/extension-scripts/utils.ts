/* eslint-disablshe @typescript-eslint/ban-ts-comment */

import { Key } from '@leapwallet/cosmos-wallet-hooks'
import { getChains } from '@leapwallet/cosmos-wallet-hooks'
import {
  chainIdToChain,
  ChainInfo,
  ChainInfos,
  decrypt,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { KeyChain } from '@leapwallet/leap-keychain'
import { initStorage } from '@leapwallet/leap-keychain'
import { BETA_CHAINS } from 'config/storage-keys'
import CryptoJs from 'crypto-js'
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

  return { validChainIds, isNewChainPresent }
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
let popupId = 0
type Page = 'approveConnection' | 'suggestChain' | 'sign' | 'add-secret-token' | 'login'

async function getPopup() {
  return await browser.windows.getAll({ populate: true })
}

function getPopupInWindows(windows: browser.Windows.Window[]) {
  return windows
    ? windows.find((window) => window.type === 'popup' && window.id === popupId)
    : undefined
}

export async function openPopup(page: Page, queryString?: string) {
  const popups = await getPopup()
  const existingPopup = getPopupInWindows(popups)

  if (existingPopup?.id) {
    return await browser.windows.update(existingPopup.id, { focused: true })
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
      type: 'popup',
      left: 0,
      top: 0,
      url,
    }

    // @ts-ignore
    const window = await browser.windows.create(popup)
    if (window.id) {
      popupId = window.id
    }
    return window
  }
}

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
    return Buffer.from(cachedKey, 'hex')
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
    [`seed-phrase/${activeWallet.id}`]: Buffer.from(seed.toString()).toString('hex'),
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
  const listener = (message: any) => {
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
