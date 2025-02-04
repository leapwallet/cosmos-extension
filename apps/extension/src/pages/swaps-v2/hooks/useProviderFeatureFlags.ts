import { useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks'
import { useMemo } from 'react'
import semver from 'semver'
import browser from 'webextension-polyfill'

export function useProviderFeatureFlags() {
  const { data: featureFlags } = useFeatureFlags()

  const isLifiEnabled = useMemo(() => {
    if (!featureFlags?.swaps?.providers?.lifi?.disabled_on_versions) {
      return true
    }
    const version = browser.runtime.getManifest().version
    return !featureFlags.swaps.providers.lifi.disabled_on_versions?.some((disabledVersions) => {
      return semver.satisfies(version, disabledVersions)
    })
  }, [featureFlags])

  const isSkipEnabled = useMemo(() => {
    if (!featureFlags?.swaps?.providers?.skip?.disabled_on_versions) {
      return true
    }
    const version = browser.runtime.getManifest().version
    return !featureFlags.swaps.providers.skip.disabled_on_versions?.some((disabledVersions) => {
      return semver.satisfies(version, disabledVersions)
    })
  }, [featureFlags])

  return {
    isLifiEnabled,
    isSkipEnabled,
  }
}
