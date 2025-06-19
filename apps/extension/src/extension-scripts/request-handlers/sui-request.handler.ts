import { SUPPORTED_METHODS } from '@leapwallet/cosmos-wallet-provider/dist/provider/messaging/requester'
import { LINE_TYPE } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import { SUI_FEATURE } from '@leapwallet/cosmos-wallet-provider/dist/provider/types/sui'
import { isSuiChain } from '@leapwallet/cosmos-wallet-sdk'
import { MessageTypes } from 'config/message-types'
import { ACTIVE_WALLET, ENCRYPTED_ACTIVE_WALLET, REDIRECT_REQUEST } from 'config/storage-keys'
import { PasswordManager } from 'extension-scripts/password-manager'
import {
  awaitApproveChainResponse,
  awaitSigningResponse,
  getChainOriginStorageKey,
  getSupportedChains,
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

export const suiRequestHandler = async (
  data: any,
  sendResponse: SendResponseFunction,
  customOpenPopup: OpenPopupFunction,
  passwordManager: PasswordManager,
) => {
  const { method, ...payload } = data
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

  const getSuiChains = () => {
    try {
      const suiChains: string[] = []
      Object.values(allChains).forEach((chain) => {
        if (isSuiChain(chain.chainId)) {
          suiChains.push(chain.chainId)
        }
        if (
          !!chain.testnetChainId &&
          chain.testnetChainId !== chain.chainId &&
          isSuiChain(chain.testnetChainId)
        ) {
          suiChains.push(chain.testnetChainId)
        }
      })
      return suiChains
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      return []
    }
  }

  switch (method) {
    case SUI_FEATURE.STANDARD__CONNECT: {
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
            await cosmosCustomOpenPopup('approveConnection', `?origin=${payload.origin}`)

            requestEnableAccess({
              origin: payload.origin,
              validChainIds: ['sui-101', 'sui-103'],
              payloadId: payload.id,
              ecosystem: LINE_TYPE.SUI,
            })

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
            payload: { ...payload, chainIds: ['sui-101', 'sui-103'] },
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

    case SUI_FEATURE.STANDARD__DISCONNECT: {
      try {
        const suiChains = getSuiChains()
        const response = await disconnect({ chainId: suiChains, origin: payload.origin })
        sendResponse(`on${method.toUpperCase()}`, response, payload.id)
      } catch (error) {
        sendResponse(`on${method.toUpperCase()}`, { error: error }, payload.id)
      }
      return
    }

    case SUI_FEATURE.SUI__SIGN_TRANSACTION:
    case SUI_FEATURE.SUI__SIGN_TRANSACTION_BLOCK: {
      const { signDoc, signer, chainId, origin, signOptions, submit, signMessage } = payload

      requestSignTransaction({
        signDoc,
        signer,
        chainId,
        origin,
        signOptions,
        submit: false,
        isSignMessage: signMessage,
      })

      await customOpenPopup('signSui')
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

    case SUI_FEATURE.SUI__SIGN_AND_EXECUTE_TRANSACTION:
    case SUI_FEATURE.SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK: {
      const { signDoc, signer, chainId, origin, signOptions, submit, signMessage } = payload

      requestSignTransaction({
        signDoc,
        signer,
        chainId,
        origin,
        signOptions,
        submit: true,
        isSignMessage: signMessage,
      })

      await customOpenPopup('signSui')
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

    case SUI_FEATURE.SUI__SIGN_PERSONAL_MESSAGE: {
      const { signDoc, signer, chainId, origin, signOptions, signMessage } = payload

      requestSignTransaction({
        signDoc,
        signer,
        chainId,
        origin,
        signOptions,
        submit: false,
        isSignMessage: true,
      })

      await customOpenPopup('signSui')
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

    case SUI_FEATURE.SUI__REPORT_TRANSACTION_EFFECTS: {
      try {
        sendResponse(`on${method?.toUpperCase() ?? ''}`, { success: true }, payload.id)
      } catch (error) {
        sendResponse(
          `on${method?.toUpperCase() ?? ''}`,
          { error: 'Failed to report transaction effects' },
          payload.id,
        )
      }
      break
    }
  }
}
