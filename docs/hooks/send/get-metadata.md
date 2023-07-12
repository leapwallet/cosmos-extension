# Get Metadata

## `getMetadataForIBCTx`

Get the metadata for an IBC transaction

## Definition

```ts
function getMetaDataForIbcTx(
  sourceChannel: string,
  toAddress: string,
  token: { amount: string; denom: string },
): {
  sourceChannel: string
  toChain: string
  toAddress: string
  token: { amount: string; denom: string }
}
```

## Usage

```tsx
function IbcTxComponent() {
  const { sourceChannel, toAddress, token } = getMetaDataForIbcTx(
    'channel-0',
    'cosmos1...',
    { amount: '100', denom: 'uatom' },
  )

  return (
    <div>
      <p>Source Channel - {sourceChannel}</p>
      <p>To Address - {toAddress}</p>
      <p>Token - {token.amount} {token.denom}</p>
    </div>
  )
}
```

## `getMetadataForTx`

Get the metadata for a send transaction

## Definition

```ts
function getMetaDataForSendTx(toAddress: string, token: { amount: string; denom: string }): {
  toAddress: string
  token: { amount: string; denom: string }
}
```

## Usage

```tsx
function SendTxComponent() {
  const { toAddress, token } = getMetaDataForSendTx('cosmos1...', { amount: '100', denom: 'uatom' })

  return (
    <div>
      <p>To Address - {toAddress}</p>
      <p>Token - {token.amount} {token.denom}</p>
    </div>
  )
}
```

