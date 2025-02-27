import { AxelarTransferInfoJSON, AxelarTransferState, TransferState } from '@skip-go/client'
import { AxelarPacketTxnSeq } from 'types/swap'

import { convertPacketFromJSON } from './convertPackageFromJson'

export function convertAxelarTransferState(state: AxelarTransferState): TransferState {
  switch (state) {
    case 'AXELAR_TRANSFER_PENDING_RECEIPT':
      return 'TRANSFER_PENDING'
    case 'AXELAR_TRANSFER_PENDING_CONFIRMATION':
      return 'TRANSFER_PENDING'
    case 'AXELAR_TRANSFER_FAILURE':
      return 'TRANSFER_FAILURE'
    case 'AXELAR_TRANSFER_SUCCESS':
      return 'TRANSFER_SUCCESS'
    default:
      return 'TRANSFER_UNKNOWN'
  }
}

export function getAxelarTransactionSequence(
  transferInfo: AxelarTransferInfoJSON,
): AxelarPacketTxnSeq {
  const axelarState: TransferState = convertAxelarTransferState(transferInfo.state)

  if ('contract_call_with_token_txs' in transferInfo.txs) {
    return {
      type: 'axelarTransfer' as const,
      axelarScanLink: transferInfo.axelar_scan_link,
      srcChainID: transferInfo.src_chain_id,
      destChainID: transferInfo.dst_chain_id,
      packetTxs: {
        sendTx: convertPacketFromJSON(transferInfo.txs.contract_call_with_token_txs.send_tx),
        receiveTx: convertPacketFromJSON(transferInfo.txs.contract_call_with_token_txs.execute_tx),
        error: transferInfo.txs.contract_call_with_token_txs.error,
      },
      state: axelarState,
      originalState: transferInfo.state,
    }
  }

  return {
    type: 'axelarTransfer' as const,
    axelarScanLink: transferInfo.axelar_scan_link,
    srcChainID: transferInfo.src_chain_id,
    destChainID: transferInfo.dst_chain_id,
    packetTxs: {
      sendTx: convertPacketFromJSON(transferInfo.txs.send_token_txs.send_tx),
      receiveTx: convertPacketFromJSON(transferInfo.txs.send_token_txs.execute_tx),
      error: transferInfo.txs.send_token_txs.error,
    },
    state: axelarState,
    originalState: transferInfo.state,
  }
}
