# `getChainInfo`

Gets the information of a chain from coingecko

## Definition

```ts
function getChainInfo(chain: string, testnet?: boolean): Promise<ChainData>
```

- `sourceChain` - the coingecko chain ID
- `testnet` - if the current network is testnet
  - default value - `false`
- [`ChainData`](../types/chains-metadata.md#chaindata)

## Usage

```ts
async function getCosmoshubData() {
  const data = await getChainInfo('cosmoshub');
  console.log(data)
}
```
