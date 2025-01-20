import { useAddress } from '@leapwallet/cosmos-wallet-hooks'
import { sha256 } from '@noble/hashes/sha256'
import { utils } from '@noble/secp256k1'
import { setUser as setSentryUser } from '@sentry/react'
import mixpanel from 'mixpanel-browser'
import { useEffect } from 'react'
import { getPrimaryWalletAddress } from 'utils/getPrimaryWalletAddress'
import * as browser from 'webextension-polyfill'

export const useInitAnalytics = () => {
  const activeWalletCosmosAddress = useAddress('cosmos')

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

  useEffect(() => {
    if (activeWalletCosmosAddress) {
      const hashedAddress = utils.bytesToHex(sha256(activeWalletCosmosAddress))
      try {
        mixpanel.register({
          wallet: hashedAddress,
        })
      } catch (e) {
        // ignore
      }
    }
  }, [activeWalletCosmosAddress])
}
