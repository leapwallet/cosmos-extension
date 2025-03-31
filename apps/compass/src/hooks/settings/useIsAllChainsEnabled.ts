import { FeatureFlags, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks'
import semver from 'semver'
import browser from 'webextension-polyfill'

export function isAllChainsEnabled(featureFlags: FeatureFlags | undefined) {
  const version = browser.runtime.getManifest().version

  return (
    semver.satisfies(
      version,
      featureFlags?.give_all_chains_option_in_wallet?.extension_v2 || '=0.0.1',
    ) || featureFlags?.give_all_chains_option_in_wallet?.extension === 'active'
  )
}

export function useIsAllChainsEnabled() {
  const { data: featureFlags } = useFeatureFlags()

  return isAllChainsEnabled(featureFlags)
}
