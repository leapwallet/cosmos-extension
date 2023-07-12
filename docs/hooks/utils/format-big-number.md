# `formatBigNumber`

Format a big number value to display as a monetary value (without the currency symbol).

## Definition

```ts
function formatBigNumber(bn: BigNumber): string
```

- `bn` [BigNumber](https://mikemcl.github.io/bignumber.js/) - the big number to format
- returns `string`

## Usage

```ts
const formatted = formatBigNumber(new BigNumber(123.456));
console.log(formatted); // 123.456
```
