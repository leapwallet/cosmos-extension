import { CCTPTransferInfoJSON, CCTPTransferState, TransferState } from '@skip-go/client'
import { CCTPPacketTxnSeq } from 'types/swap'

import { convertPacketFromJSON } from './convertPackageFromJson'

export function convertCCTPTransferState(state: CCTPTransferState): TransferState {
  switch (state) {
    case 'CCTP_TRANSFER_SENT':
      return 'TRANSFER_PENDING'
    case 'CCTP_TRANSFER_PENDING_CONFIRMATION':
      return 'TRANSFER_PENDING'
    case 'CCTP_TRANSFER_CONFIRMED':
      return 'TRANSFER_PENDING'
    case 'CCTP_TRANSFER_RECEIVED':
      return 'TRANSFER_SUCCESS'
    default:
      return 'TRANSFER_FAILURE'
  }
}

export function getCCTPTransactionSequence(transferInfo: CCTPTransferInfoJSON): CCTPPacketTxnSeq {
  const cctpState: TransferState = convertCCTPTransferState(transferInfo.state)

  return {
    type: 'cctpTransfer' as const,
    srcChainID: transferInfo.src_chain_id,
    destChainID: transferInfo.dst_chain_id,
    packetTxs: {
      sendTx: convertPacketFromJSON(transferInfo.txs.send_tx),
      receiveTx: convertPacketFromJSON(transferInfo.txs.receive_tx),
    },
    state: cctpState,
    originalState: transferInfo.state,
  }
}
