import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';

export type TokenInfo = {
  id: string;
  chain_id: string;
  token_address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  tags: string[];
  denom: string;
  native: boolean;
};

export type TokenInfoWithReward = TokenInfo & {
  rewards_address: string;
};

export type PoolEntityType = {
  pool_id: string;
  pool_assets: [TokenInfo, TokenInfo];
  swap_address: string;
  staking_address: string;
  rewards_tokens: Array<TokenInfoWithReward>;
};

export type PoolsListQueryResponse = {
  base_token: TokenInfo;
  pools: Array<PoolEntityType>;
  poolsById: Record<string, PoolEntityType>;
  name: string;
  logoURI: string;
  keywords: Array<string>;
  tags: Record<string, { name: string; description: string }>;
};

export type PoolMatchForSwap = {
  streamlinePoolAB?: PoolEntityType;
  streamlinePoolBA?: PoolEntityType;
  baseTokenAPool?: PoolEntityType;
  baseTokenBPool?: PoolEntityType;
};

// utils/token-conversion/services/swap.ts
export interface GetToken1ForToken2PriceInput {
  nativeAmount: number;
  swapAddress: string;
  client: CosmWasmClient;
}

export interface GetToken2ForToken1PriceInput {
  tokenAmount: number;
  swapAddress: string;
  client: CosmWasmClient;
}

export interface GetTokenForTokenPriceInput {
  tokenAmount: number;
  swapAddress: string;
  outputSwapAddress: string;
  client: CosmWasmClient;
}

export type InfoResponse = {
  lp_token_supply: string;
  lp_token_address: string;
  token1_denom: string;
  token1_reserve: string;
  token2_denom: string;
  token2_reserve: string;
};

export type TokenToTokenPriceQueryArgs = {
  matchingPools: PoolMatchForSwap;
  tokenA: TokenInfo;
  tokenB: TokenInfo;
  amount: number;
  client: CosmWasmClient;
};
