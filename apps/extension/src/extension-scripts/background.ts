/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */

/***
 * Do not remove this import and keep this on the first line.
 */
// eslint-disable-next-line simple-import-sort/imports
import './fetch-preserver'

import { SUPPORTED_METHODS } from '@leapwallet/cosmos-wallet-provider/dist/provider/messaging/requester'
import { ChainInfo, getRestUrl } from '@leapwallet/cosmos-wallet-sdk'

import { decrypt, initCrypto, initStorage } from '@leapwallet/leap-keychain'
import {
  ACTIVE_WALLET,
  AUTO_LOCK_TIME,
  BETA_CHAINS,
  BG_RESPONSE,
  CONNECTIONS,
  ENCRYPTED_ACTIVE_WALLET,
  ENCRYPTED_KEY_STORE,
  KEYSTORE,
  REDIRECT_REQUEST,
  SIGN_REQUEST,
  V80_KEYSTORE_MIGRATION_COMPLETE,
  VIEWING_KEYS,
} from 'config/storage-keys'
import PortStream from 'extension-port-stream'
import { toUint8Array } from 'utils/uint8Utils'
import browser, { Storage } from 'webextension-polyfill'

import customIcon from '../images/logos/generic-light.svg'
import { Bech32Address } from '../utils/bech32'
import { getStorageAdapter } from '../utils/storageAdapter'
import { NEW_CHAIN_REQUEST, SUGGEST_TOKEN } from './../config/storage-keys'

import { handleSendTx } from './handle-sendtx'
import { storageMigrationV9 } from './migrations/v9'
import { storageMigrationV10 } from './migrations/v10'
import { storageMigrationV19 } from './migrations/v19'
import { storageMigrationV53 } from './migrations/v53'
import {
  awaitUIResponse,
  checkChainConnections,
  checkConnection,
  decodeChainIdToChain,
  disconnect,
  getSeed,
  getSupportedChains,
  getWalletAddress,
  isConnected,
  openPopup,
  requestEnableAccess,
  validateNewChainInfo,
} from './utils'
import { EncryptionUtilsImpl } from '@leapwallet/cosmos-wallet-sdk/dist/secret/encryptionutil'
import { PasswordManager } from './password-manager'
import { storageMigrationV77 } from './migrations/v77'
import { getChains } from '@leapwallet/cosmos-wallet-hooks'
import { storageMigrationV80 } from './migrations/v80'
const storageAdapter = getStorageAdapter()
initStorage(storageAdapter)
initCrypto()

global.window = self

const windowIdForPayloadId: { [x: number | string]: { type: string; payloadId: number } } = {}

let enableAccessRequests: Record<string, number> = {}

const passwordManager = PasswordManager.create()

const connectRemote = (remotePort: any) => {
  if (remotePort.name !== 'LeapCosmosExtension') {
    return
  }

  const portStream = new PortStream(remotePort)

  const sendResponse = (name: any, payload: any, id: number) => {
    portStream.write({ name, payload, id })
  }

  browser.runtime.onMessage.addListener(async (message, sender) => {
    if (sender.id !== browser.runtime.id) return

    if (message.type === 'chain-enabled') {
      sendResponse(
        `on${SUPPORTED_METHODS.ENABLE_ACCESS}`,
        { success: 'Chain enabled' },
        message.payload.payloadId,
      )
    } else if (message.type === 'chain-approval-rejected') {
      sendResponse(
        `on${SUPPORTED_METHODS.ENABLE_ACCESS}`,
        { error: 'Request rejected' },
        message.payload.payloadId,
      )
    } else if (message.type === 'popup-closed') {
      enableAccessRequests = {}
    }
  })

  const requestHandler = async (data: any) => {
    const { type, ...payload } = data

    let popupWindowId = 0
    // let hasUnApprovedTx = false
    // this condition exists to prevent infinite extension popups

    //check if account exists
    const storage = await browser.storage.local.get([ACTIVE_WALLET, ENCRYPTED_ACTIVE_WALLET])

    if (!storage[ACTIVE_WALLET] && !storage[ENCRYPTED_ACTIVE_WALLET]) {
      browser.storage.local.set({ [REDIRECT_REQUEST]: null })

      return sendResponse(
        `on${type?.toUpperCase() ?? ''}`,
        { error: 'No wallet exists' },
        payload.id,
      )
    }

    switch (type) {
      case SUPPORTED_METHODS.GET_CONNECTION_STATUS: {
        return isConnected(payload).then((data) =>
          sendResponse(`on${type.toUpperCase()}`, data, payload.id),
        )
      }

      case SUPPORTED_METHODS.DISCONNECT: {
        return disconnect(payload).then((data) =>
          sendResponse(`on${type.toUpperCase()}`, data, payload.id),
        )
      }

      case SUPPORTED_METHODS.ADD_SUGGESTED_CHAIN: {
        try {
          const newChainName = payload.chainInfo.chainName
          try {
            validateNewChainInfo(payload.chainInfo)
          } catch (e: any) {
            return sendResponse(`on${type.toUpperCase()}`, { error: e.message }, payload.id)
          }
          const newChain = formatNewChainInfo(payload.chainInfo)
          return getSupportedChains()
            .then((_chains) => {
              const supportedChains = Object.values(_chains)

              // added temporarily to add coreum chain with 118 cointype on leap

              const allowCoreumFromLeap =
                payload.origin === 'https://suggest-chain-leap.netlify.app' &&
                payload.chainInfo.chainId === 'coreum-mainnet-1' &&
                !supportedChains.find((chain) => chain.chainName === 'Coreum Mainnet 1')

              if (
                supportedChains.some(
                  (chain: ChainInfo) =>
                    (chain.chainId.toLowerCase() === payload.chainInfo.chainId.toLowerCase() ||
                      chain.testnetChainId?.toLowerCase() ===
                        payload.chainInfo.chainId.toLowerCase()) &&
                    chain.enabled === true,
                ) &&
                !allowCoreumFromLeap
              ) {
                return sendResponse(`on${type.toUpperCase()}`, '', payload.id)
              } else {
                return browser.storage.local
                  .set({
                    [REDIRECT_REQUEST]: { type },
                    [NEW_CHAIN_REQUEST]: {
                      chainInfo: newChain[newChainName],
                      origin: payload.origin,
                    },
                  })
                  .then(() =>
                    openPopup('suggestChain').then(async (window) => {
                      popupWindowId = window.id ?? 0
                      windowIdForPayloadId[popupWindowId] = {
                        type: type.toUpperCase(),
                        payloadId: payload.id,
                      }

                      return awaitEnableChainResponse()
                        .then(async () =>
                          browser.storage.local.get([BETA_CHAINS]).then(async (resp) => {
                            try {
                              const newChainName = payload.chainInfo.chainName
                              let betaChains = resp?.[BETA_CHAINS]
                              betaChains =
                                typeof betaChains === 'string' ? JSON.parse(betaChains) : {}
                              betaChains[newChainName] = newChain[newChainName]
                              return browser.storage.local
                                .set({ [BETA_CHAINS]: JSON.stringify(betaChains) })
                                .then(() =>
                                  sendResponse(
                                    `on${type.toUpperCase()}`,
                                    {
                                      success: 'Chain added successfully',
                                    },
                                    payload.id,
                                  ),
                                )
                            } catch (error: any) {
                              return sendResponse(
                                `on${type.toUpperCase()}`,
                                {
                                  error: error.error,
                                },
                                payload.id,
                              )
                            }
                          }),
                        )
                        .catch(({ error }) =>
                          sendResponse(`on${type.toUpperCase()}`, { error }, payload.id),
                        )
                    }),
                  )
              }
            })
            .catch((error) =>
              sendResponse(
                `on${type.toUpperCase()}`,
                {
                  error: error.message,
                },
                payload.id,
              ),
            )
        } catch (error: any) {
          sendResponse(
            `on${type.toUpperCase()}`,
            {
              error: error.message,
            },
            payload.id,
          )
        }
        break
      }

      case SUPPORTED_METHODS.ENABLE_ACCESS: {
        const msg = payload
        const chainIds = msg?.chainIds

        let queryString = `?origin=${msg?.origin}`
        chainIds?.forEach((chainId: string) => {
          queryString += `&chainIds=${chainId}`
        })

        const store = await browser.storage.local.get([ACTIVE_WALLET])
        if (!store[ACTIVE_WALLET]) {
          try {
            await openPopup('login', '?close-on-login=true')
          } catch {
            sendResponse(`on${type.toUpperCase()}`, { error: 'User rejected request' }, payload.id)
            break
          }
        }

        checkConnection(chainIds, msg)
          .then(async ({ validChainIds, isNewChainPresent }) => {
            if (validChainIds.length > 0) {
              if (isNewChainPresent) {
                await browser.storage.local.set({
                  [REDIRECT_REQUEST]: { type: type, msg: { ...msg, validChainIds } },
                })

                const browserWindows = await browser.windows.getAll()
                const hasBrowserWindow = browserWindows.some(
                  (window) =>
                    window.type === 'popup' && window.id === enableAccessRequests[queryString],
                )

                if (Object.keys(enableAccessRequests).length === 0 || !hasBrowserWindow) {
                  delete enableAccessRequests[queryString]
                  enableAccessRequests[queryString] = popupWindowId
                  const window = await openPopup('approveConnection')
                  requestEnableAccess({ origin: msg.origin, validChainIds, payloadId: payload.id })

                  enableAccessRequests[queryString] = window.id ?? 0
                  windowIdForPayloadId[popupWindowId] = {
                    type: type.toUpperCase(),
                    payloadId: payload.id,
                  }
                } else {
                  if (!enableAccessRequests[queryString]) {
                    requestEnableAccess({
                      origin: msg.origin,
                      validChainIds,
                      payloadId: payload.id,
                    })
                    enableAccessRequests[queryString] = popupWindowId
                  }
                }

                try {
                  const response = await awaitEnableChainResponse()
                  // hasUnApprovedTx = false
                  sendResponse(`on${type.toUpperCase()}`, response, payload.id)
                  delete enableAccessRequests[queryString]
                } catch (error: any) {
                  sendResponse(`on${type.toUpperCase()}`, { error: error.error }, payload.id)
                  delete enableAccessRequests[queryString]
                }
              } else {
                sendResponse(`on${type.toUpperCase()}`, { success: 'Chain enabled' }, payload.id)
                // hasUnApprovedTx = false
                // sendResponse()
              }
            } else {
              sendResponse(`on${type.toUpperCase()}`, { error: 'Invalid chain id' }, payload.id)
              delete enableAccessRequests[queryString]
            }
          })
          .catch(() => {
            sendResponse(`on${type.toUpperCase()}`, { error: `Invalid chain id` }, payload.id)
            delete enableAccessRequests[queryString]
          })
        break
      }

      case SUPPORTED_METHODS.GET_KEYS:
      case SUPPORTED_METHODS.GET_KEY:
        {
          const msg = payload
          const chainIds = msg.chainIds ?? [msg.chainId]
          const eventName = `on${type.toUpperCase()}`

          let queryString = `?origin=${msg?.origin}`
          chainIds?.forEach((chainId: string) => {
            queryString += `&chainIds=${chainId}`
          })

          const store = await browser.storage.local.get([ACTIVE_WALLET])
          if (!store[ACTIVE_WALLET]) {
            try {
              await openPopup('login', '?close-on-login=true')
              await awaitUIResponse('user-logged-in')
            } catch {
              sendResponse(eventName, { error: 'Invalid chain id' }, payload.id)
              break
            }
          }

          browser.storage.local.get([CONNECTIONS, ACTIVE_WALLET]).then(async (store) => {
            checkChainConnections(chainIds, store[CONNECTIONS], msg, store[ACTIVE_WALLET]).then(
              async ({ validChainIds, isNewChainPresent }) => {
                if (validChainIds.length === 0) {
                  sendResponse(eventName, { error: 'Invalid chain id' }, payload.id)
                  return
                }

                if (isNewChainPresent) {
                  const browserWindows = await browser.windows.getAll()
                  const hasBrowserWindow = browserWindows.some(
                    (window) => window.id === enableAccessRequests[queryString],
                  )
                  if (Object.keys(enableAccessRequests).length === 0 || !hasBrowserWindow) {
                    delete enableAccessRequests[queryString]
                    enableAccessRequests[queryString] = popupWindowId
                    const window = await openPopup('approveConnection')
                    enableAccessRequests[queryString] = window.id ?? 0
                    windowIdForPayloadId[popupWindowId] = {
                      type: type.toUpperCase(),
                      payloadId: payload.id,
                    }
                    requestEnableAccess({
                      origin: msg.origin,
                      validChainIds,
                      payloadId: payload.id,
                    })
                  } else {
                    if (!enableAccessRequests[queryString]) {
                      requestEnableAccess({
                        origin: msg.origin,
                        validChainIds,
                        payloadId: payload.id,
                      })
                      enableAccessRequests[queryString] = popupWindowId
                    }
                  }

                  try {
                    const response = await awaitEnableChainResponse()
                    if (response) {
                      if (type === 'get-key') {
                        getKey(validChainIds[0]).then((key) => {
                          sendResponse(eventName, { key }, payload.id)
                        })
                      } else {
                        getKeys(validChainIds).then((keys) => {
                          sendResponse(eventName, { keys }, payload.id)
                        })
                      }
                      delete enableAccessRequests[queryString]
                    }
                  } catch (e) {
                    sendResponse(eventName, { error: 'Request rejected' }, payload.id)
                    delete enableAccessRequests[queryString]
                  }
                } else {
                  if (type === 'get-key') {
                    getKey(validChainIds[0])
                      .then((key) => {
                        sendResponse(eventName, { key }, payload.id)
                        delete enableAccessRequests[queryString]
                      })
                      .catch(() => {
                        sendResponse(eventName, { error: 'Invalid chain Id' }, payload.id)
                        delete enableAccessRequests[queryString]
                      })
                  } else {
                    getKeys(validChainIds)
                      .then((keys) => {
                        sendResponse(eventName, { keys }, payload.id)
                        delete enableAccessRequests[queryString]
                      })
                      .catch(() => {
                        sendResponse(eventName, { error: 'Invalid chain Id' }, payload.id)
                        delete enableAccessRequests[queryString]
                      })
                  }
                }
              },
            )
          })
        }
        break

      case SUPPORTED_METHODS.REQUEST_SIGN_DIRECT: {
        const msg = payload

        browser.storage.local
          .set({
            [SIGN_REQUEST]: {
              signDoc: msg.signDoc,
              signer: msg.signer,
              origin: msg.origin,
              isAmino: false,
              signOptions: msg.signOptions,
            },
          })
          .then(() => {
            return browser.storage.local.set({ [REDIRECT_REQUEST]: { type: type } })
          })
          .then(() => {
            return openPopup('sign')
          })
          .then((window) => {
            const windowId = (window as browser.Windows.Window).id as number
            windowIdForPayloadId[windowId] = { type: type.toUpperCase(), payloadId: payload.id }
            return awaitResponse('direct')
          })
          .then((response) => {
            sendResponse(`on${type.toUpperCase()}`, { directSignResponse: response }, payload.id)
          })
          .catch(() => {
            sendResponse(`on${type.toUpperCase()}`, { error: 'Transaction declined' }, payload.id)
          })
        break
      }

      case SUPPORTED_METHODS.REQUEST_SIGN_AMINO: {
        const msg = payload
        browser.storage.local
          .set({
            [SIGN_REQUEST]: {
              signDoc: msg.signDoc,
              chainId: msg.chainId,
              signer: msg.signer,
              origin: msg.origin,
              isAmino: true,
              isAdr36: msg.signOptions.isADR36WithString,
              ethSignType: msg.signOptions.ethSignType,
              signOptions: msg.signOptions,
            },
          })
          .then(() => {
            return browser.storage.local.set({ [REDIRECT_REQUEST]: { type } })
          })
          .then(() => {
            // hasUnApprovedTx = true
            return openPopup('sign')
          })
          .then((window) => {
            popupWindowId = (window as browser.Windows.Window).id as number
            windowIdForPayloadId[popupWindowId] = {
              type: type.toUpperCase(),
              payloadId: payload.id,
            }

            return awaitResponse('amino')
          })
          .then((response) => {
            sendResponse(`on${type.toUpperCase()}`, { aminoSignResponse: response }, payload.id)
            // hasUnApprovedTx = false
          })
          .catch(() => {
            sendResponse(`on${type.toUpperCase()}`, { error: 'Transaction declined' }, payload.id)
          })
        break
      }

      case SUPPORTED_METHODS.SEND_TX: {
        handleSendTx(payload)
          .then((txHash) => {
            sendResponse(`on${type.toUpperCase()}`, { txHash: new Uint8Array(txHash) }, payload.id)
          })
          .catch((e) => {
            sendResponse(`on${type.toUpperCase()}`, { error: e.message }, payload.id)
          })
        break
      }

      case SUPPORTED_METHODS.GET_SUPPORTED_CHAINS: {
        return getSupportedChains().then((_chains) => {
          const supportedChains = Object.values(_chains).filter((chain) => chain.enabled)
          sendResponse(
            `on${type.toUpperCase()}`,
            {
              chains: supportedChains.map((chain) => chain.chainRegistryPath),
            },
            payload.id,
          )
        })
      }

      case SUPPORTED_METHODS.GET_SECRET20_VIEWING_KEY: {
        if (!payload.chainId || !payload.contractAddress) {
          return sendResponse(`on${type.toUpperCase()}`, '', payload.id)
        }
        const storage = await browser.storage.local.get([VIEWING_KEYS, ACTIVE_WALLET])

        if (!storage[ACTIVE_WALLET]) {
          try {
            await openPopup('login', '?close-on-login=true')
            await awaitUIResponse('user-logged-in')
          } catch {
            sendResponse(`on${type.toUpperCase()}`, { error: 'Invalid chain id' }, payload.id)
            break
          }
        }
        const viewingKeys = storage[VIEWING_KEYS] || {}
        const address = await getWalletAddress(payload.chainId)
        try {
          const key = viewingKeys[address][payload.contractAddress]
          if (!key) {
            throw Error()
          }
          const password = passwordManager.getPassword()
          if (!password) throw new Error('unable to decrypt key')
          const decryptKey = decrypt(key, password)
          sendResponse(`on${type.toUpperCase()}`, decryptKey, payload.id)
        } catch (error) {
          sendResponse(
            `on${type.toUpperCase()}`,
            {
              error: "key doesn't exists",
            },
            payload.id,
          )
        }
        break
      }

      case SUPPORTED_METHODS.SUGGEST_CW20_TOKEN:
      case SUPPORTED_METHODS.SUGGEST_TOKEN:
      case SUPPORTED_METHODS.UPDATE_SECRET20_VIEWING_KEY: {
        if (!payload.chainId || !payload.contractAddress) {
          return sendResponse(`on${type.toUpperCase()}`, '', payload.id)
        }

        const checkSuggestTokenChainConnections = (
          eventName: string,
          store: Record<string, any>,
        ) => {
          return checkChainConnections(
            [payload.chainId],
            store[CONNECTIONS],
            payload,
            store[ACTIVE_WALLET],
          ).then(({ validChainIds }) => {
            if (validChainIds.length === 0) {
              return sendResponse(eventName, { error: 'Invalid chain id' }, payload.id)
            }
            return browser.storage.local
              .set({
                [REDIRECT_REQUEST]: {
                  type: 'suggest-token',
                  msg: { ...payload, type },
                },
              })
              .then(async () =>
                openPopup('add-secret-token').then((window) => {
                  popupWindowId = window.id ?? 0
                  windowIdForPayloadId[popupWindowId] = {
                    type: eventName,
                    payloadId: payload.id,
                  }

                  return awaitEnableChainResponse()
                    .then(() => sendResponse(eventName, { payload: '' }, payload.id))
                    .catch(() => sendResponse(eventName, { error: 'Request rejected' }, payload.id))
                }),
              )
          })
        }

        if (type !== SUPPORTED_METHODS.SUGGEST_CW20_TOKEN) {
          browser.storage.local.get([VIEWING_KEYS]).then(async (storage) => {
            const viewingKeys = storage[VIEWING_KEYS] || {}
            const address = await getWalletAddress(payload.chainId)
            const viewingKeysForaddress = viewingKeys[address] || {}
            const key = viewingKeysForaddress[payload.contractAddress]
            if (key) {
              return sendResponse(`on${type.toUpperCase()}`, '', payload.id)
            }
            await browser.storage.local.set({
              [SUGGEST_TOKEN]: { ...payload, address },
            })
            return browser.storage.local.get([CONNECTIONS, ACTIVE_WALLET]).then((store) => {
              const eventName = `on${type.toUpperCase()}`
              checkSuggestTokenChainConnections(eventName, store)
            })
          })
        } else {
          browser.storage.local.get([CONNECTIONS, ACTIVE_WALLET]).then(async (store) => {
            const eventName = `on${type.toUpperCase()}`
            const address = await getWalletAddress(payload.chainId)

            await browser.storage.local.set({
              [SUGGEST_TOKEN]: { ...payload, address, type },
            })
            checkSuggestTokenChainConnections(eventName, store)
          })
        }

        break
      }

      case SUPPORTED_METHODS.GET_PUBKEY_MSG:
      case SUPPORTED_METHODS.GET_TX_ENCRYPTION_KEY_MSG:
      case SUPPORTED_METHODS.REQUEST_ENCRYPT_MSG:
      case SUPPORTED_METHODS.REQUEST_DECRYPT_MSG: {
        if (!passwordManager.getPassword()) {
          const store = await browser.storage.local.get([ACTIVE_WALLET])
          if (!store[ACTIVE_WALLET]) {
            try {
              await openPopup('login', '?close-on-login=true')
              await awaitUIResponse('user-logged-in')
            } catch {
              sendResponse(`on${type.toUpperCase()}`, { error: 'Invalid chain id' }, payload.id)
              break
            }
          }
        }
        getSeed(passwordManager.getPassword() ?? '').then(async (seed) => {
          const ChainInfos = await getChains()
          const secretLcdUrl = getRestUrl(ChainInfos, 'secret', false)
          const result = new EncryptionUtilsImpl(secretLcdUrl, payload.chainId, seed)

          if (type === SUPPORTED_METHODS.GET_PUBKEY_MSG) {
            result
              .getPubkey()
              .then((res) => sendResponse(`on${type.toUpperCase()}`, res, payload.id))
              .catch((error) =>
                sendResponse(`on${type.toUpperCase()}`, { error: error.message }, payload.id),
              )
          } else if (type === SUPPORTED_METHODS.GET_TX_ENCRYPTION_KEY_MSG) {
            result
              .getTxEncryptionKey(payload.nonce)
              .then((res) => sendResponse(`on${type.toUpperCase()}`, res, payload.id))
              .catch((error) =>
                sendResponse(`on${type.toUpperCase()}`, { error: error.message }, payload.id),
              )
          } else if (type === SUPPORTED_METHODS.REQUEST_ENCRYPT_MSG) {
            result
              .encrypt(payload.contractCodeHash, payload.msg)
              .then((res) => sendResponse(`on${type.toUpperCase()}`, res, payload.id))
              .catch((error) =>
                sendResponse(`on${type.toUpperCase()}`, { error: error.message }, payload.id),
              )
          } else if (type === SUPPORTED_METHODS.REQUEST_DECRYPT_MSG) {
            result
              .decrypt(
                new Uint8Array(Object.values(payload.ciphertext)),
                new Uint8Array(Object.values(payload.nonce)),
              )
              .then((res) => {
                sendResponse(`on${type.toUpperCase()}`, res, payload.id)
              })
              .catch((error) =>
                sendResponse(`on${type.toUpperCase()}`, { error: error.message }, payload.id),
              )
          }
        })
      }
    }
  }

  portStream.on('data', async (data: any) => {
    await requestHandler(data)
  })
}

browser.runtime.onConnect.addListener(connectRemote)

// function setOnTabRemovedListener(
//  sendResponse: (type: string, payload: any, payloadId: number) => void,
// ) {
//   browser.windows.onRemoved.addListener((windowId) => {
//     const closingWindowId = windowId
//     const enableAccessEntry = Object.entries(enableAccessRequests).find((entry) => {
//       return entry[1] === closingWindowId
//     })
//     if (enableAccessEntry) {
//       delete enableAccessRequests[enableAccessEntry[0]]
//     }
//     if (windowIdForPayloadId[closingWindowId]) {
//       const { type, payloadId } = windowIdForPayloadId[closingWindowId]
//       delete windowIdForPayloadId[closingWindowId]
//       sendResponse(`on${type}`, { error: 'User closed the popup' }, payloadId)
//     }
//   })
// }

async function getKey(_chain: string) {
  const { 'active-wallet': activeWallet } = await browser.storage.local.get([ACTIVE_WALLET])
  const _chainIdToChain = await decodeChainIdToChain()
  let chain = _chainIdToChain[_chain]

  chain = chain === 'cosmoshub' ? 'cosmos' : chain
  return {
    address: Bech32Address.fromBech32(activeWallet.addresses[chain] ?? '').address,
    algo: 'secp256k1',
    bech32Address: activeWallet.addresses[chain],
    isNanoLedger: activeWallet.walletType === 3,
    name: activeWallet.name,
    pubKey: toUint8Array(activeWallet.pubKeys?.[chain] ?? ''),
  }
}

async function getKeys(chainIds: string[]) {
  const { 'active-wallet': activeWallet } = await browser.storage.local.get([ACTIVE_WALLET])
  const _chainIdToChain = await decodeChainIdToChain()
  const chains = chainIds.map((chainId) => _chainIdToChain[chainId])
  const keys = Object.keys(activeWallet.addresses)
    .filter((chain: string) => chains.indexOf(chain) > -1)
    .map((chain) => {
      return {
        address: Bech32Address.fromBech32(activeWallet.addresses[chain] ?? '').address,
        algo: 'secp256k1',
        bech32Address: activeWallet.addresses[chain],
        isNanoLedger: activeWallet.walletType === 3,
        name: activeWallet.name,
        pubKey: toUint8Array(activeWallet.pubKeys?.[chain] ?? ''),
      }
    })
  return keys
}

browser.runtime.onInstalled.addListener((details) => {
  browser.storage.local
    .get([
      KEYSTORE,
      ACTIVE_WALLET,
      ENCRYPTED_ACTIVE_WALLET,
      AUTO_LOCK_TIME,
      'encrypted',
      'timestamp',
    ])
    .then(async (storage) => {
      const activeWallet = storage[ACTIVE_WALLET]
      const encryptedActiveWallet = storage[ENCRYPTED_ACTIVE_WALLET]

      if (!activeWallet && !encryptedActiveWallet) {
        browser.tabs.create({
          url: browser.runtime.getURL('index.html'),
          active: true,
        })
        await browser.storage.local.set({ [V80_KEYSTORE_MIGRATION_COMPLETE]: true })
      } else if (details.reason === 'update' && (activeWallet || encryptedActiveWallet)) {
        //previous version as int (e.g. v 0.1.9 will return 19)
        const previousVersion = details?.previousVersion?.split('.').join('')

        if (!previousVersion) return

        const prevVersionInt = parseInt(previousVersion, 10)
        const execV80Migration =
          [710, 711, 712, 713].includes(prevVersionInt) || prevVersionInt < 80

        if (prevVersionInt < 9) {
          storageMigrationV9(storage)
        }
        if (prevVersionInt < 10) {
          storageMigrationV10(storage)
        }
        if (prevVersionInt < 19) {
          storageMigrationV19()
        }
        if (prevVersionInt < 53) {
          storageMigrationV53(storage)
        }
        if (prevVersionInt < 74) {
          storageMigrationV77(storage)
        }
        if (execV80Migration) {
          storageMigrationV80(passwordManager)
        }
      }
    })
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const openAuthPage = async function (message: any) {
  const { 'active-wallet': activeWallet, 'encrypted-active-wallet': encryptedActiveWallet } =
    await browser.storage.local.get([ACTIVE_WALLET, ENCRYPTED_ACTIVE_WALLET])
  if (!activeWallet && !encryptedActiveWallet) {
    await browser.tabs.create({
      url: browser.runtime.getURL('index.html#/onboarding'),
      active: true,
    })
  } else {
    await browser.action.setPopup({ popup: 'index.html' })
  }
}

if (!browser.action.onClicked.hasListener(openAuthPage)) {
  browser.action.onClicked.addListener(openAuthPage)
}

function awaitResponse(txType: 'direct' | 'amino') {
  return new Promise((resolve, reject) => {
    const directSignResponseListener = (changes: Record<string, Storage.StorageChange>) => {
      const { newValue } = changes[BG_RESPONSE] || {}
      if (newValue) {
        if (newValue.error) {
          return reject(newValue)
        }
        const response = JSON.parse(newValue)
        if (txType === 'direct') {
          response.signed.authInfoBytes = new Uint8Array(
            Object.values(response.signed.authInfoBytes),
          )
          response.signed.bodyBytes = new Uint8Array(Object.values(response.signed.bodyBytes))

          resolve(response)
        } else {
          resolve(response)
        }
        browser.storage.local.remove(BG_RESPONSE)

        browser.storage.onChanged.removeListener(directSignResponseListener)
      }
    }
    browser.storage.onChanged.addListener(directSignResponseListener)
  })
}

function awaitEnableChainResponse(): Promise<any> {
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

// function fetchChainData(url: string) {
//   return fetch(url)
//     .then((res) => res.json())
//     .catch((err) => err)
// }

function removeTrailingSlash(url?: string) {
  if (!url) return ''
  return url.replace(/\/$/, '')
}

function formatNewChainInfo(chainInfo: any) {
  const apis = {
    rest: removeTrailingSlash(chainInfo.rest),
    rpc: removeTrailingSlash(chainInfo.rpc),
    rpcTest: removeTrailingSlash(chainInfo.rpcTest) || '',
    restTest: removeTrailingSlash(chainInfo.restTest) || '',
  }
  if (chainInfo.rpcTest) apis.rpcTest = chainInfo.rpcTest
  if (chainInfo.restTest) apis.restTest = chainInfo.restTest
  try {
    const { gasPriceStep, ...rest } = chainInfo.feeCurrencies[0]
    const addressPrefix = chainInfo.bech32Config.bech32PrefixAccAddr
    return {
      [chainInfo.chainName]: {
        chainId: chainInfo.chainId,
        chainName: chainInfo.chainName,
        chainRegistryPath: chainInfo.chainRegistryPath ?? addressPrefix,
        key: chainInfo.chainName,
        chainSymbolImageUrl: chainInfo.image || customIcon,
        txExplorer: {
          mainnet: chainInfo.txExplorer?.mainnet || {},
        },
        apis,
        denom: rest.coinDenom,
        bip44: {
          coinType: `${chainInfo.bip44.coinType}`,
        },
        addressPrefix: addressPrefix,
        gasPriceStep: gasPriceStep,
        ibcChannelIds: {},
        nativeDenoms: {
          [rest.coinMinimalDenom]: rest,
        },
        theme: chainInfo.theme || {
          primaryColor: '#E18881',
          gradient:
            'linear-gradient(180deg, rgba(225, 136, 129, 0.32) 0%, rgba(225, 136, 129, 0) 100%)',
        },
        enabled: true,
        beta: true,
        features: chainInfo.features || [],
      },
    }
  } catch (error) {
    throw Error('missing params')
  }
}
