import type { Callback, Dict, RequestOptions } from 'mixpanel-browser'
import mixpanel from 'mixpanel-browser'
import { useCallback } from 'react'

export type TrackingOptions = {
  transport?: 'xhr' | 'sendBeacon'
  send_immediately?: boolean
}

const useTracking = (
  eventName: string,
  optionsOrCallback?: RequestOptions | Callback,
  callback?: Callback,
) => {
  const track = useCallback(
    (properties: Dict) => {
      try {
        mixpanel.track(eventName, properties, optionsOrCallback, callback)
      } catch (err) {
        console.log(err)
      }
    },
    [callback, eventName, optionsOrCallback],
  )

  return track
}

export default useTracking
