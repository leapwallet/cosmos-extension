import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Key } from '@leapwallet/leap-keychain'
import { bech32 } from 'bech32'

function convertBech32Address(address: string, prefix: string) {
  const { words } = bech32.decode(address)
  return bech32.encode(prefix, words)
}

// migrate composable finance address prefix from centauri to pica
export function migratePicassoAddress(
  keystore: Record<string, Key<SupportedChain>>,
  activeWallet: Key<SupportedChain>,
) {
  const keystoreEntries = Object.entries(keystore)
  const newKeyStore = keystoreEntries.reduce(
    (kstore: Record<string, Key<SupportedChain>>, [walletId, key]) => {
      const newKey = {
        ...key,
        addresses: {
          ...key.addresses,
          [ChainInfos.composable.key]: convertBech32Address(
            key.addresses.cosmos,
            ChainInfos.composable.addressPrefix,
          ),
        },
      }
      kstore[walletId] = newKey
      return kstore
    },
    {},
  )

  const newActiveWallet = {
    ...activeWallet,
    addresses: {
      ...activeWallet.addresses,
      [ChainInfos.composable.key]: convertBech32Address(
        activeWallet.addresses.cosmos,
        ChainInfos.composable.addressPrefix,
      ),
    },
  }

  return { newKeyStore, newActiveWallet }
}
