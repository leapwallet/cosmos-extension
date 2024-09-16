import { WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import browser from 'webextension-polyfill'

import { LEDGER_ENABLED_EVM_CHAIN_IDS } from '../../config/config'
import { ACTIVE_WALLET, CONNECTIONS } from '../../config/storage-keys'
import { getUpdatedKeyStore } from '../../hooks/wallet/getUpdatedKeyStore'
import { Bech32Address } from '../../utils/bech32'
import { formatWalletName } from '../../utils/formatWalletName'
import { toUint8Array } from '../../utils/uint8Utils'
import { PasswordManager } from '../password-manager'
import { checkConnection, decodeChainIdToChain } from '../utils'
import { awaitApproveChainResponse, openPopup, requestEnableAccess } from '../utils'

type GetKeyRequest = {
  message: {
    payload: any
    type: string
  }
  passwordManager: PasswordManager
  sendResponse: (eventName: string, payload: any, payloadId: number) => void
}

export async function getKey(chainId: string, passwordManager: PasswordManager) {
  let { 'active-wallet': activeWallet } = await browser.storage.local.get([ACTIVE_WALLET])
  const _chainIdToChain = await decodeChainIdToChain()
  let chain = _chainIdToChain[chainId]

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

const requests = new Map()

export async function handleGetKey({ message, passwordManager, sendResponse }: GetKeyRequest) {
  requests.set(message.payload.id, false)
  const { payload, type } = message
  const msg = payload
  const chainIds = msg.chainIds ?? Array.isArray(msg.chainId) ? msg.chainId : [msg.chainId]
  const eventName = `on${type.toUpperCase()}`

  let queryString = `?origin=${msg?.origin}`
  chainIds?.forEach((chainId: string) => {
    queryString += `&chainIds=${chainId}`
  })

  try {
    const store = await browser.storage.local.get([CONNECTIONS, ACTIVE_WALLET])
    const activeWallet = store[ACTIVE_WALLET]
    const { validChainIds, isNewChainPresent } = await checkConnection(chainIds, msg)

    const password = passwordManager.getPassword()

    if (validChainIds.length === 0) {
      sendResponse(eventName, { error: 'Invalid chain id' }, payload.id)
      return
    }
    const isEvmChainId = validChainIds.some((chainId) =>
      LEDGER_ENABLED_EVM_CHAIN_IDS.includes(chainId),
    )

    if (activeWallet && activeWallet.walletType === WALLETTYPE.LEDGER && isEvmChainId) {
      const chainIdToChain = await decodeChainIdToChain()
      const requestedChainKeys = validChainIds
        .map((chainId) => [chainId, chainIdToChain[chainId]])
        .filter(([_, chainKey]) => !!activeWallet.addresses[chainKey])

      if (requestedChainKeys.length === 0) {
        requestedChainKeys.forEach(([requestedChainId]) => {
          sendResponse(eventName, { error: `No public key for ${requestedChainId}` }, payload.id)
        })
        return
      }
    }

    if (isNewChainPresent || !password) {
      await openPopup('approveConnection', '?unlock-to-approve')
      requestEnableAccess({
        origin: msg.origin,
        validChainIds,
        payloadId: payload.id,
      })

      try {
        const response: any = await awaitApproveChainResponse(payload.id)
        if (response) {
          if (type === 'get-key') {
            const key = await getKey(validChainIds[0], passwordManager)
            sendResponse(eventName, { key }, response.payloadId)
          } else {
            const keys = await getKeys(validChainIds)
            sendResponse(eventName, { keys }, response.payloadId)
          }
        }
      } catch (e) {
        sendResponse(eventName, { error: 'Request rejected' }, payload.id)
      }
    } else {
      if (type === 'get-key') {
        getKey(validChainIds[0], passwordManager)
          .then((key) => {
            sendResponse(eventName, { key }, payload.id)
          })
          .catch(() => {
            sendResponse(eventName, { error: 'Invalid chain Id' }, payload.id)
          })
      } else {
        getKeys(validChainIds)
          .then((keys) => {
            sendResponse(eventName, { keys }, payload.id)
          })
          .catch(() => {
            sendResponse(eventName, { error: 'Invalid chain Id' }, payload.id)
          })
      }
    }
  } catch (e) {
    sendResponse(eventName, { error: 'Unable to get key' }, payload.id)
  }
}
