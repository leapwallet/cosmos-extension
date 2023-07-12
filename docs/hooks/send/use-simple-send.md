# `useSimpleSend`

This is a React hook that returns an object with properties and methods to send perform a send/ibc transaction.

### Definition

```ts
const useSimpleSend: () => {
  showLedgerPopup: boolean;
  sendTokens: ({ toAddress, selectedToken, fees, amount, getWallet, memo, }: sendTokensParams) => Promise<sendTokensReturnType>;
  isSending: boolean;
}
```

### Parameters

- showLedgerPopup - Whether to show the ledger popup.
- sendTokens: `({ toAddress, selectedToken, fees, amount, getWallet, memo, }: sendTokensParams) => Promise<sendTokensReturnType>` - The function to send tokens.
- isSending - Whether the user is sending tokens.

### Usage
