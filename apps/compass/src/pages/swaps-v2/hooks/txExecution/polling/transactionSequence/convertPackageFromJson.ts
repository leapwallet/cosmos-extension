import { PacketContent } from '@leapwallet/elements-core'
import { ChainTransaction } from '@skip-go/client'

export const convertPacketFromJSON = (p: PacketContent | null): ChainTransaction | null => {
  if (!p) return null

  return {
    chainID: p.chain_id,
    txHash: p.tx_hash,
    explorerLink: p.explorer_link ?? '',
  }
}
