import { Token } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  Asset,
  ChainData,
  PacketContent,
  TransactionStatusResponse,
  TRANSFER_STATE,
  TXN_STATUS,
} from '@leapwallet/elements-core'
import { Action } from '@leapwallet/elements-hooks'

export type SwapTxAction = Extract<Action, { type: 'SWAP' }>
export type TransferTxAction = Extract<Action, { type: 'TRANSFER' }>
export type SendTxAction = Extract<Action, { type: 'SEND' }>

export type SourceChain = ChainData & { key: SupportedChain; coinType: string; restUrl: string }
export type SourceToken = Token & { skipAsset: Asset; coinGeckoId?: string }

export type TransferInfo = Omit<
  Extract<
    TransactionStatusResponse['transfer_sequence'][number],
    { ibc_transfer: unknown }
  >['ibc_transfer'],
  'from_chain_id' | 'to_chain_id'
>

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
