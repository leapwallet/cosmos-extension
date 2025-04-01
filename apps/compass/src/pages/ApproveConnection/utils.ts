import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { CONNECTIONS } from 'config/storage-keys'
import browser from 'webextension-polyfill'

export const addToConnections = async (chainIds: string[], walletIds: string[], origin: string) => {
  let { connections = {} } = await browser.storage.local.get(CONNECTIONS)
  if (connections === null) {
    connections = {}
  }
  chainIds.forEach((chainId: string) => {
    walletIds.forEach((walletId: string) => {
      const sites: [string] = connections?.[walletId]?.[chainId] || []
      if (!sites.includes(origin)) {
        sites.push(origin)
      }
      connections[walletId] = {
        ...connections?.[walletId],
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
