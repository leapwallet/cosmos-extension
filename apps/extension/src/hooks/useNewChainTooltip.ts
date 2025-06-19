import {
  cachedRemoteDataWithLastModified,
  useChainInfo,
  useGetStorageLayer,
} from '@leapwallet/cosmos-wallet-hooks'
import { useQuery } from '@tanstack/react-query'
import { NEW_CHAIN_TOOLTIP_STORAGE_KEY } from 'config/storage-keys'
import { useCallback, useEffect, useMemo, useState } from 'react'
import browser from 'webextension-polyfill'

import { useActiveChain } from './settings/useActiveChain'

export type TooltipVisibility = {
  visibleOn?: string[]
  hiddenOn?: string[]
}

export type CTAAction =
  | {
      type: 'redirect-internally' | 'redirect-externally'
      redirectUrl: string
    }
  | {
      type: 'add-chain' | 'switch-chain'
      chainRegistryPath: string
    }

export type NewChainTooltipData = {
  defaultFilter?: string
  id?: string
  header: string
  description: string
  imgUrl?: string
  ctaText: string
  ctaAction?: CTAAction
  visibility?: TooltipVisibility
}

export default function useNewChainTooltip() {
  const storage = useGetStorageLayer()
  const [showToolTip, setShowToolTip] = useState<boolean>(false)
  const [userPreference, setUserPreference] = useState<Record<string, boolean> | undefined>()
  const [userPreferenceLoading, setUserPreferenceLoading] = useState<boolean>(true)
  const [toolTipData, setToolTipData] = useState<NewChainTooltipData>()
  const activeChain = useActiveChain()
  const chainInfo = useChainInfo(activeChain)
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

  const toolTipId = useMemo(() => {
    if (data?.[version]?.id) {
      return `${version}-${data?.[version]?.id}`
    }
    return version
  }, [data, version])

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

    isFeatureEnabled = data?.['featureFlags']?.['leap-extension'] ?? false

    if (
      !isFeatureEnabled ||
      userPreferenceLoading ||
      !data?.[version] ||
      userPreference?.[toolTipId] === false
    ) {
      setShowToolTip(false)
      return
    }

    if (!data?.[version]) {
      setShowToolTip(false)
      return
    }

    if (
      data?.[version]?.visibility?.hiddenOn &&
      (data?.[version]?.visibility?.hiddenOn?.includes(activeChain) ||
        data?.[version]?.visibility?.hiddenOn?.includes(chainInfo?.chainId ?? '') ||
        data?.[version]?.visibility?.hiddenOn?.includes(chainInfo?.testnetChainId ?? '') ||
        data?.[version]?.visibility?.hiddenOn?.includes(chainInfo?.evmChainId ?? '') ||
        data?.[version]?.visibility?.hiddenOn?.includes(chainInfo?.evmChainIdTestnet ?? ''))
    ) {
      setShowToolTip(false)
      return
    }

    if (
      data?.[version]?.visibility?.visibleOn &&
      !(
        data?.[version]?.visibility?.visibleOn?.includes(activeChain) ||
        data?.[version]?.visibility?.visibleOn?.includes(chainInfo?.chainId ?? '') ||
        data?.[version]?.visibility?.visibleOn?.includes(chainInfo?.testnetChainId ?? '') ||
        data?.[version]?.visibility?.visibleOn?.includes(chainInfo?.evmChainId ?? '') ||
        data?.[version]?.visibility?.visibleOn?.includes(chainInfo?.evmChainIdTestnet ?? '')
      )
    ) {
      setShowToolTip(false)
      return
    }

    setShowToolTip(true)
    setToolTipData(data?.[version])
  }, [
    data,
    userPreference,
    userPreferenceLoading,
    toolTipId,
    version,
    activeChain,
    chainInfo?.chainId,
    chainInfo?.testnetChainId,
    chainInfo?.evmChainId,
    chainInfo?.evmChainIdTestnet,
  ])

  const handleToolTipClose = useCallback(() => {
    setShowToolTip(false)
    async function updateUserPreference() {
      try {
        const _userPreferenceJson = await storage.get(NEW_CHAIN_TOOLTIP_STORAGE_KEY)
        const _userPreference = JSON.parse(_userPreferenceJson)
        storage.set(
          NEW_CHAIN_TOOLTIP_STORAGE_KEY,
          JSON.stringify({ ..._userPreference, [toolTipId]: false }),
        )
      } catch (_) {
        //
      }
      setUserPreference((_userPreference) => ({ ...(_userPreference ?? {}), [toolTipId]: false }))
    }
    updateUserPreference()
  }, [setShowToolTip, toolTipId, storage])

  return { showToolTip, toolTipData, handleToolTipClose }
}
