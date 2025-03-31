import { HyperlaneTransferInfoJSON, HyperlaneTransferState, TransferState } from '@skip-go/client'
import { HyperlanePacketTxnSeq } from 'types/swap'

import { convertPacketFromJSON } from './convertPackageFromJson'

export function convertHyperlaneTransferState(state: HyperlaneTransferState): TransferState {
  switch (state) {
    case 'HYPERLANE_TRANSFER_SENT':
      return 'TRANSFER_PENDING'
    case 'HYPERLANE_TRANSFER_FAILED':
      return 'TRANSFER_FAILURE'
    case 'HYPERLANE_TRANSFER_RECEIVED':
      return 'TRANSFER_SUCCESS'
    case 'HYPERLANE_TRANSFER_UNKNOWN':
      return 'TRANSFER_UNKNOWN'
    default:
      return 'TRANSFER_UNKNOWN'
  }
}

export function getHyperlaneTransactionSequence(
  transferInfo: HyperlaneTransferInfoJSON,
): HyperlanePacketTxnSeq {
  const hyperlaneState: TransferState = convertHyperlaneTransferState(transferInfo.state)

  return {
    type: 'hyperlaneTransfer' as const,
    srcChainID: transferInfo.from_chain_id,
    destChainID: transferInfo.to_chain_id,
    packetTxs: {
      sendTx: convertPacketFromJSON(transferInfo.txs.send_tx),
      receiveTx: convertPacketFromJSON(transferInfo.txs.receive_tx),
    },
    state: hyperlaneState,
    originalState: transferInfo.state,
  }
}
