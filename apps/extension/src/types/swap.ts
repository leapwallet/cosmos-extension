import { Token } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { SkipSupportedAsset, TXN_STATUS } from '@leapwallet/elements-core'
import { Action, SkipSupportedChainData } from '@leapwallet/elements-hooks'
import {
  AxelarTransferState,
  CCTPTransferState,
  ChainTransaction,
  ContractCallWithTokenError,
  GoFastTransferState,
  HyperlaneTransferState,
  OPInitTransferState,
  SendTokenError,
  TransferAssetRelease,
  TransferState,
} from '@skip-go/client'
import BigNumber from 'bignumber.js'
import { MergedAsset } from 'pages/swaps-v2/hooks'

export type SwapTxAction = Extract<Action, { type: 'SWAP' }>
export type TransferTxAction = Extract<Action, { type: 'TRANSFER' }>
export type SendTxAction = Extract<Action, { type: 'SEND' }>

export type SourceChain = Extract<
  SkipSupportedChainData,
  { chainType: 'cosmos' | 'evm' | 'aptos' }
> & {
  key: SupportedChain
  coinType: string
  baseDenom: string
  restUrl?: string
  enabled?: boolean
}

export type SourceToken = Token & { skipAsset: MergedAsset; coinGeckoId?: string }

export type LifiTransactionState = 'NOT_FOUND' | 'INVALID' | 'PENDING' | 'DONE' | 'FAILED'
export type LifiPendingSubStatus =
  | 'WAIT_SOURCE_CONFIRMATIONS'
  | 'WAIT_DESTINATION_TRANSACTION'
  | 'BRIDGE_NOT_AVAILABLE'
  | 'CHAIN_NOT_AVAILABLE'
  | 'REFUND_IN_PROGRESS'
  | 'UNKNOWN_ERROR'

export type LifiDoneSubStatus = 'COMPLETED' | 'PARTIAL' | 'REFUNDED'

export type LifiFailedSubStatus =
  | 'NOT_PROCESSABLE_REFUND_NEEDED'
  | 'OUT_OF_GAS'
  | 'SLIPPAGE_EXCEEDED'
  | 'INSUFFICIENT_ALLOWANCE'
  | 'INSUFFICIENT_BALANCE'
  | 'UNKNOWN_ERROR'
  | 'EXPIRED'

export type LifiTransactionSubState = LifiPendingSubStatus | LifiDoneSubStatus | LifiFailedSubStatus

export interface TransferSequenceBase {
  srcChainID: string
  destChainID: string
  state: TransferState
  error?: {
    message: string
    code?: number
    type?: string
    details?: object
  } | null
}

export interface IBCPacketTxnSeq extends TransferSequenceBase {
  type: 'ibcTransfer'
  packetTxs: {
    sendTx: ChainTransaction | null
    receiveTx: ChainTransaction | null
    acknowledgeTx: ChainTransaction | null
    timeoutTx: object | null
  }
  originalState: TransferState
}

export interface CCTPPacketTxnSeq extends TransferSequenceBase {
  type: 'cctpTransfer'
  packetTxs: {
    sendTx: ChainTransaction | null
    receiveTx: ChainTransaction | null
  }
  originalState: CCTPTransferState
}

export interface LifiPacketTxnSeq extends TransferSequenceBase {
  type: 'lifiTransfer'
  packetTxs: {
    sendTx: ChainTransaction | null
    receiveTx: ChainTransaction | null
  }
  originalState: LifiTransactionSubState
}

export interface HyperlanePacketTxnSeq extends TransferSequenceBase {
  type: 'hyperlaneTransfer'
  packetTxs: {
    sendTx: ChainTransaction | null
    receiveTx: ChainTransaction | null
  }
  originalState: HyperlaneTransferState
}

export interface OPInitPacketTxnSeq extends TransferSequenceBase {
  type: 'opInitTransfer'
  packetTxs: {
    sendTx: ChainTransaction | null
    receiveTx: ChainTransaction | null
  }
  originalState: OPInitTransferState
}

export interface AxelarPacketTxnSeq extends TransferSequenceBase {
  type: 'axelarTransfer'
  packetTxs: {
    sendTx: ChainTransaction | null
    receiveTx: ChainTransaction | null
    error: ContractCallWithTokenError | SendTokenError | null
  }
  originalState: AxelarTransferState
  axelarScanLink: string
}

export interface GoFastTransferPacketTxnSeq extends TransferSequenceBase {
  type: 'goFastTransfer'
  packetTxs: {
    sendTx: ChainTransaction | null
    receiveTx: ChainTransaction | null
  }
  originalState: GoFastTransferState
}

export interface EurekaTransferPacketTxnSeq extends TransferSequenceBase {
  type: 'eurekaTransfer'
  packetTxs: {
    sendTx: ChainTransaction | null
    receiveTx: ChainTransaction | null
  }
  originalState: TransferState
}

export interface MosaicTxnSeq extends TransferSequenceBase {
  originalState: TXN_STATUS
  packetTxs: {
    sendTx: ChainTransaction | null
    receiveTx: ChainTransaction | null
  }
}

export type TransferSequence =
  | IBCPacketTxnSeq
  | CCTPPacketTxnSeq
  | AxelarPacketTxnSeq
  | HyperlanePacketTxnSeq
  | OPInitPacketTxnSeq
  | LifiPacketTxnSeq
  | GoFastTransferPacketTxnSeq
  | EurekaTransferPacketTxnSeq
  | MosaicTxnSeq

export type SwapTxnStatus = {
  status: TXN_STATUS
  responses: TransferSequence[]
  transferAssetRelease?: TransferAssetRelease
  isComplete: boolean
}

export type SwapFeeInfo = {
  feeCharged: number
  feeAmountValue: BigNumber | null
  feeCollectionAddress?: string
  swapFeeDenomInfo?: SkipSupportedAsset
}
