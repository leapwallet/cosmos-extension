import {
  BETA_CW20_TOKENS,
  fetchAutoFetchedCW20BalancesQueryFn,
  fetchCW20TokensQueryFn,
  fetchCW20TokensQueryParams,
  useAutoFetchedCW20TokensStore,
  useBetaCW20TokensStore,
  useCW20TokensStore,
  useGetStorageLayer,
} from '@leapwallet/cosmos-wallet-hooks'
import { useQueryClient } from '@tanstack/react-query'
import { fillBetaValuesFromStorage } from 'hooks/settings/fillBetaValuesFromStorage'
import { useEffect, useState } from 'react'
import { SourceChain } from 'types/swap'

export function useInitializeCW20TokensForChain(chain: SourceChain | undefined) {
  const queryClient = useQueryClient()
  const storage = useGetStorageLayer()
  const [isLoading, setLoading] = useState(false)
  const { setCW20Tokens } = useCW20TokensStore()
  const { setAutoFetchedCW20Tokens } = useAutoFetchedCW20TokensStore()
  const { setBetaCW20Tokens } = useBetaCW20TokensStore()

  useEffect(() => {
    async function fetchCW20TokensFiles() {
      if (chain?.key) {
        setLoading(true)
        fillBetaValuesFromStorage(
          chain?.key,
          BETA_CW20_TOKENS,
          (value) => setBetaCW20Tokens(value, chain?.key),
          {},
        )
        await Promise.allSettled([
          queryClient.fetchQuery(
            ['fetch-cw20-tokens', chain?.key],
            async () => fetchCW20TokensQueryFn(chain?.key, storage, setCW20Tokens),
            fetchCW20TokensQueryParams,
          ),
          queryClient.fetchQuery(
            ['fetch-auto-fetched-cw20-tokens', chain?.key],
            async () =>
              fetchAutoFetchedCW20BalancesQueryFn(chain?.key, storage, setAutoFetchedCW20Tokens),
            fetchCW20TokensQueryParams,
          ),
        ])
        setLoading(false)
      }
    }
    fetchCW20TokensFiles()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain])

  return { isLoading }
}
