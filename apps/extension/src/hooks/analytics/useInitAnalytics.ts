import { useAddress, useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { type ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import { sha256 } from '@noble/hashes/sha256'
import { utils } from '@noble/secp256k1'
import { Wallet } from 'hooks/wallet/useWallet'
import mixpanel from 'mixpanel-browser'
import { useEffect } from 'react'
import * as browser from 'webextension-polyfill'

export const useInitAnalytics = () => {
  const chain = useChainInfo() as ChainInfo | undefined

  const chainId = chain?.chainId ?? ''
  const chainName = chain?.chainName ?? ''

  useEffect(() => {
    try {
      mixpanel.register({
        chainId,
        chainName,
      })
    } catch (e) {
      // ignore
    }
  }, [chainId, chainName])

  const firstWalletCosmosAddress = Wallet.useFirstWalletCosmosAddress()

  useEffect(() => {
    try {
      if (firstWalletCosmosAddress) {
        // create hash of address to anonymize
        const hashedAddress = utils.bytesToHex(sha256(firstWalletCosmosAddress))
        const currentId = mixpanel.get_distinct_id()
        const userName = mixpanel.get_property('$name')
        if (currentId !== hashedAddress) {
          mixpanel.identify(hashedAddress)
        }
        if (userName !== hashedAddress) {
          mixpanel.people.set({ $name: hashedAddress })
        }
      }
    } catch (e) {
      // ignore
    }
  }, [firstWalletCosmosAddress])

  const activeWalletCosmosAddress = useAddress('cosmos')

  // get extension version
  useEffect(() => {
    try {
      mixpanel.register({
        productVersion: browser.runtime.getManifest().version,
      })
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    const hashedAddress = utils.bytesToHex(sha256(activeWalletCosmosAddress))
    try {
      mixpanel.register({
        wallet: hashedAddress,
      })
    } catch (e) {
      // ignore
    }
  }, [activeWalletCosmosAddress])
}
