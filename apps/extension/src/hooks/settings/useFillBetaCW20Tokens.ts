import {
  BETA_CW20_TOKENS,
  useActiveChain,
  useBetaCW20TokensStore,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useEffect } from 'react'

import { fillBetaValuesFromStorage } from './fillBetaValuesFromStorage'

export function useFillBetaCW20Tokens(forceChain?: SupportedChain) {
  const _activeChain = useActiveChain()
  const activeChain = forceChain || _activeChain
  const { setBetaCW20Tokens } = useBetaCW20TokensStore()

  useEffect(
    () =>
      fillBetaValuesFromStorage(
        activeChain,
        BETA_CW20_TOKENS,
        (value) => setBetaCW20Tokens(value, activeChain),
        {},
      ),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeChain],
  )
}
