import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { CONNECTIONS } from 'config/storage-keys'
import browser from 'webextension-polyfill'

import { Wallet } from '../../hooks/wallet/useWallet'

export const addToConnections = async (
  chainIds: string[],
  wallets: [Wallet.Key] | Wallet.Key[] | [],
  origin: string,
) => {
  let { connections = {} } = await browser.storage.local.get(CONNECTIONS)
  if (connections === null) {
    connections = {}
  }
  chainIds.forEach((chainId: string) => {
    wallets.forEach((wallet: Wallet.Key) => {
      const sites: [string] = connections?.[wallet.id]?.[chainId] || []
      if (!sites.includes(origin)) {
        sites.push(origin)
      }
      connections[wallet.id] = {
        ...connections?.[wallet.id],
        [chainId]: [...sites],
      }
    })
  })
  await browser.storage.local.set({
    [CONNECTIONS]: { ...connections },
  })
}

export const getChainName = (chainId: string): SupportedChain => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return chainId?.split('-')?.slice(0, -1)?.join('-')
}
