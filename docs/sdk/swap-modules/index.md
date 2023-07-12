# `getSwapModule`

Get the swap module for a given chain and swap provider.

## Definition

```ts
function getSwapModule(chain: SupportedChain): SwapModule
```

- `chain` [SupportedChain](../constants/chain-info.md#type-supportedchain) - the chain to get the swap module for
- returns [`SwapModule`](../types/swaps.md#swapmodule)

## Usage

```ts
async function getOsmosisSwapModule() {
  const osmosisSwapper = getSwapModule('osmosis');
}
```
