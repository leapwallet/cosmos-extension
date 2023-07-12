# Types - Swaps

## SwapToken

This is an interface that needs to be satisfied by an object that represents a coin in a swap.

```ts
interface SwapToken {
  /**
   * The symbol of the coin - e.g. ATOM, JUNO, OSMO, etc.
   */
  symbol: string;
  /**
   * The URL for the image of the coin
   */
  image: string;
  /**
   * The denom of the coin - e.g. uatom, ujuno, uosmo, etc.
   */
  denom: string;
}
```

## tokenToTokenPriceArgs

```ts
type tokenToTokenPriceArgs = {
  /**
   * The symbol of the token to swap from
   */
  tokenASymbol: string;
  /**
   * The symbol of the token to swap to
   */
  tokenBSymbol: string;
  /**
   * The amount of token A to swap
   */
  tokenAmount: number;
};
```

## SwapTokenArgs

```ts
type SwapTokensArgs = {
  /**
   * The symbol of the token to swap from
   */
  fromTokenSymbol: string;
  /**
   * The symbol of the token to swap to
   */
  targetTokenSymbol: string;
  /**
   * The amount of token A to give
   */
  fromTokenAmount: string;
  /**
   * The amount of token B to receive
   */
  targetTokenAmount: string;
  /**
   * The slippage tolerance for the swap 1-5
   * 1 = 1%
   * 5 = 5%
   */
  slippage: number;
};
```

## SwapTokenResult

```ts
type SwapTokensResult = {
  // raw response object
  pollPromise: Promise<DeliverTxResponse>;
  // tx hash
  txHash: string;
  // the tx type URL for the transaction
  txType: string;
  // Tx fee
  fees: {
    amount: string;
    denom: string;
  };
  data: {
    // ID/Address of the liquidity pool that the swap was executed on
    liquidityPool: string;
    // name of the DEX that the swap was executed on
    dexName: string;
    fromToken: {
      // amount as a string in minimal denom
      amount: string;
      // minimal denom of the token
      denom: string;
    };
    toToken: {
      // amount as a string in minimal denom
      amount: string;
      // minimal denom of the token
      denom: string;
    };
  };
};
```

## SwapModule

To enable support for a new swap provider on a chain, a new swap module needs to be created that satisfies the following interface.

```ts
interface SwapModule {
  /**
   * The chain that this swap module is for
   */
  chain: SupportedChain;
  /**
   * Name of the Swap Provider that powers the swap module
   */
  via: string;
  /**
   * @description Get the usd price of a token
   */
  getTokenUsdPrice: (denom: string) => Promise<BigNumber>;
  /**
   * @returns The list of {@link Coin}s that can be used as the destination coin for a swap
   */
  getTargetCoinOptions: (oneOfPair?: string) => Promise<Coin[]>;
  /**
   * @returns Token A to Token B price for a given amount of Token A
   */
  getTokenToTokenPrice: (args: tokenToTokenPriceArgs) => Promise<BigNumber>;
  /**
   * @description Swaps token A for token B
   */
  swapTokens: (
    args: SwapTokensArgs,
    fromAddress: string,
    signer: OfflineSigner,
    rpcEndpoint: string,
    lcdEndpoint: string,
  ) => Promise<SwapTokensResult>;
}
```

> Note: `BigNumber` is a class from the `bignumber.js` (v9.0.2) library. It is used to represent large numbers in a way that is safe for arithmetic operations.
