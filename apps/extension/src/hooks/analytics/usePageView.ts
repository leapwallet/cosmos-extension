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

  const chainId = chain?.chainId ?? ''
  const chainName = chain?.chainName ?? ''

  useEffect(() => {
    const time = Date.now() / 1000

    const timeoutId = setTimeout(() => {
      try {
        mixpanel.track(
          EventName.PageView,
          {
            pageName,
            chainId,
            chainName,
            time,
          },
          {
            transport: 'sendBeacon',
          },
        )
      } catch (e) {
        // ignore
      }
    }, 250)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [chainId, chainName, pageName])
}
