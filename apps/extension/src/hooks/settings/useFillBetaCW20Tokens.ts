import {
  BETA_CW20_TOKENS,
  useActiveChain,
  useBetaCW20TokensStore,
} from '@leapwallet/cosmos-wallet-hooks'
import { useEffect } from 'react'

import { fillBetaValuesFromStorage } from './fillBetaValuesFromStorage'

export function useFillBetaCW20Tokens() {
  const activeChain = useActiveChain()
  const { setBetaCW20Tokens } = useBetaCW20TokensStore()

  useEffect(
    () =>
      fillBetaValuesFromStorage(
        activeChain,
        BETA_CW20_TOKENS,
        (value) => setBetaCW20Tokens(value),
        {},
      ),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeChain],
  )
}
