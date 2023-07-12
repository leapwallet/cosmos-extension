# Wallet Generation

## `createMnemonic`

Creates and returns a mnemonic of 12 or 24 words

### Definition

```ts
function createMnemonic(numberOfWords: 12 | 24 = 24): string
```

### Usage

```ts
const mnemonic = createMnemonic(12)
```

## `generatePrivateKeyFromHdPath`

Generates a private key from a mnemonic and a derivation path

### Definition

```ts
function generatePrivateKeyFromHdPath(mnemonic: string, hdPath: string): Promise<string>
```

### Usage

```ts
const mnemonic = createMnemonic(12)

const privateKey = await generatePrivateKeyFromHdPath(mnemonic, "m/44'/118'/0'/0'/0")

console.log(privateKey)
```
