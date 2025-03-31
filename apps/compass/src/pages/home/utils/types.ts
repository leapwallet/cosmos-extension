import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'

export interface ChainInfoProp extends ChainInfo {
  apiStatus?: boolean
}

export type InitialFaucetResp = {
  msg: string
  status: 'success' | 'fail' | null
}
