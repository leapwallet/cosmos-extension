# `getValidatorsList`

Get the list of validators

## Definition

```ts
function getValidatorsList(chain: SupportedChain, isTestnet: boolean): Promise<Validator[]>
```

- `chain` - the chain id
- `isTestnet` - if the current network is testnet
- [`Validator`](../types/validators.md#validators)

## Usage

```ts
async function checkIBCSupport() {
  const validators = await getValidatorsList('cosmoshub', true);
  console.log(validators)
}
```
