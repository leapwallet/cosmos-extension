import { OPInitTransferInfoJSON, OPInitTransferState, TransferState } from '@skip-go/client'
import { OPInitPacketTxnSeq } from 'types/swap'

import { convertPacketFromJSON } from './convertPackageFromJson'

export function convertOPInitTransferState(state: OPInitTransferState): TransferState {
  switch (state) {
    case 'OPINIT_TRANSFER_SENT':
      return 'TRANSFER_PENDING'
    case 'OPINIT_TRANSFER_RECEIVED':
      return 'TRANSFER_SUCCESS'
    case 'OPINIT_TRANSFER_UNKNOWN':
      return 'TRANSFER_UNKNOWN'
    default:
      return 'TRANSFER_UNKNOWN'
  }
}

export function getOPInitTransactionSequence(
  transferInfo: OPInitTransferInfoJSON,
): OPInitPacketTxnSeq {
  const opInitState: TransferState = convertOPInitTransferState(transferInfo.state)

  return {
    type: 'opInitTransfer' as const,
    srcChainID: transferInfo.from_chain_id,
    destChainID: transferInfo.to_chain_id,
    packetTxs: {
      sendTx: convertPacketFromJSON(transferInfo.txs.send_tx),
      receiveTx: convertPacketFromJSON(transferInfo.txs.receive_tx),
    },
    state: opInitState,
    originalState: transferInfo.state,
  }
}
