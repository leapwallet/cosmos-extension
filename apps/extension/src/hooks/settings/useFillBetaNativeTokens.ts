import {
  BETA_NATIVE_TOKENS,
  useActiveChain,
  useBetaNativeTokensStore,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useEffect, useMemo } from 'react'
import { AggregatedSupportedChain } from 'types/utility'

import { fillBetaValuesFromStorage } from './fillBetaValuesFromStorage'

export function useFillBetaNativeTokens(forceChain?: SupportedChain) {
  const _activeChain = useActiveChain()
  const activeChain = useMemo(
    () => (forceChain || _activeChain) as AggregatedSupportedChain,
    [forceChain, _activeChain],
  )

  const { setBetaNativeTokens } = useBetaNativeTokensStore()

  useEffect(
    () => {
      if (activeChain && activeChain !== AGGREGATED_CHAIN_KEY) {
        fillBetaValuesFromStorage(
          activeChain,
          BETA_NATIVE_TOKENS,
          (value) => setBetaNativeTokens(value),
          {},
        )
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeChain],
  )
}
