export type IbcChainInfo = {
  pretty_name: string
  icon: string
  name: string
  channelId: string
}

export type Token = {
  name?: string
  chain?: string
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
