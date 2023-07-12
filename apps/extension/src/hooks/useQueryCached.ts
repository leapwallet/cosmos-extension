import {
  QueryFunction,
  QueryKey,
  QueryOptions,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'
import browser from 'webextension-polyfill'

export function useQueryCached<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFunction: QueryFunction<TQueryFnData, TQueryKey>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryFn' | 'queryKey'>,
): UseQueryResult<TData, TError> {
  const queryData = useQuery(
    queryKey,
    async (qk) => {
      const storageKey = qk.queryKey.toString()
      const storage = await browser.storage.local.get(storageKey)
      if (storage[storageKey]) {
        return storage[storageKey]
      }
      const data = await queryFunction(qk)
      await browser.storage.local.set({ [storageKey]: data })
      return data
    },
    options,
  )

  return queryData
}
