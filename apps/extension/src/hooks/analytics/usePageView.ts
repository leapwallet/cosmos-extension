import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import { EventName, PageName } from 'config/analytics'
import mixpanel from 'mixpanel-browser'
import { useEffect } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

/**
 * Track page view on mixpanel
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const usePageView = (pageName: PageName, enable = true, additionalProperties?: any) => {
  const chain = useChainInfo() as ChainInfo | undefined

  useEffect(() => {
    if (!enable || (isCompassWallet() && pageName !== PageName.Home)) return

    const timeoutId = setTimeout(() => {
      try {
        mixpanel.track(
          EventName.PageView,
          {
            pageName,
            chainId: chain?.chainId ?? '',
            chainName: chain?.chainName ?? '',
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
