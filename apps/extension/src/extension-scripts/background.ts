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
  encodedUtf8HexToText,
  fetchERC20Balances,
  formatEtherValue,
  getEvmChainIdMap,
  getRestUrl,
  getTopNode,
  isAptosChain,
  isSolanaChain,
  NetworkType,
  parseStandardTokenTransactionData,
  pubKeyToEvmAddressToShow,
  SeiEvmTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'

import { decrypt, initCrypto, initStorage } from '@leapwallet/leap-keychain'
import {
  ACTIVE_CHAIN,
  ACTIVE_WALLET,
  AUTO_LOCK_TIME,
  BETA_CHAINS,
  BG_RESPONSE,
  ENCRYPTED_ACTIVE_WALLET,
  IS_LIGHT_NODE_RUNNING,
  KEYSTORE,
  LAST_EVM_ACTIVE_CHAIN,
  LIGHT_NODE_RUNNING_STATS,
  REDIRECT_REQUEST,
  V118_KEYSTORE_MIGRATION_COMPLETE,
  V125_BETA_NFT_COLLECTIONS_MIGRATION_COMPLETE,
  V151_NFT_SEPARATOR_CHANGE_MIGRATION_COMPLETE,
  V80_KEYSTORE_MIGRATION_COMPLETE,
  VIEWING_KEYS,
} from 'config/storage-keys'
import PortStream from 'extension-port-stream'
import browser from 'webextension-polyfill'

import { getStorageAdapter } from '../utils/storageAdapter'
import { NEW_CHAIN_REQUEST, SUGGEST_TOKEN } from './../config/storage-keys'

import {
  ChainInfosWithoutEndpoints,
  CosmosChainInfoWithoutEndpoints,
  EVMChainInfoWithoutEndpoints,
  formatNewChainInfo,
  getChains,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  APTOS_METHOD_TYPE,
  ETHEREUM_METHOD_TYPE,
  ETHEREUM_RPC_ERROR,
  EthereumRequestMessage,
  LINE_TYPE,
  LineType,
} from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import { getEvmError } from '@leapwallet/cosmos-wallet-provider/dist/utils/get-evm-error'
import { EncryptionUtilsImpl } from '@leapwallet/cosmos-wallet-sdk/dist/browser/secret/encryptionutil'
import { MessageTypes } from 'config/message-types'
import { handleSendTx } from './handle-sendtx'
import { storageMigrationV10 } from './migrations/v10'
import { storageMigrationV19 } from './migrations/v19'
import { storageMigrationV53 } from './migrations/v53'
import { storageMigrationV77 } from './migrations/v77'
import { storageMigrationV80 } from './migrations/v80'
import { storageMigrationV9 } from './migrations/v9'
import { PasswordManager } from './password-manager'
import { initiatePendingSwapTxTracking, listenPendingSwapTx } from './pending-swap-tx'

import { addToConnections } from 'pages/ApproveConnection/utils'
import { addTxToPendingTxList } from 'utils/pendingSwapsTxsStore'
import { LightNode } from './lightnode'
import { bitcoinRequestHandler } from './request-handlers/bitcoin-request.handler'
import { getKey, handleGetKey } from './request-handlers/getKey.handler'
import { updateNodeUrls } from './update-node-urls'
import {
  awaitApproveChainResponse,
  awaitEnableChainResponse,
  awaitSigningResponse,
  awaitUIResponse,
  checkConnection,
  disconnect,
  getChainOriginStorageKey,
  getSeed,
  getSupportedChains,
  getWalletAddress,
  isConnected,
  openPopup,
  Page,
  requestEnableAccess,
  requestSignTransaction,
  validateNewChainInfo,
} from './utils'
import { addLeapEthereumChain } from './utils-provider-method-functions'
import { switchEthereumChain } from './utils-provider-method-functions/switch-ethereum-chain'
import { solanaRequestHandler } from './request-handlers/solana-request.handler'
import { isBitcoinChain } from '@leapwallet/cosmos-wallet-store/dist/utils'
import { suiRequestHandler } from './request-handlers/sui-request.handler'

const lightNode = new LightNode()
lightNode.attachListener()

global.window = self

const storageAdapter = getStorageAdapter()
initStorage(storageAdapter)
initCrypto()

type Data = EthereumRequestMessage & {
  origin: string
  ecosystem: LineType
}

const enableAccessRequests: Map<string, number> = new Map()

const passwordManager = PasswordManager.create()
initiatePendingSwapTxTracking()
listenPendingSwapTx()

const connectRemote = (remotePort: any) => {
  if (remotePort.name !== 'LeapCosmosExtension') {
    return
  }

  const portStream = new PortStream(remotePort)

  const sendResponse = (name: string, payload: any, id: number) => {
    portStream.write({ name, payload, id })
  }

  //TODO: remove this after aptos merge
  const customOpenPopup = async (
    page: Page,
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

  browser.runtime.onMessage.addListener(async (message, sender) => {
    if (sender.id !== browser.runtime.id) return

    switch (message.type) {
      case 'chain-enabled':
        if (message.payload?.ecosystem === LINE_TYPE.ETHEREUM) {
          const store = await browser.storage.local.get([ACTIVE_WALLET, ACTIVE_CHAIN])
          const lastEvmActiveChain = store[LAST_EVM_ACTIVE_CHAIN] ?? 'ethereum'
          const activeChain: SupportedChain = message.payload?.isLeap
            ? lastEvmActiveChain
            : store[ACTIVE_CHAIN] ?? 'seiTestnet2'
          const seiEvmAddress = pubKeyToEvmAddressToShow(
            store[ACTIVE_WALLET].pubKeys?.[activeChain],
          )

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
              { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, seiEvmAddress) },
              message.payload.payloadId,
            )
          }
        }

        break

      case 'chain-approval-rejected':
        if (message.payload?.ecosystem === LINE_TYPE.ETHEREUM) {
          sendResponse(
            `on${SUPPORTED_METHODS.ENABLE_ACCESS}`,
            { error: getEvmError(ETHEREUM_RPC_ERROR.USER_REJECTED_REQUEST) },
            message.payload.payloadId,
          )
        }

        break

      case 'pending-swaps':
        await addTxToPendingTxList(message.payload, message.override)
        break
    }
  })

  const requestHandler = async (data: any) => {
    const { type, ...payload } = data

    const cosmosCustomOpenPopup = async (page: Page, queryString?: string) => {
      return await customOpenPopup(page, queryString, [
        `on${type.toUpperCase()}`,
        { error: 'Requests exceeded' },
        payload.id,
      ])
    }

    const popupWindowId = 0
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
          try {
            validateNewChainInfo(payload.chainInfo)
          } catch (e: any) {
            return sendResponse(`on${type.toUpperCase()}`, { error: e.message }, payload.id)
          }
          const newChain = formatNewChainInfo({ ...payload.chainInfo, status: 'live' })
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
                      (chain.beta !== true &&
                        chain.testnetChainId?.toLowerCase() ===
                          payload.chainInfo.chainId.toLowerCase())) &&
                    chain.enabled === true,
                ) &&
                !allowCoreumFromLeap
              ) {
                return sendResponse(`on${type.toUpperCase()}`, '', payload.id)
              } else {
                const payloadId = payload.id
                const sendMessageToInvoker = (eventName: string, payload: any) => {
                  sendResponse(eventName, payload, payloadId)
                }
                return browser.storage.local
                  .set({
                    [REDIRECT_REQUEST]: { type },
                    [NEW_CHAIN_REQUEST]: {
                      chainInfo: newChain,
                      origin: payload.origin,
                    },
                  })
                  .then(() =>
                    openPopup('suggestChain', undefined, undefined, sendMessageToInvoker)
                      .then(async () => {
                        return awaitEnableChainResponse()
                          .then(async () =>
                            browser.storage.local.get([BETA_CHAINS]).then(async () => {
                              try {
                                return sendResponse(
                                  `on${type.toUpperCase()}`,
                                  {
                                    success: 'Chain added successfully',
                                  },
                                  payload.id,
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
                      })
                      .catch((error: any) => {
                        if (error.message.includes('Requests exceeded')) {
                          return sendResponse(
                            `on${type.toUpperCase()}`,
                            { error: 'Requests exceeded' },
                            payload.id,
                          )
                        }
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

        const queryString = `?origin=${msg?.origin}`

        const password = passwordManager.getPassword()

        try {
          const { validChainIds, isNewChainPresent } = await checkConnection(chainIds, msg)
          if (validChainIds.length > 0) {
            if (isNewChainPresent || !password) {
              await browser.storage.local.set({
                [REDIRECT_REQUEST]: { type: type, msg: { ...msg, validChainIds } },
              })
              enableAccessRequests.delete(queryString)
              enableAccessRequests.set(queryString, popupWindowId)
              await cosmosCustomOpenPopup('approveConnection', queryString)
              requestEnableAccess({ origin: msg.origin, validChainIds, payloadId: payload.id })
              try {
                const response: any = await awaitApproveChainResponse(payload.id)
                sendResponse(`on${type.toUpperCase()}`, response, response.payloadId)
                enableAccessRequests.delete(queryString)
              } catch (error: any) {
                sendResponse(
                  `on${type.toUpperCase()}`,
                  { error: error.error ?? 'Chain approval rejected' },
                  payload.id,
                )
                enableAccessRequests.delete(queryString)
              }
            } else {
              sendResponse(`on${type.toUpperCase()}`, { success: 'Chain enabled' }, payload.id)
              enableAccessRequests.delete(queryString)
            }
          } else {
            sendResponse(`on${type.toUpperCase()}`, { error: 'Invalid chain id' }, payload.id)
            enableAccessRequests.delete(queryString)
          }
        } catch (e: any) {
          sendResponse(`on${type.toUpperCase()}`, { error: `Invalid chain id` }, payload.id)
          enableAccessRequests.delete(queryString)
        }
        break
      }

      case SUPPORTED_METHODS.GET_KEYS:
      case SUPPORTED_METHODS.GET_KEY:
        {
          await handleGetKey({
            message: { type, payload },
            passwordManager,
            sendResponse,
          })
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

        await cosmosCustomOpenPopup('sign')
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
          isAdr36: msg.signOptions.isSignArbitrary || msg.signOptions.isADR36,
          isADR36WithString: msg.signOptions.isAdr36WithString,
          ethSignType: msg.signOptions.ethSignType,
          signOptions: msg.signOptions,
          eip712Types: msg.eip712,
        })

        await cosmosCustomOpenPopup('sign')
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
          const chainIds: string[] = []
          supportedChains.forEach((chain) => {
            if (
              chain.evmOnlyChain ||
              isAptosChain(chain?.chainId) ||
              isSolanaChain(chain?.chainId) ||
              isBitcoinChain(chain.key)
            ) {
              return
            }
            chainIds.push(chain.chainId)
            if (chain.testnetChainId && chain.testnetChainId !== chain.chainId) {
              chainIds.push(chain.testnetChainId)
            }
            return
          })
          sendResponse(
            `on${type.toUpperCase()}`,
            {
              chains: chainIds,
            },
            payload.id,
          )
        })
      }

      case SUPPORTED_METHODS.GET_CHAIN_INFOS_WITHOUT_ENDPOINTS: {
        return getSupportedChains().then((_chains) => {
          const supportedChains = Object.values(_chains).filter((chain) => chain.enabled)
          const chainInfos: ChainInfosWithoutEndpoints[] = []
          supportedChains.forEach((chain) => {
            if (
              isAptosChain(chain?.chainId) ||
              isSolanaChain(chain?.chainId) ||
              isBitcoinChain(chain.key)
            ) {
              return
            }
            if (chain.evmOnlyChain) {
              const chainInfo: EVMChainInfoWithoutEndpoints = {
                chainId: chain.chainId,
                chainName: chain.chainName,
                bip44: {
                  coinType: parseInt(chain.bip44.coinType),
                },
                chainSymbolImageUrl: chain.chainSymbolImageUrl,
                currencies: Object.values(chain.nativeDenoms ?? []),
                chainType: 'evm',
              }
              chainInfos.push(chainInfo)
              return
            }
            const chainInfo: CosmosChainInfoWithoutEndpoints = {
              chainId: chain.chainId,
              chainName: chain.chainName,
              bip44: {
                coinType: parseInt(chain.bip44.coinType),
              },
              bech32Config: {
                bech32PrefixAccAddr: chain.addressPrefix,
                bech32PrefixAccPub: `${chain.addressPrefix}pub`,
                bech32PrefixConsAddr: `${chain.addressPrefix}valcons`,
                bech32PrefixConsPub: `${chain.addressPrefix}valconspub`,
                bech32PrefixValAddr: `${chain.addressPrefix}valoper`,
                bech32PrefixValPub: `${chain.addressPrefix}valoperpub`,
              },
              chainSymbolImageUrl: chain.chainSymbolImageUrl,
              currencies: Object.values(chain.nativeDenoms ?? []),
              chainType: 'cosmos',
            }
            chainInfos.push(chainInfo)
            return
          })
          sendResponse(
            `on${type.toUpperCase()}`,
            {
              chainInfos,
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
            await cosmosCustomOpenPopup('login', '?close-on-login=true')
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

        const checkSuggestTokenChainConnections = (eventName: string) => {
          return checkConnection([payload.chainId], payload).then(({ validChainIds }) => {
            if (validChainIds.length === 0) {
              return sendResponse(eventName, { error: 'Invalid chain id' }, payload.id)
            }
            const payloadId = payload.id
            const sendMessageToInvoker = (eventName: string, payload: any) => {
              sendResponse(eventName, payload, payloadId)
            }
            return browser.storage.local
              .set({
                [REDIRECT_REQUEST]: {
                  type: 'suggest-token',
                  msg: { ...payload, type },
                },
              })
              .then(async () =>
                openPopup('add-secret-token', undefined, undefined, sendMessageToInvoker)
                  .then(() => {
                    return awaitEnableChainResponse()
                      .then(() => sendResponse(eventName, { payload: '' }, payload.id))
                      .catch(() =>
                        sendResponse(eventName, { error: 'Request rejected' }, payload.id),
                      )
                  })
                  .catch((error: any) => {
                    if (error.message.includes('Requests exceeded')) {
                      return sendResponse(eventName, { error: 'Requests exceeded' }, payload.id)
                    }
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

            const eventName = `on${type.toUpperCase()}`
            checkSuggestTokenChainConnections(eventName)
          })
        } else {
          const eventName = `on${type.toUpperCase()}`
          const address = await getWalletAddress(payload.chainId)

          await browser.storage.local.set({
            [SUGGEST_TOKEN]: { ...payload, address, type },
          })
          checkSuggestTokenChainConnections(eventName)
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
              await cosmosCustomOpenPopup('login', '?close-on-login=true')
              await awaitUIResponse('user-logged-in')
            } catch {
              sendResponse(`on${type.toUpperCase()}`, { error: 'Invalid chain id' }, payload.id)
              break
            }
          }
        }
        getSeed(passwordManager.getPassword() ?? new TextEncoder().encode('')).then(
          async (seed) => {
            const chainInfos = await getChains()
            const secretLcdUrl = getRestUrl(chainInfos, 'secret', false)
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
          },
        )
      }
    }
  }

  const aptosRequestHandler = async (data: any) => {
    const { method, ...payload } = data
    const activeChainIdStorageKey = getChainOriginStorageKey(payload.origin, 'aptos-')
    const storage = await browser.storage.local.get([
      ACTIVE_WALLET,
      ENCRYPTED_ACTIVE_WALLET,
      activeChainIdStorageKey,
    ])
    const activeChain = (storage[activeChainIdStorageKey]?.chainKey as SupportedChain) || 'movement'
    const activeNetwork = (storage[activeChainIdStorageKey]?.network as NetworkType) || 'mainnet'
    const allChains = await getSupportedChains()

    const chainInfo = allChains[activeChain]
    const chainId =
      (activeNetwork === 'testnet' ? chainInfo?.testnetChainId : chainInfo?.chainId) ?? ''
    const restUrl =
      (activeNetwork === 'testnet' ? chainInfo?.apis?.restTest : chainInfo?.apis?.rest) ?? ''
    const rpcUrl =
      (activeNetwork === 'testnet' ? chainInfo?.apis?.rpcTest : chainInfo?.apis?.rpc) ?? ''

    if (!storage[ACTIVE_WALLET] && !storage[ENCRYPTED_ACTIVE_WALLET]) {
      browser.storage.local.set({ [REDIRECT_REQUEST]: null })

      return sendResponse(
        `on${method?.toUpperCase() ?? ''}`,
        { error: 'No wallet exists' },
        payload.id,
      )
    }

    const cosmosCustomOpenPopup = async (page: Page, queryString?: string) => {
      return await customOpenPopup(page, queryString, [
        `on${method.toUpperCase()}`,
        { error: 'Requests exceeded' },
        payload.id,
      ])
    }

    const getAptosChains = async () => {
      try {
        const aptosChains: string[] = []
        Object.values(allChains).forEach((chain) => {
          if (isAptosChain(chain.chainId)) {
            aptosChains.push(chain.chainId)
          }
          if (
            !!chain.testnetChainId &&
            chain.testnetChainId !== chain.chainId &&
            isAptosChain(chain.testnetChainId)
          ) {
            aptosChains.push(chain.testnetChainId)
          }
        })
        return aptosChains
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        return []
      }
    }

    switch (method) {
      case APTOS_METHOD_TYPE.GET_NETWORK: {
        sendResponse(
          `on${method.toUpperCase()}`,
          {
            chainId,
            restUrl,
            rpcUrl,
            selectedNetwork: activeNetwork,
          },
          payload.id,
        )
        return
      }

      case APTOS_METHOD_TYPE.DISCONNECT: {
        try {
          const aptosChains = await getAptosChains()
          const response = await disconnect({ chainId: aptosChains, origin: payload.origin })
          sendResponse(`on${method.toUpperCase()}`, response, payload.id)
        } catch (error) {
          sendResponse(`on${method.toUpperCase()}`, { error: error }, payload.id)
        }
        return
      }

      case SUPPORTED_METHODS.GET_KEYS: {
        try {
          const aptosChains = await getAptosChains()
          await handleGetKey({
            message: {
              type: SUPPORTED_METHODS.GET_KEYS,
              payload: { ...payload, chainIds: aptosChains },
            },
            passwordManager,
            sendResponse,
          })
        } catch (error) {
          sendResponse(`on${method.toUpperCase()}`, { error: error }, payload.id)
        }
        return
      }

      case APTOS_METHOD_TYPE.SWITCH_NETWORK: {
        try {
          const aptosChains = await getAptosChains()
          if (!aptosChains.includes(payload.chainId)) {
            throw new Error('Chain not supported')
          }
          await browser.storage.local.set({
            [REDIRECT_REQUEST]: { method, payload },
          })
          const payloadId = payload.id
          const sendMessageToInvoker = (eventName: string, payload: any) => {
            sendResponse(eventName, payload, payloadId)
          }
          await openPopup('switch-chain', undefined, undefined, sendMessageToInvoker)
          await awaitEnableChainResponse()
          sendResponse(
            `on${method.toUpperCase()}`,
            { success: { chainId: payload.chainId } },
            payload.id,
          )
        } catch (error: any) {
          sendResponse(
            `on${method.toUpperCase()}`,
            {
              error: error,
            },
            payload.id,
          )
        }
        break
      }

      case APTOS_METHOD_TYPE.SIGN_TRANSACTION:
      case APTOS_METHOD_TYPE.SIGN_MESSAGE: {
        const { signDoc, signer, chainId, origin, signOptions, submit, signMessage } = payload

        requestSignTransaction({
          signDoc,
          signer,
          chainId,
          origin,
          signOptions,
          submit,
          isSignMessage: signMessage,
        })

        await cosmosCustomOpenPopup('signAptos')
        try {
          const response = await awaitSigningResponse(MessageTypes.signResponse)
          sendResponse(`on${method.toUpperCase()}`, response, payload.id)
        } catch (e) {
          sendResponse(`on${method.toUpperCase()}`, { error: 'Transaction declined' }, payload.id)
        }
        break
      }
    }
  }

  const evmRequestHandler = async (data: Data) => {
    const { method, ..._payload } = data
    const payload = _payload as any
    const popupWindowId = 0
    const sendResponseName = `on${method.toUpperCase()}`
    const payloadId = payload.id as unknown as number

    const activeChainIdStorageKey = getChainOriginStorageKey(payload.origin)
    const storage = await browser.storage.local.get(activeChainIdStorageKey)
    const supportedChains = await getSupportedChains()

    let activeChain = storage[activeChainIdStorageKey]?.chainKey as SupportedChain

    if (!activeChain || !Object.keys(supportedChains).includes(activeChain)) {
      if (activeChain) {
        browser.storage.local.remove(getChainOriginStorageKey(payload.origin))
      }
      activeChain = payload?.isCompass ? 'seiTestnet2' : 'ethereum'
    }

    const activeNetwork = (storage[activeChainIdStorageKey]?.network as NetworkType) || 'mainnet'

    const evmChainIdMap = getEvmChainIdMap(supportedChains, false)
    const chainInfo = supportedChains[activeChain]

    const chainId =
      (activeNetwork === 'testnet' ? chainInfo?.evmChainIdTestnet : chainInfo?.evmChainId) ?? ''

    const { nodeUrl: evmRpcFromNMS } = getTopNode('rpc', chainId) ?? {
      nodeUrl: undefined,
    }
    const fallbackEvmRpcUrl =
      (activeNetwork === 'testnet'
        ? chainInfo?.apis?.evmJsonRpcTest
        : chainInfo?.apis?.evmJsonRpc) ?? ''

    const evmRpcUrl = evmRpcFromNMS ?? fallbackEvmRpcUrl

    const evmChainId = Number(
      (activeNetwork === 'testnet' ? chainInfo?.evmChainIdTestnet : chainInfo?.evmChainId) ?? '',
    )

    const cosmosChainId =
      (activeNetwork === 'testnet' ? chainInfo?.testnetChainId : chainInfo?.chainId) ?? ''

    async function evmCustomOpenPopup(page: Page, queryString?: string) {
      return await customOpenPopup(
        page,
        queryString,
        [
          sendResponseName,
          { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, 'Requests exceeded') },
          payloadId,
        ],
        true,
      )
    }

    async function getWalletAddress(payloadId: number, skipPopup = false) {
      let store = await browser.storage.local.get([ACTIVE_WALLET])

      if (!passwordManager.getPassword()) {
        if (skipPopup) {
          return ''
        }
        try {
          const sendMessageToInvoker = (eventName: string, payload: any) => {
            sendResponse(eventName, payload, payloadId)
          }
          await openPopup('login', '?close-on-login=true', undefined, sendMessageToInvoker)
          await awaitUIResponse('user-logged-in')
          store = await browser.storage.local.get([ACTIVE_WALLET])
        } catch (e: any) {
          if (e.message.includes('Requests exceeded')) {
            sendResponse(
              sendResponseName,
              { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, 'Requests exceeded') },
              payloadId,
            )
          } else {
            sendResponse(
              sendResponseName,
              { error: getEvmError(ETHEREUM_RPC_ERROR.USER_REJECTED_REQUEST) },
              payloadId,
            )
          }

          return 'error'
        }
      }

      let pubkey = store[ACTIVE_WALLET].pubKeys?.[activeChain]
      if (!pubkey) {
        const key = await getKey(chainInfo.chainId, passwordManager)
        pubkey = key.pubKey
      }

      const evmAddress = pubKeyToEvmAddressToShow(pubkey)
      return evmAddress
    }

    switch (method) {
      case ETHEREUM_METHOD_TYPE.WALLET__REVOKE_PERMISSIONS: {
        try {
          await disconnect({ chainId: cosmosChainId, origin: payload.origin })
          sendResponse(sendResponseName, { success: null }, payloadId)
        } catch (error) {
          sendResponse(sendResponseName, { error: (error as Error).message }, payloadId)
        }

        break
      }

      case ETHEREUM_METHOD_TYPE.ETH__CHAIN_ID: {
        sendResponse(sendResponseName, { success: `0x${evmChainId.toString(16)}` }, payloadId)
        break
      }

      case ETHEREUM_METHOD_TYPE.ETH__BLOCK_NUMBER: {
        try {
          const blockNumber = await SeiEvmTx.GetBlockNumber(evmRpcUrl)
          sendResponse(sendResponseName, { success: blockNumber }, payloadId)
        } catch (error) {
          sendResponse(
            sendResponseName,
            { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, (error as Error).message) },
            payloadId,
          )
        }
        break
      }

      case ETHEREUM_METHOD_TYPE.ETH__GET_BLOCK_BY_NUMBER: {
        try {
          const result = await SeiEvmTx.GetBlockByNumber(payload.params, evmRpcUrl)
          sendResponse(sendResponseName, { success: result }, payloadId)
        } catch (error) {
          sendResponse(
            sendResponseName,
            { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, (error as Error).message) },
            payloadId,
          )
        }
        break
      }

      case ETHEREUM_METHOD_TYPE.ETH__GET_BALANCE: {
        try {
          const result = await SeiEvmTx.EthGetBalance(payload.params, evmRpcUrl)
          sendResponse(sendResponseName, { success: result }, payloadId)
        } catch (error) {
          sendResponse(
            sendResponseName,
            { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, (error as Error).message) },
            payloadId,
          )
        }
        break
      }

      case ETHEREUM_METHOD_TYPE.ETH__GET_TRANSACTION_COUNT: {
        try {
          const result = await SeiEvmTx.GetTransactionCount(payload.params, evmRpcUrl)
          sendResponse(sendResponseName, { success: result }, payloadId)
        } catch (error) {
          sendResponse(
            sendResponseName,
            { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, (error as Error).message) },
            payloadId,
          )
        }
        break
      }

      case ETHEREUM_METHOD_TYPE.ETH__GET_TRANSACTION_RECEIPT:
      case ETHEREUM_METHOD_TYPE.ETH__GET_TRANSACTION_BY_HASH: {
        const transactionHash = payload.params[0]

        if (transactionHash) {
          try {
            if (method === ETHEREUM_METHOD_TYPE.ETH__GET_TRANSACTION_RECEIPT) {
              const transactionReceipt = await SeiEvmTx.GetTransactionReceipt(
                transactionHash,
                evmRpcUrl,
              )

              sendResponse(sendResponseName, { success: transactionReceipt }, payloadId)
            } else {
              const transactionByHash = await SeiEvmTx.GetTransactionByHash(
                transactionHash,
                evmRpcUrl,
              )
              sendResponse(sendResponseName, { success: transactionByHash }, payloadId)
            }
          } catch (error) {
            sendResponse(
              sendResponseName,
              { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, (error as Error).message) },
              payloadId,
            )
          }
        } else {
          sendResponse(
            sendResponseName,
            {
              error: getEvmError(ETHEREUM_RPC_ERROR.INVALID_PARAMS, 'Transaction hash is required'),
            },
            payloadId,
          )
        }

        break
      }

      case ETHEREUM_METHOD_TYPE.ETH__CALL: {
        try {
          const result = await SeiEvmTx.ExecuteEthCall(payload.params, evmRpcUrl)
          sendResponse(sendResponseName, { success: result }, payloadId)
        } catch (error) {
          sendResponse(
            sendResponseName,
            { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, (error as Error).message) },
            payloadId,
          )
        }

        break
      }

      case ETHEREUM_METHOD_TYPE.ETH__ESTIMATE_GAS: {
        try {
          const result = await SeiEvmTx.ExecuteEthEstimateGas(payload.params, evmRpcUrl)
          sendResponse(sendResponseName, { success: result }, payloadId)
        } catch (error) {
          sendResponse(
            sendResponseName,
            { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, (error as Error).message) },
            payloadId,
          )
        }

        break
      }

      case ETHEREUM_METHOD_TYPE.ETH__GAS_PRICE: {
        try {
          const result = await SeiEvmTx.EthGasPrice(evmRpcUrl)
          sendResponse(sendResponseName, { success: result }, payloadId)
        } catch (error) {
          sendResponse(
            sendResponseName,
            { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, (error as Error).message) },
            payloadId,
          )
        }

        break
      }

      case ETHEREUM_METHOD_TYPE.ETH__GET_CODE: {
        try {
          const result = await SeiEvmTx.GetCode(payload.params, evmRpcUrl)
          sendResponse(sendResponseName, { success: result }, payloadId)
        } catch (error) {
          sendResponse(
            sendResponseName,
            { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, (error as Error).message) },
            payloadId,
          )
        }

        break
      }

      case ETHEREUM_METHOD_TYPE.WALLET__WATCH_ASSET: {
        const seiEvmAddress = await getWalletAddress(payloadId)
        if (seiEvmAddress === 'error') {
          break
        }

        const tokenType = payload.params.type
        if (tokenType !== 'ERC20') {
          sendResponse(
            sendResponseName,
            {
              error: getEvmError(
                ETHEREUM_RPC_ERROR.INVALID_PARAMS,
                `${payload.isLeap ? 'Leap' : 'Compass'} only supports ERC-20 asset type today.`,
              ),
            },
            payloadId,
          )

          break
        }

        const options = payload.params.options
        if (!options.address || !options.symbol || options.decimals === undefined) {
          sendResponse(
            sendResponseName,
            {
              error: getEvmError(
                ETHEREUM_RPC_ERROR.INVALID_PARAMS,
                'Must specify address, symbol, and decimals.',
              ),
            },
            payloadId,
          )

          break
        } else if (typeof options.symbol !== 'string' || options.symbol.length > 11) {
          sendResponse(
            sendResponseName,
            {
              error: getEvmError(
                ETHEREUM_RPC_ERROR.INVALID_PARAMS,
                `Invalid symbol '${options.symbol}': must be a string not longer than 11 characters.`,
              ),
            },
            payloadId,
          )

          break
        } else if (
          typeof options.decimals !== 'number' ||
          options.decimals < 0 ||
          options.decimals > 36
        ) {
          sendResponse(
            sendResponseName,
            {
              error: getEvmError(
                ETHEREUM_RPC_ERROR.INVALID_PARAMS,
                `Invalid decimals '${options.decimals}': must be an integer between 0 and 36.`,
              ),
            },
            payloadId,
          )

          break
        } else {
          const balance = await fetchERC20Balances(evmRpcUrl, seiEvmAddress, [options.address])
          if (balance.length === 0) {
            sendResponse(
              sendResponseName,
              {
                error: getEvmError(
                  ETHEREUM_RPC_ERROR.INVALID_PARAMS,
                  `Invalid address '${options.address}'`,
                ),
              },
              payloadId,
            )

            break
          }
        }

        await browser.storage.local.set({
          [SUGGEST_TOKEN]: { ...payload, activeChain },
        })
        await evmCustomOpenPopup('suggest-erc-20')

        try {
          await awaitEnableChainResponse()
          sendResponse(sendResponseName, { success: true }, payloadId)
        } catch (e) {
          sendResponse(sendResponseName, { success: false }, payloadId)
        }

        break
      }

      case ETHEREUM_METHOD_TYPE.ETH__SIGN:
      case ETHEREUM_METHOD_TYPE.PERSONAL_SIGN:
      case ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4: {
        const seiEvmAddress = await getWalletAddress(payloadId)
        if (seiEvmAddress === 'error') {
          break
        }

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

            if (typeof data === 'string') {
              try {
                data = JSON.parse(data)
              } catch {
                //
              }
            }

            if (
              seiEvmAddress.toLowerCase() !== payloadAddress.toLowerCase() ||
              !data ||
              (method !== ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4 && !data?.startsWith('0x'))
            ) {
              sendResponse(
                sendResponseName,
                { error: getEvmError(ETHEREUM_RPC_ERROR.INVALID_PARAMS) },
                payloadId,
              )

              break
            }

            if (
              method === ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4 &&
              !evmChainIdMap[Number(data.domain.chainId).toString()]
            ) {
              sendResponse(
                sendResponseName,
                {
                  error: getEvmError(ETHEREUM_RPC_ERROR.INVALID_PARAMS, 'Invalid chainId.'),
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
              payloadId,
            })

            await evmCustomOpenPopup('signSeiEvm', `?origin=${payload.origin}`)

            try {
              const response = await awaitSigningResponse(
                MessageTypes.signSeiEvmResponse,
                payloadId,
              )
              sendResponse(sendResponseName, { success: response }, payloadId)
            } catch (e) {
              sendResponse(
                sendResponseName,
                { error: getEvmError(ETHEREUM_RPC_ERROR.USER_REJECTED_REQUEST) },
                payloadId,
              )
            }
          }
        } else {
          sendResponse(
            sendResponseName,
            { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, seiEvmAddress) },
            payloadId,
          )
        }

        break
      }

      case ETHEREUM_METHOD_TYPE.ETH__SEND_TRANSACTION: {
        const seiEvmAddress = await getWalletAddress(payloadId)
        if (seiEvmAddress === 'error') {
          break
        }

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
            // @ts-ignore
            const gas = payload.params[0].gas

            signTxnData = {
              params: payload.params,
              value: value ? formatEtherValue(value) : '0',
              to,
              data,
              gas,
              details: {
                Value: value ? `${formatEtherValue(value)} ${chainInfo?.denom ?? ''}` : '0',
                'Contract Interaction': to,
                'HEX Data': data,
              },
            }
          } else {
            const value = parsedData.value.toString()
            // @ts-ignore
            const to = payload.params[0].to
            // @ts-ignore
            const data = payload.params[0].data
            // @ts-ignore
            const gas = payload.params[0].gas

            switch (parsedData.name) {
              case 'approve': {
                signTxnData = {
                  value,
                  to,
                  data,
                  gas,
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

              case 'safeTransferFrom': {
                signTxnData = {
                  value,
                  to,
                  data,
                  gas,
                  details: {
                    To: parsedData.args[1],
                    Data: {
                      Function: 'Safe Transfer From',
                      HEX: data,
                    },
                  },
                }

                break
              }

              default: {
                signTxnData = {
                  value,
                  to,
                  data,
                  gas,
                  details: {
                    Data: {
                      Function: parsedData.name,
                      HEX: data,
                    },
                  },
                }
              }
            }
          }

          requestSignTransaction({
            origin: payload.origin,
            ecosystem: payload.ecosystem,
            signTxnData,
            payloadId,
          })

          await evmCustomOpenPopup('signSeiEvm', `?origin=${payload.origin}`)

          try {
            const response = await awaitSigningResponse(MessageTypes.signSeiEvmResponse, payloadId)
            sendResponse(sendResponseName, { success: response }, payloadId)
          } catch (e) {
            sendResponse(
              sendResponseName,
              { error: getEvmError(ETHEREUM_RPC_ERROR.USER_REJECTED_REQUEST) },
              payloadId,
            )
          }
        }

        break
      }

      case ETHEREUM_METHOD_TYPE.ETH__ACCOUNTS:
      case ETHEREUM_METHOD_TYPE.WALLET__REQUEST_PERMISSIONS:
      case ETHEREUM_METHOD_TYPE.ETH__REQUEST_ACCOUNTS: {
        if (
          method === ETHEREUM_METHOD_TYPE.WALLET__REQUEST_PERMISSIONS &&
          // @ts-ignore
          !Object.keys(payload.params?.[0] ?? {}).includes(ETHEREUM_METHOD_TYPE.ETH__ACCOUNTS)
        ) {
          const errorMessage = !payload?.params
            ? `Parameters required for ${method} method.`
            : 'Invalid method parameter(s).'
          sendResponse(
            sendResponseName,
            { error: getEvmError(ETHEREUM_RPC_ERROR.INVALID_PARAMS, errorMessage) },
            payloadId,
          )
          break
        }

        const msg = payload
        const chainIds: string[] = [cosmosChainId]

        const queryString = `?origin=${msg?.origin}`

        checkConnection(chainIds, msg)
          .then(async ({ validChainIds, isNewChainPresent }) => {
            if (validChainIds.length > 0) {
              if (isNewChainPresent) {
                if (method === ETHEREUM_METHOD_TYPE.ETH__ACCOUNTS) {
                  sendResponse(sendResponseName, { success: [] }, payloadId)
                } else {
                  let seiEvmAddress = await getWalletAddress(payloadId, true)
                  if (seiEvmAddress === 'error') {
                    throw new Error('Unable to get wallet address')
                  }

                  await browser.storage.local.set({
                    [REDIRECT_REQUEST]: { type: method, msg: { ...msg, validChainIds } },
                  })

                  const shouldOpenPopup =
                    Object.keys(enableAccessRequests).length === 0 ||
                    !Object.keys(enableAccessRequests).some((key) => key.includes(msg.origin))

                  if (shouldOpenPopup) {
                    enableAccessRequests.delete(queryString)
                    enableAccessRequests.set(queryString, popupWindowId)

                    await evmCustomOpenPopup('approveConnection', queryString)

                    requestEnableAccess({
                      origin: msg.origin,
                      validChainIds,
                      payloadId: payloadId as unknown as string,
                      ecosystem: LINE_TYPE.ETHEREUM,
                      ethMethod: method,
                      isLeap: payload.isLeap,
                    })
                  } else {
                    if (!enableAccessRequests.has(queryString)) {
                      requestEnableAccess({
                        origin: msg.origin,
                        validChainIds,
                        payloadId: payloadId as unknown as string,
                        ecosystem: LINE_TYPE.ETHEREUM,
                        ethMethod: method,
                      })
                      enableAccessRequests.set(queryString, popupWindowId)
                    }
                  }

                  if (seiEvmAddress === '') {
                    seiEvmAddress = await getWalletAddress(payloadId, true)
                  }

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

                  try {
                    await awaitEnableChainResponse()

                    if (seiEvmAddress.startsWith('0x')) {
                      sendResponse(sendResponseName, { success: successResponse }, payloadId)
                    } else {
                      sendResponse(
                        sendResponseName,
                        { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, seiEvmAddress) },
                        payloadId,
                      )
                    }
                    enableAccessRequests.delete(queryString)
                  } catch (error: any) {
                    sendResponse(
                      sendResponseName,
                      { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, error.error) },
                      payloadId,
                    )
                    enableAccessRequests.delete(queryString)
                  }
                }
              } else {
                // When wallet is in locked state, on visiting any EVM dApp the pop-up comes up,
                // to avoid that copy the same code at two place
                if (
                  !passwordManager.getPassword() &&
                  method === ETHEREUM_METHOD_TYPE.ETH__ACCOUNTS
                ) {
                  sendResponse(sendResponseName, { success: [] }, payloadId)
                } else {
                  const seiEvmAddress = await getWalletAddress(payloadId)
                  if (seiEvmAddress === 'error') {
                    throw new Error('Unable to get wallet address')
                  }

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

                  if (seiEvmAddress.startsWith('0x')) {
                    sendResponse(sendResponseName, { success: successResponse }, payloadId)
                  } else {
                    sendResponse(
                      sendResponseName,
                      { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, seiEvmAddress) },
                      payloadId,
                    )
                  }
                  enableAccessRequests.delete(queryString)
                }
              }
            } else {
              sendResponse(
                sendResponseName,
                { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, 'Invalid chain id') },
                payloadId,
              )
              enableAccessRequests.delete(queryString)
            }
          })
          .catch(() => {
            sendResponse(
              sendResponseName,
              { error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, 'Invalid chain id') },
              payloadId,
            )
            enableAccessRequests.delete(queryString)
          })

        break
      }

      case ETHEREUM_METHOD_TYPE.WALLET__SWITCH_ETHEREUM_CHAIN: {
        if (!payload.params) {
          sendResponse(
            sendResponseName,
            {
              error: getEvmError(
                ETHEREUM_RPC_ERROR.INVALID_PARAMS,
                `Params are required for ${method} method.`,
              ),
            },
            payloadId,
          )

          break
        }

        const { chainId } = payload.params[0]
        if (!chainId) {
          sendResponse(
            sendResponseName,
            {
              error: getEvmError(
                ETHEREUM_RPC_ERROR.INVALID_PARAMS,
                `Chain id is missing in params.`,
              ),
            },
            payloadId,
          )

          break
        }

        const requestedActiveChain = evmChainIdMap[Number(chainId).toString()]
        if (!requestedActiveChain) {
          sendResponse(
            sendResponseName,
            {
              error: getEvmError(
                ETHEREUM_RPC_ERROR.UNRECOGNIZED_CHAIN_ID,
                `Unrecognized chain id: ${Number(chainId)}`,
              ),
            },
            payloadId,
          )

          break
        }

        const seiEvmAddress = await getWalletAddress(payloadId)
        if (seiEvmAddress === 'error') {
          sendResponse(
            sendResponseName,
            {
              error: getEvmError(ETHEREUM_RPC_ERROR.INTERNAL, 'Unable to get wallet address'),
            },
            payloadId,
          )

          break
        }

        const chain = supportedChains[requestedActiveChain.key as SupportedChain]
        if (!chain) {
          sendResponse(
            sendResponseName,
            {
              error: getEvmError(
                ETHEREUM_RPC_ERROR.UNRECOGNIZED_CHAIN_ID,
                `Unrecognized chain id: ${Number(chainId)}`,
              ),
            },
            payloadId,
          )

          break
        }

        const setNetworkTo = requestedActiveChain.isTestnet ? 'testnet' : 'mainnet'

        await browser.storage.local.set({
          [activeChainIdStorageKey]: {
            chainKey: requestedActiveChain.key,
            network: setNetworkTo,
          },
        })

        const requestedChainId =
          (setNetworkTo === 'testnet' ? chain?.testnetChainId : chain?.chainId) ?? ''

        const storage = await browser.storage.local.get(ACTIVE_WALLET)
        const activeWallet = storage[ACTIVE_WALLET]

        await addToConnections([requestedChainId], [activeWallet.id], payload.origin)
        await browser.storage.local.set({
          [BG_RESPONSE]: { data: 'Approved' },
        })

        setTimeout(() => browser.storage.local.remove(BG_RESPONSE), 50)
        sendResponse(sendResponseName, { success: { chainId } }, payloadId)

        break
      }

      case ETHEREUM_METHOD_TYPE.WALLET__ADD_ETHEREUM_CHAIN: {
        if (payload.isLeap) {
          if (payload.params && payload.params.length > 0) {
            const result = await addLeapEthereumChain(payload, evmChainIdMap, evmCustomOpenPopup)
            await switchEthereumChain(
              result?.success?.chainId,
              payload.origin,
              activeChainIdStorageKey,
            )
            sendResponse(sendResponseName, result, payloadId)
          } else {
            sendResponse(
              sendResponseName,
              {
                error: getEvmError(
                  ETHEREUM_RPC_ERROR.INVALID_PARAMS,
                  `Params are required for ${method} method.`,
                ),
              },
              payloadId,
            )
          }

          break
        }
      }

      // eslint-disable-next-line no-fallthrough
      default: {
        sendResponse(
          sendResponseName,
          {
            error: getEvmError(
              ETHEREUM_RPC_ERROR.INTERNAL,
              `${
                payload.isLeap ? 'Leap' : 'Compass'
              } does not support '${method}' method as of now.`,
            ),
          },
          payloadId,
        )
      }
    }
  }

  portStream.on('data', async (data: any) => {
    updateNodeUrls()
    if ([data?.type, data?.method].includes(SUPPORTED_METHODS.OPEN_SIDE_PANEL)) {
      await chrome.sidePanel.open({ windowId: data?.payload?.windowId })
      sendResponse(`on${data?.type?.toUpperCase()}`, {}, data?.payload?.id)
      return
    }

    switch (data?.ecosystem) {
      case LINE_TYPE.ETHEREUM: {
        await evmRequestHandler(data)
        break
      }
      case LINE_TYPE.APTOS: {
        await aptosRequestHandler(data)
        break
      }
      case LINE_TYPE.BITCOIN: {
        await bitcoinRequestHandler(passwordManager, sendResponse, enableAccessRequests, data)
        break
      }
      case LINE_TYPE.SOLANA: {
        await solanaRequestHandler(
          data,
          sendResponse,
          customOpenPopup,
          passwordManager,
          enableAccessRequests,
        )
        break
      }
      case LINE_TYPE.SUI: {
        await suiRequestHandler(data, sendResponse, customOpenPopup, passwordManager)
        break
      }
      default: {
        await requestHandler(data)
      }
    }
  })
}

browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'capture-light-node-stats') {
    lightNode.updateRunningTimeForLightNode()
  }
})

browser.runtime.onConnect.addListener(connectRemote)

browser.runtime.onInstalled.addListener((details) => {
  browser.storage.local
    .get([
      KEYSTORE,
      ACTIVE_WALLET,
      ENCRYPTED_ACTIVE_WALLET,
      AUTO_LOCK_TIME,
      IS_LIGHT_NODE_RUNNING,
      'encrypted',
      'timestamp',
    ])
    .then(async (storage) => {
      const activeWallet = storage[ACTIVE_WALLET]
      const encryptedActiveWallet = storage[ENCRYPTED_ACTIVE_WALLET]
      const isLightNodeRunning = storage[IS_LIGHT_NODE_RUNNING]

      if (!activeWallet && !encryptedActiveWallet) {
        browser.tabs.create({
          url: browser.runtime.getURL('index.html'),
          active: true,
        })
        await browser.storage.local.set({
          [V80_KEYSTORE_MIGRATION_COMPLETE]: true,
          [V118_KEYSTORE_MIGRATION_COMPLETE]: true,
          [V125_BETA_NFT_COLLECTIONS_MIGRATION_COMPLETE]: true,
          [V151_NFT_SEPARATOR_CHANGE_MIGRATION_COMPLETE]: true,
        })
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
        if (prevVersionInt < 161) {
          // reset light running stats for all users on update
          browser.storage.local.get([LIGHT_NODE_RUNNING_STATS]).then((storage) => {
            const lightNodeRunningStats = storage[LIGHT_NODE_RUNNING_STATS]
            if (lightNodeRunningStats) {
              const { startTimestamp: lastStartedAt } = JSON.parse(lightNodeRunningStats)
              browser.storage.local.set({
                [LIGHT_NODE_RUNNING_STATS]: JSON.stringify({
                  startTimestamp: lastStartedAt,
                  totalRunningTimeInMilliSeconds: 0,
                }),
              })
            }
          })
        }
      }
      if (isLightNodeRunning) {
        lightNode.startLightNodeBackground()
        lightNode.updateRunningTimeForLightNode()
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
    await browser.action.setPopup({ popup: 'index.html#/home' })
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
