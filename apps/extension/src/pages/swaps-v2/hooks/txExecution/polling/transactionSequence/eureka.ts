import { EurekaTransferInfoJSON } from '@skip-go/client'
import { EurekaTransferPacketTxnSeq } from 'types/swap'

import { convertPacketFromJSON } from './convertPackageFromJson'

export function getEurekaTransactionSequence(
  transferInfo: EurekaTransferInfoJSON,
): EurekaTransferPacketTxnSeq {
  return {
    type: 'eurekaTransfer' as const,
    srcChainID: transferInfo.from_chain_id,
    destChainID: transferInfo.to_chain_id,
    packetTxs: {
      sendTx: convertPacketFromJSON(transferInfo.packet_txs.send_tx),
      receiveTx: convertPacketFromJSON(transferInfo.packet_txs.receive_tx),
    },
    state: transferInfo.state,
    originalState: transferInfo.state,
  }
}
