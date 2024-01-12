import React, { createContext, useContext } from 'react'
import { assert } from 'utils/assert'

import { SwapsTxType, useSwapsTx } from '../hooks'

export const SwapContext = createContext<SwapsTxType | null>(null)

export function SwapContextProvider({ children }: { children: React.ReactNode }) {
  const value = useSwapsTx()

  return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>
}

export function useSwapContext() {
  const context = useContext(SwapContext)
  assert(context !== null, 'useSwapContext must be used within SwapContextProvider')
  return context
}
