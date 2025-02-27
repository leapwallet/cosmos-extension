import { GoFastTransferInfoJSON, GoFastTransferState, TransferState } from '@skip-go/client'
import { GoFastTransferPacketTxnSeq } from 'types/swap'

import { convertPacketFromJSON } from './convertPackageFromJson'

export function convertGoGasTransferState(state: GoFastTransferState): TransferState {
  switch (state) {
    case 'GO_FAST_TRANSFER_SENT':
      return 'TRANSFER_PENDING'
    case 'GO_FAST_POST_ACTION_FAILED':
      return 'TRANSFER_FAILURE'
    case 'GO_FAST_TRANSFER_FILLED':
      return 'TRANSFER_SUCCESS'
    case 'GO_FAST_TRANSFER_UNKNOWN':
      return 'TRANSFER_UNKNOWN'
    default:
      return 'TRANSFER_FAILURE'
  }
}

export function getGoFastTransactionSequence(
  transferInfo: GoFastTransferInfoJSON,
): GoFastTransferPacketTxnSeq {
  const goFastTransferState: TransferState = convertGoGasTransferState(transferInfo.state)

  return {
    type: 'goFastTransfer' as const,
    srcChainID: transferInfo.from_chain_id,
    destChainID: transferInfo.to_chain_id,
    packetTxs: {
      sendTx: convertPacketFromJSON(transferInfo.txs.order_submitted_tx),
      receiveTx: convertPacketFromJSON(transferInfo.txs.order_filled_tx),
    },
    state: goFastTransferState,
    originalState: transferInfo.state,
  }
}
