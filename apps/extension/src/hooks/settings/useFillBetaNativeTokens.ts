import {
  BETA_NATIVE_TOKENS,
  useActiveChain,
  useBetaNativeTokensStore,
} from '@leapwallet/cosmos-wallet-hooks'
import { useEffect } from 'react'

import { fillBetaValuesFromStorage } from './fillBetaValuesFromStorage'

export function useFillBetaNativeTokens() {
  const activeChain = useActiveChain()
  const { setBetaNativeTokens } = useBetaNativeTokensStore()

  useEffect(
    () =>
      fillBetaValuesFromStorage(
        activeChain,
        BETA_NATIVE_TOKENS,
        (value) => setBetaNativeTokens(value),
        {},
      ),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeChain],
  )
}
