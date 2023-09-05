import { useCallback, useEffect } from 'react'
import { atom, useRecoilState, useSetRecoilState } from 'recoil'
import browser from 'webextension-polyfill'

import { REQUEST_CACHE } from '../config/storage-keys'

const requestCacheState = atom<Record<string, unknown>>({
  key: 'requestCacheState',
  default: {},
})

export function useRequestCache() {
  const [requestCache, setRequestCache] = useRecoilState(requestCacheState)
  useEffect(() => {
    return () => {
      browser.storage.local.set({ [REQUEST_CACHE]: requestCache })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getCachedData = useCallback(
    <T = unknown>(cache_key: string) => {
      return requestCache[cache_key] as T
    },
    [requestCache],
  )

  const setCachedData = useCallback(
    async <T = unknown>(cache_key: string, data: T) => {
      const updatedCache = requestCache
      updatedCache[cache_key] = data
      // await browser.storage.local.set({ [REQUEST_CACHE]: updatedCache })
      setRequestCache(updatedCache)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requestCache],
  )

  return { getCachedData, setCachedData }
}

export function useInitRequestCache() {
  const setRequestCache = useSetRecoilState(requestCacheState)
  useEffect(() => {
    browser.storage.local.get(REQUEST_CACHE).then((storage) => {
      const requestCache = storage[REQUEST_CACHE]
      setRequestCache(requestCache ?? {})
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
