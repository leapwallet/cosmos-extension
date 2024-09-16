import {
  ActiveChainStore,
  AutoFetchedCW20DenomsStore,
  BetaCW20DenomsStore,
  CW20DenomBalanceStore,
  CW20DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
  RootBalanceStore,
  RootDenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import { observer } from 'mobx-react-lite'
import React, { createContext, useContext } from 'react'
import { assert } from 'utils/assert'

import { SwapsTxType, useSwapsTx } from '../hooks'

export const SwapContext = createContext<SwapsTxType | null>(null)

export const SwapContextProvider = observer(
  ({
    children,
    rootDenomsStore,
    rootBalanceStore,
    activeChainStore,
    autoFetchedCW20DenomsStore,
    betaCW20DenomsStore,
    cw20DenomsStore,
    disabledCW20DenomsStore,
    enabledCW20DenomsStore,
    cw20DenomBalanceStore,
  }: {
    children: React.ReactNode
    rootDenomsStore: RootDenomsStore
    rootBalanceStore: RootBalanceStore
    activeChainStore: ActiveChainStore
    autoFetchedCW20DenomsStore: AutoFetchedCW20DenomsStore
    betaCW20DenomsStore: BetaCW20DenomsStore
    cw20DenomsStore: CW20DenomsStore
    disabledCW20DenomsStore: DisabledCW20DenomsStore
    enabledCW20DenomsStore: EnabledCW20DenomsStore
    cw20DenomBalanceStore: CW20DenomBalanceStore
  }) => {
    const value = useSwapsTx({
      rootDenomsStore,
      activeChainStore,
      rootBalanceStore,
      autoFetchedCW20DenomsStore,
      betaCW20DenomsStore,
      cw20DenomsStore,
      disabledCW20DenomsStore,
      enabledCW20DenomsStore,
      cw20DenomBalanceStore,
    })

    return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>
  },
)

export function useSwapContext() {
  const context = useContext(SwapContext)
  assert(context !== null, 'useSwapContext must be used within SwapContextProvider')
  return context
}
