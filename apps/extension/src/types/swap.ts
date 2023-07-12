import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

export type TokenInfo = {
  id: string
  chain_id: string
  token_address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
  tags: string[]
  denom: string
  native: boolean
}

export interface fetchedTokenTypes {
  id: string
  name: string
  symbol: string
  chain_id: string
  rpc: string
  denom: string
  decimals: number
  channel: string
  juno_channel: string
  juno_denom: string
  logoURI: string
}

export type PoolsListQueryResponse = {
  base_token: TokenInfo
  pools: Array<PoolEntityType>
  poolsById: Record<string, PoolEntityType>
  name: string
  logoURI: string
  keywords: Array<string>
  tags: Record<string, { name: string; description: string }>
}

export type TokenInfoWithReward = TokenInfo & {
  rewards_address: string
}

export type PoolEntityType = {
  pool_id: string
  pool_assets: [TokenInfo, TokenInfo]
  swap_address: string
  staking_address: string
  rewards_tokens: Array<TokenInfoWithReward>
}

export type PoolMatchForSwap = {
  streamlinePoolAB?: PoolEntityType
  streamlinePoolBA?: PoolEntityType
  baseTokenAPool?: PoolEntityType
  baseTokenBPool?: PoolEntityType
}

export type TokenToTokenPriceQueryArgs = {
  matchingPools: PoolMatchForSwap
  tokenA: TokenInfo
  tokenB: TokenInfo
  amount: number
  client: CosmWasmClient
}

export type FindPoolForSwapArgs = {
  baseToken: TokenInfo
  tokenA: TokenInfo
  tokenB: TokenInfo
  poolsList: Array<PoolEntityType>
}

export type GetMatchingPoolArgs = {
  tokenA: TokenInfo
  tokenB: TokenInfo
}

export type TokenList = {
  base_token: TokenInfo
  tokens: Array<TokenInfo>
  tokensBySymbol: Map<string, TokenInfo>
}

export type UseTokenPairsPricesArgs = {
  tokenASymbol: TokenInfo['symbol']
  tokenBSymbol: TokenInfo['symbol']
  tokenAmount: number
  enabled?: boolean
  refetchInBackground?: boolean
}
