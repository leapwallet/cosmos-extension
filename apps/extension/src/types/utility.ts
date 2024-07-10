import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'

export type Dict = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string | number | symbol]: any
}

export type StrictDict<T> = {
  [key: string | number | symbol]: T
}

export type TransactionStatus = 'loading' | 'success' | 'error' | 'idle'

export type AggregatedSupportedChain = SupportedChain | typeof AGGREGATED_CHAIN_KEY
