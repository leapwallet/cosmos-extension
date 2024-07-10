import {
  cachedRemoteDataWithLastModified,
  useGetStorageLayer,
} from '@leapwallet/cosmos-wallet-hooks'
import { useQuery } from '@tanstack/react-query'
import { NEW_CHAIN_TOOLTIP_STORAGE_KEY } from 'config/storage-keys'
import { useCallback, useEffect, useState } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'
import browser from 'webextension-polyfill'

export type NewChainTooltipData = {
  header: string
  description: string
  imgUrl?: string
  ctaText: string
}

export default function useNewChainTooltip() {
  const storage = useGetStorageLayer()
  const [showToolTip, setShowToolTip] = useState<boolean>(false)
  const [userPreference, setUserPreference] = useState()
  const [userPreferenceLoading, setUserPreferenceLoading] = useState<boolean>(true)
  const [toolTipData, setToolTipData] = useState<NewChainTooltipData>()

  const version = browser.runtime.getManifest().version

  const { data } = useQuery(
    ['leap-new-chains-tooltip', storage],
    async () => {
      const data = await cachedRemoteDataWithLastModified({
        remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/nudges/new-chain-tooltip.json',
        storageKey: 'leap-new-chains-tooltip',
        storage,
      })

      return data as {
        featureFlags: {
          'compass-extension'?: boolean
          'leap-extension'?: boolean
        }
      } & { [version: string]: NewChainTooltipData }
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  )

  useEffect(() => {
    async function loadUserPreferences() {
      try {
        setUserPreferenceLoading(true)
        const _userPreferenceJson = await storage.get(NEW_CHAIN_TOOLTIP_STORAGE_KEY)
        const _userPreference = JSON.parse(_userPreferenceJson)
        setUserPreference(_userPreference)
        setUserPreferenceLoading(false)
      } catch (_) {
        setUserPreferenceLoading(false)
        //
      }
    }
    loadUserPreferences()
  }, [storage])

  useEffect(() => {
    let isFeatureEnabled = false
    if (isCompassWallet()) {
      isFeatureEnabled = data?.['featureFlags']?.['compass-extension'] ?? false
    } else {
      isFeatureEnabled = data?.['featureFlags']?.['leap-extension'] ?? false
    }

    if (
      !isFeatureEnabled ||
      userPreferenceLoading ||
      userPreference?.[version] === false ||
      !data?.[version]
    ) {
      setShowToolTip(false)
      return
    }

    if (!data?.[version]) {
      setShowToolTip(false)
      return
    }

    setShowToolTip(true)
    setToolTipData(data?.[version])
  }, [data, userPreference, userPreferenceLoading, version])

  const handleToolTipClose = useCallback(() => {
    setShowToolTip(false)
    async function updateUserPreference() {
      try {
        const _userPreferenceJson = await storage.get(NEW_CHAIN_TOOLTIP_STORAGE_KEY)
        const _userPreference = JSON.parse(_userPreferenceJson)
        storage.set(
          NEW_CHAIN_TOOLTIP_STORAGE_KEY,
          JSON.stringify({ ..._userPreference, [version]: false }),
        )
      } catch (_) {
        //
      }
    }
    updateUserPreference()
  }, [setShowToolTip, version, storage])

  return { showToolTip, toolTipData, handleToolTipClose }
}
