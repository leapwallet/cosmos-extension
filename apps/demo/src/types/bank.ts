export type IbcChainInfo = {
  pretty_name: string
  icon: string
  name: string
  channelId: string
}

export type Token = {
  symbol: string
  coinMinimalDenom: string
  amount: string
  usdValue?: string
  percentChange?: number
  img: string
  ibcDenom?: string
  ibcChainInfo?: IbcChainInfo
  usdPrice?: string
  coinDecimals?: number
}

export type TransactionToken = {
  img: string
  symbol: string
  ibcChainInfo?: IbcChainInfo
}

export type Delegation = {
  delegator_address: string
  validator_address: string
}

export type DelegationBalance = {
  amount: string
}

export type Delegations = Record<string, { delegation: Delegation; balance: DelegationBalance }>
