import { Token } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  Asset,
  ChainData,
  PacketContent,
  TRANSFER_STATE,
  TXN_STATUS,
} from '@leapwallet/elements-core'
import BigNumber from 'bignumber.js'

export type SwapTxAction = {
  chain: string
  destinationAsset: string
  sourceAsset: string
  transactionNumber: number
  type: 'SWAP'
  venue: string
}

export type TransferTxAction = {
  type: 'SEND' | 'TRANSFER'
  asset: string
  sourceChain: string
  fromAddress: string
  toAddress: string
  destinationChain: string
  amount: string | BigNumber
}

export type SourceChain = ChainData & { key: SupportedChain; coinType: string; restUrl: string }
export type SourceToken = Token & { skipAsset: Asset; coinGeckoId?: string }

type Packet = {
  send_tx: PacketContent
  receive_tx: PacketContent | null
  acknowledge_tx: PacketContent | null
  timeout_tx: object | null
  error: object | null
}

export type TransferInfo = {
  src_chain_id: string
  dst_chain_id: string
  state: TRANSFER_STATE
  packet_txs: Packet
}

export type SwapTxnStatus = {
  status: TXN_STATUS
  responses: TransferInfo[]
  isComplete: boolean
}
