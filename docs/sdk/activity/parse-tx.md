# `parseTx`

Parses a transaction and returns typed data.

## Definition

```ts
function parseTx(txn: RawTxData): TypedParsedTx
```

- `txn` [RawTxData](../types/activity.md#rawtxdata)
- returns [TypedParsedTx](../types/activity.md#typedparsedtx)

## Usage

```ts
async function getCosmoshubData() {
  const data = await getChainInfo('cosmoshub');
  console.log(data)
}
```
