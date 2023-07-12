# `useSend`

This is a React hook that returns an object with properties and methods to send perform a send/ibc transaction.

### Definition

```ts
function useSend(toAddress: string): {
  inputAmount: string;
  setInputAmount: React.Dispatch<React.SetStateAction<string>>;
  selectedDenom: Token | undefined;
  feeUsdValue: string;
  inputUsdValue: string;
  setSelectedDenom: React.Dispatch<React.SetStateAction<Token | undefined>>;
  address: string;
  toAddress: string;
  fees: StdFee | undefined;
  setFees: React.Dispatch<React.SetStateAction<StdFee | undefined>>;
  memo: string;
  setMemo: React.Dispatch<React.SetStateAction<string>>;
  simulateSend: () => Promise<void>;
  confirmSend: (wallet: OfflineSigner, callback: TxCallback, memo?: string) => Promise<void>;
  balances: Token[];
  error: string | undefined;
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  isLoading: boolean;
  loading: boolean;
  showLedgerPopup: boolean;
  signingError: string | undefined;
  sendSnip20: (wallet: Wallet, callback: TxCallback, _txHandler?: SigningSscrt) => Promise<void>;
}
```

### Parameters

- `toAddress` - The address to send the tokens to.

### Usage
