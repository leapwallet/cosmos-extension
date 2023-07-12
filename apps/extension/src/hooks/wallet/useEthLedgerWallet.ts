/**
 * TODO: uncomment this when implementing ledger for evm chains
 * 
 * import { useActiveChain, useActiveWalletStore } from '@leapwallet/cosmos-wallet-hooks'
import { getLedgerTransport } from '@leapwallet/cosmos-wallet-sdk'
import getHDPath from '@leapwallet/cosmos-wallet-sdk/dist/utils/get-hdpath'
import { useChainInfos } from 'hooks/useChainInfos'
import { useEffect } from 'react'
import browser from 'webextension-polyfill'

import { KEYSTORE } from '../../config/storage-keys'

export function useEthLedgerWallet() {
  const chainInfos = useChainInfos()
  const { activeWallet, setActiveWallet } = useActiveWalletStore()
  const activeChain = useActiveChain()

  useEffect(() => {
    const fn = async () => {
      const transport = await getLedgerTransport()
      const hdPath = getHDPath('60', activeWallet?.addressIndex.toString() ?? '0')
      const ledgerSigner = new LeapLedgerSignerEth(transport, {
        hdPaths: [hdPath],
        prefix: chainInfos[activeChain].addressPrefix,
      })
      const accounts = await ledgerSigner.getAccounts()
      const { address, pubkey } = accounts[0]
      const newActiveWallet = {
        ...activeWallet,
        addresses: { ...activeWallet.addresses, [activeChain]: address },
        pubKeys: { ...activeWallet.pubKeys, [activeChain]: pubkey },
      }
      setActiveWallet(newActiveWallet)
      const storage = await browser.storage.local.get([KEYSTORE])
      const keystore = storage[KEYSTORE]
      keystore[activeWallet.id] = newActiveWallet
      await browser.storage.local.set({ [KEYSTORE]: keystore })
    }
    const isEthChain = chainInfos[activeChain].bip44.coinType === '60'
    if (isEthChain) {
      fn()
    }
  }, [activeChain, chainInfos])
}
 */
