import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useDebounceCallback } from './useDebounceCallback'

export default function useQuery(): URLSearchParams {
  const location = useLocation()
  return useMemo(() => {
    return new URLSearchParams(location.search)
  }, [location])
}

export const useQueryParams = () => {
  const [searchParams] = useSearchParams()

  const location = useLocation()
  const navigate = useNavigate()

  const setSearchParams = useCallback(
    (newSearchParams: URLSearchParams) => {
      navigate(`${location.pathname}?${newSearchParams.toString()}`, {
        replace: true,
      })
    },
    [location.pathname, navigate],
  )

  const get = useCallback(
    (key: string) => {
      return searchParams.get(key)
    },
    [searchParams],
  )

  const set = useCallback(
    (key: string, value: string) => {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set(key, value)
      setSearchParams(newSearchParams)
    },
    [searchParams, setSearchParams],
  )

  const debouncedSet = useDebounceCallback().debounce(set, 250)

  const remove = useCallback(
    (key: string | string[]) => {
      const newSearchParams = new URLSearchParams(searchParams)

      if (Array.isArray(key)) {
        key.forEach((k) => newSearchParams.delete(k))
      } else {
        newSearchParams.delete(key)
      }

      setSearchParams(newSearchParams)
    },
    [searchParams, setSearchParams],
  )

  return {
    searchParams,
    get,
    set,
    remove,
    debouncedSet,
  }
}
