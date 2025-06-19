import { useGetStorageLayer } from '@leapwallet/cosmos-wallet-hooks'
import { EARN_USDN_HIGHLIGHT_SHOW } from 'config/storage-keys'
import { useEffect, useState } from 'react'
import browser from 'webextension-polyfill'

export default function useEarnHighlightFeature() {
  const storage = useGetStorageLayer()
  const [showFeature, setShowFeature] = useState(false)
  const version = browser.runtime.getManifest().version

  async function hideFeature() {
    await storage.set(EARN_USDN_HIGHLIGHT_SHOW + version, 'false')
    setShowFeature(false)
  }

  useEffect(() => {
    async function checkStorage() {
      const show = await storage.get(EARN_USDN_HIGHLIGHT_SHOW + version)
      if (show !== 'false' && version === '0.19.1') {
        setShowFeature(true)
      } else {
        setShowFeature(false)
      }
    }
    setTimeout(() => {
      checkStorage()
    }, 3000)
  }, [storage, version])

  return { showFeature, hideFeature }
}
