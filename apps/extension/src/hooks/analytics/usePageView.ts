import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import { EventName, PageName } from 'config/analytics'
import mixpanel from 'mixpanel-browser'
import { useEffect } from 'react'

/**
 * Track page view on mixpanel
 */
export const usePageView = (pageName: PageName) => {
  const chain = useChainInfo() as ChainInfo | undefined

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        mixpanel.track(
          EventName.PageView,
          {
            pageName,
            chainId: chain?.chainId ?? '',
            chainName: chain?.chainName ?? '',
            time: Date.now() / 1000,
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
  }, [chain?.chainId, chain?.chainName, pageName])
}
