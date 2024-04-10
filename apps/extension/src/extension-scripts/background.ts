/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */

/***
 * Do not remove this import and keep this on the first line.
 */
// eslint-disable-next-line simple-import-sort/imports
import './fetch-preserver'

import { SUPPORTED_METHODS } from '@leapwallet/cosmos-wallet-provider/dist/provider/messaging/requester'
import {
  ChainInfo,
  ChainInfos,
  SupportedChain,
  getRestUrl,
  getSeiEvmAddressToShow,
  parseStandardTokenTransactionData,
  formatEtherValue,
  ARCTIC_COSMOS_CHAIN_ID,
  ARCTIC_ETH_CHAIN_ID,
  encodedUtf8HexToText,
} from '@leapwallet/cosmos-wallet-sdk'

import { decrypt, initCrypto, initStorage, WALLETTYPE } from '@leapwallet/leap-keychain'
import {
  ACTIVE_WALLET,
  AUTO_LOCK_TIME,
  BETA_CHAINS,
  BG_RESPONSE,
  CONNECTIONS,
  ENCRYPTED_ACTIVE_WALLET,
  KEYSTORE,
  REDIRECT_REQUEST,
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
  awaitSigningResponse,
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
  requestSignTransaction,
  validateNewChainInfo,
} from './utils'
import { EncryptionUtilsImpl } from '@leapwallet/cosmos-wallet-sdk/dist/secret/encryptionutil'
import { PasswordManager } from './password-manager'
import { storageMigrationV77 } from './migrations/v77'
import { getChains } from '@leapwallet/cosmos-wallet-hooks'
import { storageMigrationV80 } from './migrations/v80'
import { formatWalletName } from 'utils/formatWalletName'
import { getUpdatedKeyStore } from 'hooks/wallet/getUpdatedKeyStore'
import { listenPendingSwapTx, trackPendingSwapTx } from './pending-swap-tx'
import { MessageTypes } from 'config/message-types'
import {
  ETHEREUM_METHOD_TYPE,
  ETHEREUM_RPC_ERROR,
  EthereumRequestMessage,
  LINE_TYPE,
  LineType,
} from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import { LeapEvmRpcError } from '@leapwallet/cosmos-wallet-provider/dist/provider/evm-error'

global.window = self

const storageAdapter = getStorageAdapter()
initStorage(storageAdapter)
initCrypto()

type Data = EthereumRequestMessage & {
  origin: string
  ecosystem: LineType
}

const windowIdForPayloadId: { [x: number | string]: { type: string; payloadId: number } } = {}

let enableAccessRequests: Record<string, number> = {}

const passwordManager = PasswordManager.create()
trackPendingSwapTx()
listenPendingSwapTx()

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

    switch (message.type) {
      case 'chain-enabled':
        if (message.payload?.ecosystem === LINE_TYPE.ETHEREUM) {
          const store = await browser.storage.local.get([ACTIVE_WALLET])
          const seiEvmAddress = getSeiEvmAddressToShow(store[ACTIVE_WALLET].pubKeys?.['seiDevnet'])

          if (seiEvmAddress.startsWith('0x')) {
            const successResponse =
              message.payload?.ethMethod === ETHEREUM_METHOD_TYPE.WALLET__REQUEST_PERMISSIONS
                ? // Refer - https://docs.metamask.io/wallet/reference/wallet_requestpermissions
                  [
                    {
                      id: message.payload?.payloadId,
                      parentCapability: ETHEREUM_METHOD_TYPE.ETH__ACCOUNTS,
                      invoker: message.payload?.origin,
                      caveats: [
                        {
                          type: 'restrictReturnedAccounts',
                          value: [seiEvmAddress],
                        },
                      ],
                      date: Date.now(),
                    },
                  ]
                : [seiEvmAddress]

            sendResponse(
              `on${SUPPORTED_METHODS.ENABLE_ACCESS}`,
              { success: successResponse },
              message.payload.payloadId,
            )
          } else {
            sendResponse(
              `on${SUPPORTED_METHODS.ENABLE_ACCESS}`,
              { error: new LeapEvmRpcError(ETHEREUM_RPC_ERROR.INTERNAL, seiEvmAddress) },
              message.payload.payloadId,
            )
          }
        } else {
          sendResponse(
            `on${SUPPORTED_METHODS.ENABLE_ACCESS}`,
            { success: 'Chain enabled' },
            message.payload.payloadId,
          )
        }

        break

      case 'chain-approval-rejected':
        if (message.payload?.ecosystem === LINE_TYPE.ETHEREUM) {
          sendResponse(
            `on${SUPPORTED_METHODS.ENABLE_ACCESS}`,
            { error: new LeapEvmRpcError(ETHEREUM_RPC_ERROR.USER_REJECTED_REQUEST) },
            message.payload.payloadId,
          )
        } else {
          sendResponse(
            `on${SUPPORTED_METHODS.ENABLE_ACCESS}`,
            { error: 'Request rejected' },
            message.payload.payloadId,
          )
        }

        break

      case 'popup-closed':
        enableAccessRequests = {}
        break
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
                    openPopup('suggestChain').then(async (windowId) => {
                      popupWindowId = windowId ?? 0
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
            await awaitUIResponse('user-logged-in')
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

                delete enableAccessRequests[queryString]
                enableAccessRequests[queryString] = popupWindowId
                await openPopup('approveConnection')
                requestEnableAccess({ origin: msg.origin, validChainIds, payloadId: payload.id })
                windowIdForPayloadId[popupWindowId] = {
                  type: type.toUpperCase(),
                  payloadId: payload.id,
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

          await browser.storage.local.get([ACTIVE_WALLET])
          const password = passwordManager.getPassword()
          if (!password) {
            try {
              await openPopup('login', '?close-on-login=true')
              await awaitUIResponse('user-logged-in')
            } catch {
              sendResponse(eventName, { error: 'Invalid chain id' }, payload.id)
              break
            }
          }

          const store = await browser.storage.local.get([CONNECTIONS, ACTIVE_WALLET])
          const activeWallet = store[ACTIVE_WALLET]
          const connections = store[CONNECTIONS]

          const { validChainIds, isNewChainPresent } = await checkChainConnections(
            chainIds,
            connections,
            msg,
            activeWallet,
          )

          if (validChainIds.length === 0) {
            sendResponse(eventName, { error: 'Invalid chain id' }, payload.id)
            return
          }
          const chainIdToChain = await decodeChainIdToChain()
          const requestedChainKeys = validChainIds
            .map((chainId) => chainIdToChain[chainId])
            .filter((chainKey) => {
              return !!activeWallet.addresses[chainKey]
            })
          if (requestedChainKeys.length === 0) {
            sendResponse(
              eventName,
              { error: `No public key for ${validChainIds.join(',')}` },
              payload.id,
            )
            return
          }

          if (isNewChainPresent) {
            await openPopup('approveConnection')
            windowIdForPayloadId[popupWindowId] = {
              type: type.toUpperCase(),
              payloadId: payload.id,
            }
            requestEnableAccess({
              origin: msg.origin,
              validChainIds,
              payloadId: payload.id,
            })

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
        }
        break

      case SUPPORTED_METHODS.REQUEST_SIGN_DIRECT: {
        const msg = payload

        requestSignTransaction({
          signDoc: msg.signDoc,
          signer: msg.signer,
          origin: msg.origin,
          isAmino: false,
          signOptions: msg.signOptions,
        })

        await openPopup('sign')
        try {
          const response = await awaitSigningResponse(MessageTypes.signResponse)
          sendResponse(`on${type.toUpperCase()}`, { directSignResponse: response }, payload.id)
        } catch (e) {
          sendResponse(`on${type.toUpperCase()}`, { error: 'Transaction declined' }, payload.id)
        }
        break
      }

      case SUPPORTED_METHODS.REQUEST_SIGN_AMINO: {
        const msg = payload

        requestSignTransaction({
          signDoc: msg.signDoc,
          chainId: msg.chainId,
          signer: msg.signer,
          origin: msg.origin,
          isAmino: true,
          isAdr36: msg.signOptions.isSignArbitrary,
          isADR36WithString: msg.signOptions.isAdr36WithString,
          ethSignType: msg.signOptions.ethSignType,
          signOptions: msg.signOptions,
          eip712Types: msg.eip712,
        })

        await openPopup('sign')
        try {
          const response = await awaitSigningResponse(MessageTypes.signResponse)
          sendResponse(`on${type.toUpperCase()}`, { aminoSignResponse: response }, payload.id)
        } catch (e) {
          sendResponse(`on${type.toUpperCase()}`, { error: 'Transaction declined' }, payload.id)
        }
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

        if (!passwordManager.getPassword()) {
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
          let decryptKey = decrypt(key, password)
          if (decryptKey === '') {
            decryptKey = decrypt(key, password, 100)
          }
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
                openPopup('add-secret-token').then((windowId) => {
                  popupWindowId = windowId ?? 0
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

  const evmRequestHandler = async (data: Data) => {
    const { method, ...payload } = data
    const popupWindowId = 0
    const sendResponseName = `on${method.toUpperCase()}`

    switch (method) {
      case ETHEREUM_METHOD_TYPE.ETH__CHAIN_ID: {
        const payloadId = payload.id as unknown as number
        sendResponse(
          sendResponseName,
          { success: `0x${ARCTIC_ETH_CHAIN_ID.toString(16)}` },
          payloadId,
        )
        break
      }

      case ETHEREUM_METHOD_TYPE.ETH__SIGN:
      case ETHEREUM_METHOD_TYPE.PERSONAL_SIGN:
      case ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4: {
        const payloadId = payload.id as unknown as number
        const store = await browser.storage.local.get([ACTIVE_WALLET])

        if (!store[ACTIVE_WALLET]) {
          try {
            await openPopup('login', '?close-on-login=true')
            await awaitUIResponse('user-logged-in')
          } catch {
            sendResponse(
              sendResponseName,
              { error: new LeapEvmRpcError(ETHEREUM_RPC_ERROR.USER_REJECTED_REQUEST) },
              payloadId,
            )

            break
          }
        }

        const seiEvmAddress = getSeiEvmAddressToShow(store[ACTIVE_WALLET].pubKeys?.['seiDevnet'])

        if (seiEvmAddress.startsWith('0x')) {
          if (payload.params) {
            // @ts-ignore
            let payloadAddress = payload.params[1]
            // @ts-ignore
            let data = payload.params[0]

            if (
              [
                ETHEREUM_METHOD_TYPE.ETH__SIGN,
                ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4,
              ].includes(method)
            ) {
              ;[payloadAddress, data] = [data, payloadAddress]
            }

            if (
              seiEvmAddress.toLowerCase() !== payloadAddress.toLowerCase() ||
              !data ||
              (method !== ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4 && !data?.startsWith('0x'))
            ) {
              sendResponse(
                sendResponseName,
                { error: new LeapEvmRpcError(ETHEREUM_RPC_ERROR.INVALID_PARAMS) },
                payloadId,
              )

              break
            }

            if (
              method === ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4 &&
              data.domain.chainId !== ARCTIC_ETH_CHAIN_ID
            ) {
              sendResponse(
                sendResponseName,
                {
                  error: new LeapEvmRpcError(ETHEREUM_RPC_ERROR.INVALID_PARAMS, 'Invalid chainId.'),
                },
                payloadId,
              )

              break
            }

            const details: any =
              method === ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4
                ? { [data.primaryType]: data.message }
                : { Message: encodedUtf8HexToText(data) }

            const signTxnData = {
              payloadAddress,
              data,
              methodType: method,
              details,
            }

            requestSignTransaction({
              origin: payload.origin,
              ecosystem: payload.ecosystem,
              signTxnData,
            })

            await openPopup('signSeiEvm')

            try {
              const response = await awaitSigningResponse(MessageTypes.signSeiEvmResponse)
              sendResponse(sendResponseName, { success: response }, payloadId)
            } catch (e) {
              sendResponse(
                sendResponseName,
                { error: new LeapEvmRpcError(ETHEREUM_RPC_ERROR.USER_REJECTED_REQUEST) },
                payloadId,
              )
            }
          }
        } else {
          sendResponse(
            sendResponseName,
            { error: new LeapEvmRpcError(ETHEREUM_RPC_ERROR.INTERNAL, seiEvmAddress) },
            payloadId,
          )
        }

        break
      }

      case ETHEREUM_METHOD_TYPE.ETH__ACCOUNTS: {
        const payloadId = payload.id as unknown as number
        const store = await browser.storage.local.get([ACTIVE_WALLET])

        if (!store[ACTIVE_WALLET]) {
          try {
            await openPopup('login', '?close-on-login=true')
            await awaitUIResponse('user-logged-in')
          } catch {
            sendResponse(
              sendResponseName,
              { error: new LeapEvmRpcError(ETHEREUM_RPC_ERROR.USER_REJECTED_REQUEST) },
              payloadId,
            )

            break
          }
        }

        const seiEvmAddress = getSeiEvmAddressToShow(store[ACTIVE_WALLET].pubKeys?.['seiDevnet'])

        if (seiEvmAddress.startsWith('0x')) {
          sendResponse(sendResponseName, { success: [seiEvmAddress] }, payloadId)
        } else {
          sendResponse(
            sendResponseName,
            { error: new LeapEvmRpcError(ETHEREUM_RPC_ERROR.INTERNAL, seiEvmAddress) },
            payloadId,
          )
        }

        break
      }

      case ETHEREUM_METHOD_TYPE.ETH__SEND_TRANSACTION: {
        const payloadId = payload.id as unknown as number

        if (payload.params) {
          // @ts-ignore
          const parsedData = parseStandardTokenTransactionData(payload.params[0].data)
          let signTxnData = {}

          if (!parsedData) {
            // @ts-ignore
            const value = payload.params[0].value
            // @ts-ignore
            const to = payload.params[0].to
            // @ts-ignore
            const data = payload.params[0].data

            signTxnData = {
              value: value ? formatEtherValue(value) : '0',
              to,
              data,
              details: {
                Value: value ? `${value} SEI` : '0',
                'Contract Interaction': to,
                'HEX Data': data,
              },
            }
          } else {
            switch (parsedData.name) {
              case 'approve': {
                const value = parsedData.value.toString()
                // @ts-ignore
                const to = payload.params[0].to
                // @ts-ignore
                const data = payload.params[0].data

                signTxnData = {
                  value,
                  to,
                  data,
                  spendPermissionCapValue: parsedData.args[1].toString(),
                  details: {
                    'Third Party': parsedData.args[0],
                    Data: {
                      Function: 'Approve',
                      HEX: data,
                    },
                  },
                }

                break
              }
            }
          }

          requestSignTransaction({
            origin: payload.origin,
            ecosystem: payload.ecosystem,
            signTxnData,
          })

          await openPopup('signSeiEvm')

          try {
            const response = await awaitSigningResponse(MessageTypes.signSeiEvmResponse)
            sendResponse(sendResponseName, { success: response }, payloadId)
          } catch (e) {
            sendResponse(
              sendResponseName,
              { error: new LeapEvmRpcError(ETHEREUM_RPC_ERROR.USER_REJECTED_REQUEST) },
              payloadId,
            )
          }
        }

        break
      }

      case ETHEREUM_METHOD_TYPE.WALLET__REQUEST_PERMISSIONS:
      case ETHEREUM_METHOD_TYPE.ETH__REQUEST_ACCOUNTS: {
        if (
          method === ETHEREUM_METHOD_TYPE.WALLET__REQUEST_PERMISSIONS &&
          // @ts-ignore
          !Object.keys(payload.params?.[0] ?? {}).includes(ETHEREUM_METHOD_TYPE.ETH__ACCOUNTS)
        ) {
          break
        }

        const msg = payload
        const payloadId = payload.id as unknown as number
        const chainIds: [string] = [ARCTIC_COSMOS_CHAIN_ID]

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
            sendResponse(
              sendResponseName,
              { error: new LeapEvmRpcError(ETHEREUM_RPC_ERROR.USER_REJECTED_REQUEST) },
              payloadId,
            )
            break
          }
        }

        checkConnection(chainIds, msg)
          .then(async ({ validChainIds, isNewChainPresent }) => {
            if (validChainIds.length > 0) {
              const seiEvmAddress = getSeiEvmAddressToShow(
                store[ACTIVE_WALLET].pubKeys?.['seiDevnet'],
              )

              const successResponse =
                method === ETHEREUM_METHOD_TYPE.WALLET__REQUEST_PERMISSIONS
                  ? // Refer - https://docs.metamask.io/wallet/reference/wallet_requestpermissions
                    [
                      {
                        id: payloadId,
                        parentCapability: ETHEREUM_METHOD_TYPE.ETH__ACCOUNTS,
                        invoker: msg?.origin,
                        caveats: [
                          {
                            type: 'restrictReturnedAccounts',
                            value: [seiEvmAddress],
                          },
                        ],
                        date: Date.now(),
                      },
                    ]
                  : [seiEvmAddress]

              if (isNewChainPresent) {
                await browser.storage.local.set({
                  [REDIRECT_REQUEST]: { type: method, msg: { ...msg, validChainIds } },
                })

                const shouldOpenPopup =
                  Object.keys(enableAccessRequests).length === 0 ||
                  !Object.keys(enableAccessRequests).some((key) => key.includes(msg.origin))

                if (shouldOpenPopup) {
                  delete enableAccessRequests[queryString]
                  enableAccessRequests[queryString] = popupWindowId
                  await openPopup('approveConnection')

                  requestEnableAccess({
                    origin: msg.origin,
                    validChainIds,
                    payloadId: payloadId as unknown as string,
                    ecosystem: LINE_TYPE.ETHEREUM,
                    ethMethod: method,
                  })

                  windowIdForPayloadId[popupWindowId] = {
                    type: method.toUpperCase(),
                    payloadId: payloadId,
                  }
                } else {
                  if (!enableAccessRequests[queryString]) {
                    requestEnableAccess({
                      origin: msg.origin,
                      validChainIds,
                      payloadId: payloadId as unknown as string,
                      ecosystem: LINE_TYPE.ETHEREUM,
                      ethMethod: method,
                    })

                    enableAccessRequests[queryString] = popupWindowId
                  }
                }

                try {
                  await awaitEnableChainResponse()

                  if (seiEvmAddress.startsWith('0x')) {
                    sendResponse(sendResponseName, { success: successResponse }, payloadId)
                  } else {
                    sendResponse(
                      sendResponseName,
                      { error: new LeapEvmRpcError(ETHEREUM_RPC_ERROR.INTERNAL, seiEvmAddress) },
                      payloadId,
                    )
                  }

                  delete enableAccessRequests[queryString]
                } catch (error: any) {
                  sendResponse(
                    sendResponseName,
                    { error: new LeapEvmRpcError(ETHEREUM_RPC_ERROR.INTERNAL, error.error) },
                    payloadId,
                  )
                  delete enableAccessRequests[queryString]
                }
              } else {
                if (seiEvmAddress.startsWith('0x')) {
                  sendResponse(sendResponseName, { success: successResponse }, payloadId)
                } else {
                  sendResponse(
                    sendResponseName,
                    { error: new LeapEvmRpcError(ETHEREUM_RPC_ERROR.INTERNAL, seiEvmAddress) },
                    payloadId,
                  )

                  delete enableAccessRequests[queryString]
                }
              }
            } else {
              sendResponse(
                sendResponseName,
                { error: new LeapEvmRpcError(ETHEREUM_RPC_ERROR.INTERNAL, 'Invalid chain id') },
                payloadId,
              )

              delete enableAccessRequests[queryString]
            }
          })
          .catch(() => {
            sendResponse(
              sendResponseName,
              { error: new LeapEvmRpcError(ETHEREUM_RPC_ERROR.INTERNAL, 'Invalid chain id') },
              payloadId,
            )

            delete enableAccessRequests[queryString]
          })
        break
      }
    }
  }

  portStream.on('data', async (data: any) => {
    if (data?.ecosystem === LINE_TYPE.ETHEREUM) {
      await evmRequestHandler(data)
    } else {
      await requestHandler(data)
    }
  })
}

browser.runtime.onConnect.addListener(connectRemote)

async function getKey(_chain: string) {
  let { 'active-wallet': activeWallet } = await browser.storage.local.get([ACTIVE_WALLET])
  const _chainIdToChain = await decodeChainIdToChain()
  let chain = _chainIdToChain[_chain]

  chain = chain === 'cosmoshub' ? 'cosmos' : chain
  const password = passwordManager.getPassword()
  if (!activeWallet.addresses[chain] && !ChainInfos[chain as SupportedChain].enabled) {
    throw new Error('Invalid chain id')
  }

  if (!activeWallet.addresses[chain] && ChainInfos[chain as SupportedChain].enabled && password) {
    if (
      activeWallet.walletType === WALLETTYPE.LEDGER &&
      ChainInfos[chain as SupportedChain].bip44.coinType === '60'
    ) {
      throw new Error('Ledger wallet is not supported for this chain')
    }
    const updatedKeyStore = await getUpdatedKeyStore(
      ChainInfos,
      password,
      chain as SupportedChain,
      activeWallet,
      'UPDATE',
    )
    activeWallet = updatedKeyStore
  }

  return {
    address: Bech32Address.fromBech32(activeWallet.addresses[chain] ?? '').address,
    algo: 'secp256k1',
    bech32Address: activeWallet.addresses[chain],
    isNanoLedger: activeWallet.walletType === 3,
    name: formatWalletName(activeWallet.name),
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
        name: formatWalletName(activeWallet.name.replace),
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

// function awaitResponse(txType: 'direct' | 'amino') {
//   return new Promise((resolve, reject) => {
//     const directSignResponseListener = (changes: Record<string, Storage.StorageChange>) => {
//       const { newValue } = changes[BG_RESPONSE] || {}
//       if (newValue) {
//         if (newValue.error) {
//           return reject(newValue)
//         }
//         const response = JSON.parse(newValue)
//         if (txType === 'direct') {
//           response.signed.authInfoBytes = new Uint8Array(
//             Object.values(response.signed.authInfoBytes),
//           )
//           response.signed.bodyBytes = new Uint8Array(Object.values(response.signed.bodyBytes))

//           resolve(response)
//         } else {
//           resolve(response)
//         }
//         browser.storage.local.remove(BG_RESPONSE)

//         browser.storage.onChanged.removeListener(directSignResponseListener)
//       }
//     }
//     browser.storage.onChanged.addListener(directSignResponseListener)
//   })
// }

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
    let testnetData = {}
    if (chainInfo?.rpcTest || chainInfo?.restTest) {
      testnetData = {
        testnetChainId: chainInfo.chainId,
        testnetChainRegistryPath: chainInfo.chainRegistryPath ?? addressPrefix,
      }
    }
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
        apiStatus: chainInfo?.apiStatus,
        ...testnetData,
      },
    }
  } catch (error) {
    throw Error('missing params')
  }
}
