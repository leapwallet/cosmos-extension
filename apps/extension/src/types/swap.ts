import { Token } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import type { TransferInfoJSON } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/skip-core'
import { Asset, ChainData } from '@leapwallet/elements-core'
import { SkipSupportedAsset, TXN_STATUS } from '@leapwallet/elements-core'
import { Action, SkipSupportedChainData } from '@leapwallet/elements-hooks'
import BigNumber from 'bignumber.js'

export type SwapTxAction = Extract<Action, { type: 'SWAP' }>
export type TransferTxAction = Extract<Action, { type: 'TRANSFER' }>
export type SendTxAction = Extract<Action, { type: 'SEND' }>

export type SourceChain = Extract<SkipSupportedChainData, { chainType: 'cosmos' }> & {
  key: SupportedChain
  coinType: string
  restUrl: string
}
export type SourceToken = Token & { skipAsset: SkipSupportedAsset; coinGeckoId?: string }

export type TransferInfo = Omit<TransferInfoJSON, 'from_chain_id' | 'to_chain_id'>

export type SwapTxnStatus = {
  status: TXN_STATUS
  responses: TransferInfo[]
  transferAssetRelease?: {
    released?: boolean
    chainId: string
    denom: string
  }
  isComplete: boolean
}

export type SwapFeeInfo = {
  feeCharged: number
  feeAmountValue: BigNumber | null
  feeCollectionAddress?: string
  swapFeeDenomInfo?: SkipSupportedAsset
}
