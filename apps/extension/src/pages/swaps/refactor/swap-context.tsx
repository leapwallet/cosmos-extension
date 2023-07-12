import { useChainApis, useSwapModule } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { createContext, useContext } from 'react'

import { SwapProviderProps } from './types'

const SwapContext = createContext<ReturnType<typeof useSwapModule> | null>(null)

/**
 * SwapProvider is a context provider that provides the swap module for the given chain.
 */
export const SwapProvider: React.FC<SwapProviderProps> = ({ chain, children }) => {
  const { rpcUrl, lcdUrl } = useChainApis(chain)
  const getWallet = Wallet.useGetWallet()
  const swapModule = useSwapModule({
    chain,
    rpcUrl: rpcUrl ?? '',
    lcdUrl: lcdUrl ?? '',
    getWallet: (chain) => getWallet(chain as SupportedChain),
  })

  return <SwapContext.Provider value={swapModule}>{children}</SwapContext.Provider>
}

/**
 * Use this context to access the state variables and actions for the swap module of the currently
 * active chain. This returns a tuple [state, actions].
 */
export const useSwapContext = (): ReturnType<typeof useSwapModule> => {
  const swapContext = useContext(SwapContext)
  if (!swapContext) {
    throw new Error('SwapContext not found, make sure you are using SwapProvider')
  }
  return swapContext
}
