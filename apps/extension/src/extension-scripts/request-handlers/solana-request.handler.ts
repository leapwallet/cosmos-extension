import { SUPPORTED_METHODS } from '@leapwallet/cosmos-wallet-provider/dist/provider/messaging/requester'
import { LINE_TYPE } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import { SOLANA_METHOD_TYPE } from '@leapwallet/cosmos-wallet-provider/src/provider/types/solana'
import { isSolanaChain } from '@leapwallet/cosmos-wallet-sdk'
import { MessageTypes } from 'config/message-types'
import { ACTIVE_WALLET, ENCRYPTED_ACTIVE_WALLET, REDIRECT_REQUEST } from 'config/storage-keys'
import { PasswordManager } from 'extension-scripts/password-manager'
import {
  awaitApproveChainResponse,
  awaitEnableChainResponse,
  awaitSigningResponse,
  getChainOriginStorageKey,
  getSupportedChains,
  openPopup,
  Page,
  requestEnableAccess,
  requestSignTransaction,
} from 'extension-scripts/utils'
import { disconnect } from 'extension-scripts/utils'
import browser from 'webextension-polyfill'

import { handleGetKey } from './getKey.handler'

type OpenPopupFunction = (
  page: Page,
  queryString?: string,
  response?: [string, any, number],
) => Promise<void>

type SendResponseFunction = (name: string, payload: any, id: number) => void

export const solanaRequestHandler = async (
  data: any,
  sendResponse: SendResponseFunction,
  customOpenPopup: OpenPopupFunction,
  passwordManager: PasswordManager,
  enableAccessRequests: Map<string, number>,
) => {
  const { method, ...payload } = data
  const popupWindowId = 0
  const activeChainIdStorageKey = getChainOriginStorageKey(payload.origin)
  const storage = await browser.storage.local.get([
    ACTIVE_WALLET,
    ENCRYPTED_ACTIVE_WALLET,
    activeChainIdStorageKey,
  ])
  const allChains = await getSupportedChains()

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

  const getSolanaChains = () => {
    try {
      const solanaChains: string[] = []
      Object.values(allChains).forEach((chain) => {
        if (isSolanaChain(chain.chainId)) {
          solanaChains.push(chain.chainId)
        }
        if (
          !!chain.testnetChainId &&
          chain.testnetChainId !== chain.chainId &&
          isSolanaChain(chain.testnetChainId)
        ) {
          solanaChains.push(chain.testnetChainId)
        }
      })
      return solanaChains
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      return []
    }
  }

  switch (method) {
    case SOLANA_METHOD_TYPE.CONNECT: {
      const storage = await browser.storage.local.get([ACTIVE_WALLET, ENCRYPTED_ACTIVE_WALLET])

      if (!storage[ACTIVE_WALLET] && !storage[ENCRYPTED_ACTIVE_WALLET]) {
        browser.storage.local.set({ [REDIRECT_REQUEST]: null })
        return sendResponse(
          `on${method?.toUpperCase() ?? ''}`,
          { error: 'No wallet exists' },
          payload.id,
        )
      }

      try {
        const { silent } = payload

        if (!silent) {
          try {
            const queryString = `?origin=${payload.origin}`
            // chainIds?.forEach((chainId: string) => {
            //   queryString += `&chainIds=${chainId}`
            // })

            const shouldOpenPopup =
              Object.keys(enableAccessRequests).length === 0 ||
              !Object.keys(enableAccessRequests).some((key) => key.includes(payload.origin))

            if (shouldOpenPopup) {
              enableAccessRequests.delete(queryString)
              enableAccessRequests.set(queryString, popupWindowId)

              await cosmosCustomOpenPopup('approveConnection', queryString)

              requestEnableAccess({
                origin: payload.origin,
                validChainIds: ['101', '103'],
                payloadId: payload.id,
                ecosystem: LINE_TYPE.SOLANA,
              })
            } else {
              if (!enableAccessRequests.has(queryString)) {
                requestEnableAccess({
                  origin: payload.origin,
                  validChainIds: ['101', '103'],
                  payloadId: payload.id,
                  ecosystem: LINE_TYPE.SOLANA,
                })
                enableAccessRequests.set(queryString, popupWindowId)
              }
            }

            const response = (await awaitApproveChainResponse(payload.id)) as
              | { status?: string; payloadId?: string }
              | 'popup-closed'

            if (
              response === 'popup-closed' ||
              (typeof response === 'object' && response.status !== 'success')
            ) {
              sendResponse(
                `on${method?.toUpperCase() ?? ''}`,
                { error: 'Connection rejected by user' },
                payload.id,
              )
              return
            }
          } catch (e) {
            sendResponse(
              `on${method?.toUpperCase() ?? ''}`,
              { error: 'Connection rejected by user' },
              payload.id,
            )
            return
          }
        }

        await handleGetKey({
          message: {
            type: SUPPORTED_METHODS.GET_KEYS,
            payload: { ...payload, chainIds: ['101'] },
          },
          passwordManager,
          sendResponse,
        })
      } catch (error) {
        sendResponse(
          `on${method?.toUpperCase() ?? ''}`,
          { error: error instanceof Error ? error.message : 'Connection failed' },
          payload.id,
        )
      }
      return
    }

    case SOLANA_METHOD_TYPE.DISCONNECT: {
      try {
        const solanaChains = getSolanaChains()
        const response = await disconnect({ chainId: solanaChains, origin: payload.origin })
        sendResponse(`on${method.toUpperCase()}`, response, payload.id)
      } catch (error) {
        sendResponse(`on${method.toUpperCase()}`, { error: error }, payload.id)
      }
      return
    }

    case SOLANA_METHOD_TYPE.SIGN_TRANSACTION:
    case SOLANA_METHOD_TYPE.SIGN_AND_SEND_TRANSACTION: {
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

      await customOpenPopup('signSolana')
      try {
        const response = await awaitSigningResponse(MessageTypes.signResponse)
        sendResponse(`on${method?.toUpperCase() ?? ''}`, response, payload.id)
      } catch (e) {
        sendResponse(
          `on${method?.toUpperCase() ?? ''}`,
          { error: 'Transaction declined' },
          payload.id,
        )
      }
      break
    }
    case SOLANA_METHOD_TYPE.CHANGE_NETWORK: {
      try {
        const solanaChains = getSolanaChains()
        if (!solanaChains.includes(payload.network)) {
          throw new Error('Chain not supported')
        }
        await browser.storage.local.set({
          [REDIRECT_REQUEST]: { method, payload },
        })
        const payloadId = payload.id
        const sendMessageToInvoker = (eventName: string, payload: any) => {
          sendResponse(eventName, payload, payloadId)
        }
        await openPopup('switch-solana-chain', undefined, undefined, sendMessageToInvoker)
        await awaitEnableChainResponse()
        sendResponse(
          `on${method.toUpperCase()}`,
          { success: { chainId: payload.network } },
          payload.id,
        )
      } catch (error: any) {
        sendResponse(
          `on${method.toUpperCase()}`,
          {
            error: error.message || 'Failed to switch network',
          },
          payload.id,
        )
      }
      break
    }
  }
}
