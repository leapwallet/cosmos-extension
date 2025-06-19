/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BITCOIN_METHOD_TYPE,
  Network,
} from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import { formatEtherUnits, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { isBitcoinChain } from '@leapwallet/cosmos-wallet-store/dist/utils'
import { base64, hex } from '@scure/base'
import { MessageTypes } from 'config/message-types'
import { ACTIVE_CHAIN, ACTIVE_WALLET, REDIRECT_REQUEST } from 'config/storage-keys'
import { PasswordManager } from 'extension-scripts/password-manager'
import {
  awaitApproveChainResponse,
  awaitEnableChainResponse,
  awaitSigningResponse,
  awaitUIResponse,
  checkConnection,
  customOpenPopup,
  getSupportedChains,
  openPopup,
  requestEnableAccess,
  requestSignTransaction,
} from 'extension-scripts/utils'
import browser from 'webextension-polyfill'

import { getKey } from './getKey.handler'
import { RequestData } from './request-handler.types'

export const bitcoinRequestHandler = async (
  passwordManager: PasswordManager,
  sendResponse: any,
  enableAccessRequests: Map<string, number>,
  data: RequestData,
) => {
  const { method, ..._payload } = data
  const popupWindowId = 0
  const payload = _payload as any
  const sendResponseName = `on${method.toUpperCase()}`
  const payloadId = payload.id as unknown as number
  const store = await browser.storage.local.get([ACTIVE_CHAIN])
  const activeChain = store[ACTIVE_CHAIN]
  const bitcoinActiveChain = isBitcoinChain(activeChain) ? activeChain : 'bitcoin'
  const supportedChains = await getSupportedChains()
  const chainInfo = supportedChains[bitcoinActiveChain as SupportedChain]

  const sendMessageToInvoker = (eventName: string, payload: any) => {
    sendResponse(eventName, payload, payloadId)
  }

  async function getWalletInfo(payloadId: number) {
    let store = await browser.storage.local.get([ACTIVE_WALLET])

    if (!passwordManager.getPassword()) {
      try {
        await openPopup('login', '?close-on-login=true', undefined, sendMessageToInvoker)
        await awaitUIResponse('user-logged-in')
        store = await browser.storage.local.get([ACTIVE_WALLET])
      } catch (e: any) {
        sendResponse(sendResponseName, { error: 'User Rejected Request' }, payloadId)
        return 'error'
      }
    }

    let address = store[ACTIVE_WALLET].addresses?.[bitcoinActiveChain]
    const pubkeyBytes = base64.decode(store[ACTIVE_WALLET].pubKeys?.[bitcoinActiveChain])

    let pubkey = hex.encode(pubkeyBytes)

    if (!pubkey) {
      const key = await getKey(chainInfo.chainId, passwordManager)
      if (!key.pubKey) {
        sendResponse(sendResponseName, { error: 'Unable to get account' }, payloadId)
        return 'error'
      }
      pubkey = hex.encode(key.pubKey)
      address = key.bech32Address
    }

    return {
      address,
      pubkeyHex: pubkey,
    }
  }

  switch (method) {
    case BITCOIN_METHOD_TYPE.GET_NETWORK: {
      if (bitcoinActiveChain === 'bitcoin') {
        sendResponse(sendResponseName, { success: Network.MAINNET }, payloadId)
      } else if (bitcoinActiveChain === 'bitcoinSignet') {
        sendResponse(sendResponseName, { success: Network.SIGNET }, payloadId)
      } else {
        sendResponse(sendResponseName, { error: 'No Network' }, payloadId)
      }

      break
    }

    case BITCOIN_METHOD_TYPE.CONNECT_WALLET: {
      const account = await getWalletInfo(payloadId)
      if (account === 'error') {
        throw new Error('Unable to Get Wallet Info')
      }

      sendResponse(sendResponseName, { success: [account.address] }, payloadId)
      break
    }

    case BITCOIN_METHOD_TYPE.GET_ADDRESS: {
      const account = await getWalletInfo(payloadId)
      if (account === 'error') {
        throw new Error('Unable to Get Wallet Info')
      }

      sendResponse(sendResponseName, { success: account.address }, payloadId)
      break
    }

    case BITCOIN_METHOD_TYPE.GET_ACCOUNTS: {
      const account = await getWalletInfo(payloadId)
      if (account === 'error') {
        throw new Error('Unable to Get Wallet Info')
      }

      sendResponse(sendResponseName, { success: [account.address] }, payloadId)
      break
    }

    case BITCOIN_METHOD_TYPE.GET_PUBLIC_KEY: {
      const account = await getWalletInfo(payloadId)
      if (account === 'error') {
        throw new Error('Unable to Get Wallet Info')
      }

      sendResponse(sendResponseName, { success: account.pubkeyHex }, payloadId)
      break
    }

    case BITCOIN_METHOD_TYPE.REQUEST_ACCOUNTS: {
      const chainIds: string[] = [
        supportedChains['bitcoin']?.chainId,
        supportedChains['bitcoinSignet']?.chainId,
      ]
      const queryString = `?origin=${payload?.origin}`

      checkConnection(chainIds, payload)
        .then(async ({ validChainIds, isNewChainPresent }) => {
          if (validChainIds.length > 0) {
            if (isNewChainPresent) {
              const account = await getWalletInfo(payloadId)
              if (account === 'error') {
                throw new Error('Unable to Get Wallet Info')
              }

              await browser.storage.local.set({
                [REDIRECT_REQUEST]: { type: method, msg: { ...payload, validChainIds } },
              })

              const shouldOpenPopup =
                Object.keys(enableAccessRequests).length === 0 ||
                !Object.keys(enableAccessRequests).some((key) => key.includes(payload.origin))

              if (shouldOpenPopup) {
                enableAccessRequests.delete(queryString)
                enableAccessRequests.set(queryString, popupWindowId)

                await customOpenPopup('approveConnection', sendResponse, queryString)

                requestEnableAccess({
                  origin: payload.origin,
                  validChainIds,
                  payloadId: payloadId as unknown as string,
                })
              } else {
                if (!enableAccessRequests.has(queryString)) {
                  requestEnableAccess({
                    origin: payload.origin,
                    validChainIds,
                    payloadId: payloadId as unknown as string,
                  })
                  enableAccessRequests.set(queryString, popupWindowId)
                }
              }

              try {
                await awaitApproveChainResponse(payloadId.toString())
                sendResponse(sendResponseName, { success: [account.address] }, payloadId)
              } catch (error: any) {
                sendResponse(sendResponseName, { error: 'Internal Server Error' }, payloadId)
              }
            } else {
              const account = await getWalletInfo(payloadId)
              if (account === 'error') {
                throw new Error('Unable to Get Wallet Info')
              }

              sendResponse(sendResponseName, { success: [account.address] }, payloadId)
              enableAccessRequests.delete(queryString)
            }
          } else {
            sendResponse(sendResponseName, { error: 'Invalid Account Network' }, payloadId)
            enableAccessRequests.delete(queryString)
          }
        })
        .catch(() => {
          sendResponse(sendResponseName, { error: 'Invalid Account Network' }, payloadId)
          enableAccessRequests.delete(queryString)
        })

      break
    }

    case BITCOIN_METHOD_TYPE.SEND_BITCOIN:
    case BITCOIN_METHOD_TYPE.SIGN_MESSAGE:
    case BITCOIN_METHOD_TYPE.SIGN_PSBT:
    case BITCOIN_METHOD_TYPE.SIGN_PSBTS: {
      let signTxnData: any = {
        methodType: method,
      }

      if (method === BITCOIN_METHOD_TYPE.SEND_BITCOIN) {
        const { to, amount } = payload
        signTxnData = {
          ...signTxnData,
          to,
          amount,
          details: {
            to,
            amount: `${formatEtherUnits(amount, 8)} ${chainInfo?.denom}`,
          },
        }
      } else if (method === BITCOIN_METHOD_TYPE.SIGN_PSBT) {
        const { psbtHex, options } = payload
        signTxnData = {
          ...signTxnData,
          psbtHex,
          options,
        }
      } else if (method === BITCOIN_METHOD_TYPE.SIGN_PSBTS) {
        const { psbtsHexes, options } = payload
        signTxnData = {
          ...signTxnData,
          psbtsHexes,
          options,
        }
      } else if (method === BITCOIN_METHOD_TYPE.SIGN_MESSAGE) {
        const { message, type } = payload
        signTxnData = {
          ...signTxnData,
          message,
          type,
        }
      }

      requestSignTransaction({
        origin: payload.origin,
        ecosystem: payload.ecosystem,
        signTxnData,
        payloadId,
      })

      await customOpenPopup('signBitcoin', sendResponse)

      try {
        const response = await awaitSigningResponse(MessageTypes.signBitcoinResponse, payloadId)
        sendResponse(sendResponseName, { success: response }, payloadId)
      } catch (e) {
        sendResponse(sendResponseName, { error: 'User Rejected Request' }, payloadId)
      }

      break
    }

    case BITCOIN_METHOD_TYPE.SWITCH_NETWORK: {
      let network = payload.network
      let switchToChain = ''

      if (network === Network.MAINNET) {
        switchToChain = 'bitcoin'
      } else if (network === Network.SIGNET) {
        network = 'mainnet'
        switchToChain = 'bitcoinSignet'
      } else {
        sendResponse(sendResponseName, { error: 'Unsupported Network' }, payloadId)
      }

      if (switchToChain) {
        if (activeChain === switchToChain) {
          sendResponse(sendResponseName, { success: 'Already Active Network' }, payloadId)
        } else {
          await browser.storage.local.set({
            [REDIRECT_REQUEST]: {
              type: method,
              msg: {
                requestedActiveChain: switchToChain,
                setNetworkTo: network,
                origin: payload.origin,
              },
            },
          })

          await customOpenPopup('switch-ethereum-chain', sendResponse)

          try {
            await awaitEnableChainResponse()
            sendResponse(sendResponseName, { success: 'Switched Network' }, payloadId)
          } catch (e) {
            sendResponse(sendResponseName, { error: 'User Rejected Request' }, payloadId)
          }
        }
      }

      break
    }
  }
}
