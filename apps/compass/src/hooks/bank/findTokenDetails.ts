import { useDenoms } from '@leapwallet/cosmos-wallet-hooks'
import { NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import { useCallback } from 'react'

/** @returns `undefined` if either the `token` doesn't exist or the dataset hasn't been successfully fetched yet. */
// eslint-disable-next-line no-unused-vars
export type FindTokenDetails = (denom: string) => NativeDenom | undefined

export function useFindTokenItemByToken(forcedChain?: SupportedChain): FindTokenDetails {
  const chainInfos = useChainInfos()
  const _activeChain = useActiveChain()
  const activeChain = forcedChain ?? _activeChain
  const chainInfo = chainInfos[activeChain]
  const denoms = useDenoms()

  return useCallback(
    (denom: string) => denoms[denom],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chainInfo],
  )
}
