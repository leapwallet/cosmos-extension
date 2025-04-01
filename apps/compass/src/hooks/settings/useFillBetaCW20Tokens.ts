import {
  BETA_CW20_TOKENS,
  useActiveChain,
  useBetaCW20TokensStore,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useEffect, useMemo } from 'react'
import { AggregatedSupportedChain } from 'types/utility'

import { fillBetaValuesFromStorage } from './fillBetaValuesFromStorage'

export function useFillBetaCW20Tokens(forceChain?: SupportedChain) {
  const _activeChain = useActiveChain()
  const activeChain = useMemo(
    () => (forceChain || _activeChain) as AggregatedSupportedChain,
    [forceChain, _activeChain],
  )

  const { setBetaCW20Tokens } = useBetaCW20TokensStore()

  useEffect(() => {
    if (activeChain && activeChain !== AGGREGATED_CHAIN_KEY) {
      fillBetaValuesFromStorage(
        activeChain,
        BETA_CW20_TOKENS,
        (value) => setBetaCW20Tokens(value, activeChain),
        {},
      )
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChain])
}
