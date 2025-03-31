import { TransferInfoJSON } from '@skip-go/client'
import { IBCPacketTxnSeq } from 'types/swap'

import { convertPacketFromJSON } from './convertPackageFromJson'

export function getIBCTransactionSequence(transferInfo: TransferInfoJSON): IBCPacketTxnSeq {
  return {
    type: 'ibcTransfer' as const,
    srcChainID: transferInfo.src_chain_id,
    destChainID: transferInfo.dst_chain_id,
    packetTxs: {
      sendTx: convertPacketFromJSON(transferInfo.packet_txs.send_tx),
      receiveTx: convertPacketFromJSON(transferInfo.packet_txs.receive_tx),
      acknowledgeTx: convertPacketFromJSON(transferInfo.packet_txs.acknowledge_tx),
      timeoutTx: transferInfo.packet_txs.timeout_tx,
    },
    state: transferInfo.state,
    originalState: transferInfo.state,
    error: transferInfo.packet_txs.error,
  }
}
