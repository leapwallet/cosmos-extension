import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import { EventName, PageName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import mixpanel from 'mixpanel-browser'
import { useEffect } from 'react'
import { AggregatedSupportedChain } from 'types/utility'
import { isCompassWallet } from 'utils/isCompassWallet'

/**
 * Track page view on mixpanel
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const usePageView = (pageName: PageName, enable = true, additionalProperties?: any) => {
  const chain = useChainInfo() as ChainInfo | undefined
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const isAggregatedView = activeChain === AGGREGATED_CHAIN_KEY
  const chainId = isAggregatedView ? 'all' : chain?.chainId ?? ''
  const chainName = isAggregatedView ? 'All Chains' : chain?.chainName ?? ''

  useEffect(() => {
    if (!enable || (isCompassWallet() && pageName !== PageName.Home)) return

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
  }, [additionalProperties, chain?.chainId, chain?.chainName, enable, pageName])
}
