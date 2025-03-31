import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import { EventName, PageName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import mixpanel from 'mixpanel-browser'
import { useEffect } from 'react'
import { AggregatedSupportedChain } from 'types/utility'

/**
 * Track page view on mixpanel
 */
export const usePageView = (
  pageName: PageName | null,
  additionalProperties?: Record<string, unknown>,
) => {
  const chain = useChainInfo() as ChainInfo | undefined
  const activeChain = useActiveChain() as AggregatedSupportedChain

  useEffect(() => {
    if (!pageName) return

    const isAggregatedView = activeChain === AGGREGATED_CHAIN_KEY
    const chainId = isAggregatedView ? 'all' : chain?.chainId ?? ''
    const chainName = isAggregatedView ? 'All Chains' : chain?.chainName ?? ''

    const timeoutId = setTimeout(() => {
      try {
        mixpanel.track(
          EventName.PageView,
          {
            pageName,
            chainId,
            chainName,
            time: Date.now() / 1000,
            ...(additionalProperties ?? {}),
          },
          {
            transport: 'sendBeacon',
          },
        )
      } catch (_) {
        //
      }
    }, 250)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [activeChain, additionalProperties, chain, pageName])
}
