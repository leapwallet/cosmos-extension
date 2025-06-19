import { useChainFeatureFlagsStore, useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos, modifyChains } from '@leapwallet/cosmos-wallet-sdk'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { chainInfoStore } from 'stores/chain-infos-store'
import { getStorageAdapter } from 'utils/storageAdapter'
import Browser from 'webextension-polyfill'

const app = 'extension'
const version = Browser.runtime.getManifest().version
const storage = getStorageAdapter()

export function useModifyNativeChains() {
  const [isModificationsComplete, setIsModificationsComplete] = useState(false)
  const setChains = useChainsStore((state) => state.setChains)
  const fetchChainFeatureFlags = useChainFeatureFlagsStore((state) => state.fetchChainFeatureFlags)
  const setChainFeatureFlags = useChainFeatureFlagsStore((state) => state.setChainFeatureFlags)

  const { data: chainFeatureFlags, isLoading: isChainFeatureFlagsLoading } = useQuery(
    ['fetch-chain-feature-flags', app, version],
    async () => {
      return await fetchChainFeatureFlags(storage, app)
    },
    {
      staleTime: 3 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.error('Error fetching chain feature flags', error)
        setIsModificationsComplete(true)
      },
    },
  )

  useEffect(() => {
    if (isModificationsComplete || isChainFeatureFlagsLoading || !chainFeatureFlags) return

    const { anyChainModified, modifiedChains } = modifyChains(
      ChainInfos,
      chainFeatureFlags,
      app,
      version,
    )
    if (anyChainModified) {
      setChains({ ...ChainInfos, ...modifiedChains })
      chainInfoStore.setChainInfos({ ...ChainInfos, ...modifiedChains })
    }
    setIsModificationsComplete(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModificationsComplete, chainFeatureFlags, isChainFeatureFlagsLoading])

  useEffect(() => {
    if (!chainFeatureFlags) return
    setChainFeatureFlags(chainFeatureFlags)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainFeatureFlags])

  return { isModificationsComplete }
}
