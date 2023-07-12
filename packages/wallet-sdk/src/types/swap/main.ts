import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { StdFee } from '@cosmjs/stargate';

import { TokenInfo } from './';

// directTokenSwaps.ts
export type DirectTokenSwapArgs = {
  swapDirection: 'tokenAtoTokenB' | 'tokenBtoTokenA';
  tokenAmount: number;
  price: number;
  slippage: number;
  senderAddress: string;
  swapAddress: string;
  tokenA: TokenInfo;
  fee: StdFee | 'auto' | number;
};

// passThroughTokenSwap.ts
export type PassThroughTokenSwapArgs = {
  tokenAmount: number;
  price: number;
  slippage: number;
  senderAddress: string;
  swapAddress: string;
  outputSwapAddress: string;
  tokenA: TokenInfo;
  fee: StdFee | 'auto' | number;
};
