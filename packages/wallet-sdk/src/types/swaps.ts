import { OfflineSigner } from '@cosmjs/proto-signing';
import { DeliverTxResponse, StdFee } from '@cosmjs/stargate';
import BigNumber from 'bignumber.js';

import { NativeDenom, SupportedChain } from '../constants';

export interface SwapToken {
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
  /**
   * The IBC denomination of the coin
   */
  ibcDenom?: string;
}

export type tokenToTokenPriceArgs = {
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

export type SwapTokensArgs = {
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

export type SwapTokensResult = {
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

/**
 * Contains the logic for the swap module of a chain
 */
export interface SwapModule {
  /**
   * Default swap fee in percentage
   */
  defaultSwapFee: number;
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
   * @returns The list of {@link SwapToken}s that can be used as the destination coin for a swap
   */
  getTargetCoinOptions: (oneOfPair?: string) => Promise<SwapToken[]>;
  /**
   * @returns Token A to Token B price for a given amount of Token A
   */
  getTokenToTokenPrice: (args: tokenToTokenPriceArgs) => Promise<BigNumber>;
  /**
   * @description Swaps token A for token B
   */
  swapTokens: (args: {
    swap: SwapTokensArgs;
    customFee?: {
      stdFee: StdFee;
      feeDenom: NativeDenom;
    };
    fromAddress: string;
    signer: OfflineSigner;
    rpcEndpoint: string;
    lcdEndpoint: string;
  }) => Promise<SwapTokensResult>;
  /**
   *
   */
  setDenoms: (denoms: Record<string, NativeDenom>) => void;
  /**
   * @returns The default gas amount for a swap transaction
   */
  getDefaultGasAmount: (fromTokenSymbol: string, toTokenSymbol: string) => Promise<number>;
}
