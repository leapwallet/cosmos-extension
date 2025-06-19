import { useAddress } from '@leapwallet/cosmos-wallet-hooks'
import { bech32ToEthAddress } from '@leapwallet/cosmos-wallet-sdk'
import { sha256 } from '@noble/hashes/sha256'
import { utils } from '@noble/secp256k1'
import { setUser as setSentryUser } from '@sentry/react'
import mixpanel from 'mixpanel-browser'
import { useEffect, useMemo } from 'react'
import { getPrimaryWalletAddress } from 'utils/getPrimaryWalletAddress'
import * as browser from 'webextension-polyfill'

export const useInitAnalytics = () => {
  const activeWalletCosmosAddress = useAddress('cosmos')
  const activeWalletEvmBech32Address = useAddress('ethereum')
  const activeWalletEvmAddress = bech32ToEthAddress(activeWalletEvmBech32Address)

  useEffect(() => {
    ;(async function () {
      try {
        const primaryWalletAddress = await getPrimaryWalletAddress()

        if (!primaryWalletAddress) {
          return
        }

        // create hash of address to anonymize
        const hashedAddress = utils.bytesToHex(sha256(primaryWalletAddress))

        const currentId = mixpanel.get_distinct_id()
        const userName = mixpanel.get_property('$name')
        if (currentId !== hashedAddress) {
          mixpanel.identify(hashedAddress)
        }
        if (userName !== hashedAddress) {
          mixpanel.people.set({ $name: hashedAddress })
        }

        setSentryUser({
          id: hashedAddress,
        })
      } catch (_) {
        //
      }
    })()
  }, [])

  useEffect(() => {
    // get extension version

    try {
      mixpanel.register({
        productVersion: browser.runtime.getManifest().version,
        packageName: chrome.runtime.id,
      })
    } catch (_) {
      //
    }
  }, [])

  const activeWalletAddress = useMemo(
    () => activeWalletCosmosAddress || activeWalletEvmAddress,
    [activeWalletCosmosAddress, activeWalletEvmAddress],
  )

  useEffect(() => {
    if (activeWalletAddress) {
      const hashedAddress = utils.bytesToHex(sha256(activeWalletAddress))
      try {
        mixpanel.register({
          wallet: hashedAddress,
        })
      } catch (e) {
        // ignore
      }
    }
  }, [activeWalletAddress])
}
