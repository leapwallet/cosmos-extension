# `useSwapModule`

Hook to access the swap module with UI logic.

## Definition

```ts
function useSwapModule(
  args: {
    chain: SupportedChain,
    rpcUrl: string,
    lcdUrl: string,
    getWallet: (chain: string) => Promise<OfflineSigner>
  } 
): SwapModule
```

- chain [`SupportedChain`](../../sdk/constants/chain-info.md#type-supportedchain) - active chain ID
- rpcUrl `string` - RPC URL for the active chain
- lcdUrl `string` - LCD URL for the active chain (Rest Endpoint)
- getWallet `(chain: string) => Promise<OfflineSigner>` - function to get the wallet for the active chain
- returns [`SwapModule`](../../sdk/types/swaps.md#swapmodule)

## Usage

```tsx
const SwapContext = createContext<ReturnType<typeof useSwapModule> | null>(null)

/**
 * SwapProvider is a context provider that provides the swap module for the given chain.
 */
export const SwapProvider: React.FC<SwapProviderProps> = ({ chain, children }) => {
  const { rpcUrl, lcdUrl } = useRpcUrl(chain)
  const getWallet = Wallet.useGetWallet()
  const swapModule = useSwapModule({ chain, rpcUrl, lcdUrl, getWallet })

  return <SwapContext.Provider value={swapModule}>{children}</SwapContext.Provider>
}

/**
 * Use this context to access the state variables and actions for the swap module of the currently
 * active chain. This returns a tuple [state, actions].
 */
export const useSwapContext = () => {
  return useContext(SwapContext)
}
```