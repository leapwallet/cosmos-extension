# Active Chain Hooks

## `useActiveChain`

Get the currently active chain's chain ID

## Definition

```ts
function useActiveChain(): SupportedChain
```

- [`SupportedChain`](../../sdk/constants/chain-info.md#type-supportedchain)

## Usage

```tsx
function CurrentChainComponent() {
  const activeChain = useActiveChain()

  return (
    <div>
      <p>The currently active chain is - {activeChain}</p>
    </div>
  )
}
```
