import { useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks'
import { useMemo } from 'react'
import semver from 'semver'
import browser from 'webextension-polyfill'

function getMultiplier(
  multiplier: Record<string, Record<string, number>> | undefined,
  version: string,
) {
  if (!multiplier) {
    return undefined
  }
  const applicableRange = Object.keys(multiplier).find((versionRange) => {
    if (semver.satisfies(version, versionRange)) {
      return true
    }
    return false
  })
  if (!applicableRange) {
    return undefined
  }
  return multiplier?.[applicableRange]
}

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

  const lifiGasPriceMultiplier = useMemo(() => {
    return getMultiplier(
      featureFlags?.swaps?.providers?.lifi?.gas_price_multiplier?.extension,
      browser.runtime.getManifest().version,
    )
  }, [featureFlags])

  const lifiGasLimitMultiplier = useMemo(() => {
    return getMultiplier(
      featureFlags?.swaps?.providers?.lifi?.gas_limit_multiplier?.extension,
      browser.runtime.getManifest().version,
    )
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

  const isEvmSwapEnabled = useMemo(() => {
    if (!featureFlags?.swaps?.evm?.disabled_on_versions) {
      return true
    }
    const version = browser.runtime.getManifest().version
    return !featureFlags.swaps.evm.disabled_on_versions?.some((disabledVersions) => {
      return semver.satisfies(version, disabledVersions)
    })
  }, [featureFlags])

  return {
    isLifiEnabled,
    isSkipEnabled,
    lifiGasPriceMultiplier,
    lifiGasLimitMultiplier,
    isEvmSwapEnabled,
  }
}
