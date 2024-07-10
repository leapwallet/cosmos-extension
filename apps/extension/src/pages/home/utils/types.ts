import { Token } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import BigNumber from 'bignumber.js'
import { TransactionStatus } from 'types/utility'

export interface ChainInfoProp extends ChainInfo {
  apiStatus?: boolean
}

export type InitialFaucetResp = {
  msg: string
  status: 'success' | 'fail' | null
}

export type GeneralHomeProps = {
  _allAssets: Token[]
  _allAssetsCurrencyInFiat: BigNumber
  isWalletHasFunds?: boolean
  s3IbcTokensStatus?: TransactionStatus
  nonS3IbcTokensStatus?: TransactionStatus
  nativeTokensStatus?: TransactionStatus
  cw20TokensStatus?: TransactionStatus
  erc20TokensStatus?: TransactionStatus
  refetchBalances?: () => void
  isAggregateLoading?: boolean
}
