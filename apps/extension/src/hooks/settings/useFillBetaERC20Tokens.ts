import {
  BETA_ERC20_TOKENS,
  useActiveChain,
  useBetaERC20TokensStore,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useEffect } from 'react'

import { fillBetaValuesFromStorage } from './fillBetaValuesFromStorage'

export function useFillBetaERC20Tokens(forceChain?: SupportedChain) {
  const _activeChain = useActiveChain()
  const activeChain = forceChain || _activeChain
  const { setBetaERC20Tokens } = useBetaERC20TokensStore()

  useEffect(
    () =>
      fillBetaValuesFromStorage(
        activeChain,
        BETA_ERC20_TOKENS,
        (value) => setBetaERC20Tokens(value, activeChain),
        {},
      ),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeChain],
  )
}
