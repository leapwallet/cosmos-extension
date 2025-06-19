import {
  getEvmChainIdMap,
  pubKeyToEvmAddressToShow,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { ACTIVE_WALLET, BG_RESPONSE } from 'config/storage-keys'
import { getSupportedChains } from 'extension-scripts/utils'
import { addToConnections } from 'pages/ApproveConnection/utils'
import browser from 'webextension-polyfill'

export async function switchEthereumChain(
  chainId: string | undefined,
  origin: string,
  activeChainIdStorageKey: string,
) {
  try {
    if (!chainId) {
      throw new Error(`Invalid chain id: ${chainId}`)
    }
    const updatedSupportedChains = await getSupportedChains()
    const updatedEvmChainIdMap = await getEvmChainIdMap(updatedSupportedChains, false)
    const requestedActiveChain = updatedEvmChainIdMap[Number(chainId).toString()]
    if (!requestedActiveChain) {
      throw new Error('Unrecognized chain id')
    }

    const store = await browser.storage.local.get([ACTIVE_WALLET])
    const pubkey = store[ACTIVE_WALLET].pubKeys?.[requestedActiveChain.key as SupportedChain]
    const evmAddress = pubKeyToEvmAddressToShow(pubkey)
    if (evmAddress === 'error') {
      throw new Error('Unable to get wallet address')
    }

    const chain = updatedSupportedChains[requestedActiveChain.key as SupportedChain]
    if (!chain) {
      throw new Error(`Unrecognized chain id: ${chainId}`)
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

    await addToConnections([requestedChainId], [activeWallet.id], origin)
    await browser.storage.local.set({
      [BG_RESPONSE]: { data: 'Approved' },
    })

    setTimeout(() => browser.storage.local.remove(BG_RESPONSE), 50)
    return
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Error switching chain', error)
  }
}
