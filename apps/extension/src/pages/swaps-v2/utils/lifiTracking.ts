/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ChainTransactionJSON } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/skip-core/lifecycle'
import {
  LifiTrackerResponse,
  LifiTransactionDetails,
  LifiTransactionStatus,
  TRANSFER_STATE,
  TXN_STATUS,
} from '@leapwallet/elements-core'
import { TransferInfo } from 'types/swap'

const LifiPacketFromJSON = (
  p: LifiTransactionDetails | null,
  lifiExplorerLink: string,
): ChainTransactionJSON | null => {
  if (!p) return null

  return {
    chain_id: p.chainId.toString(),
    tx_hash: p.txHash,
    explorer_link: lifiExplorerLink,
  }
}

export function convertLifiErrorToDisplayError(
  status: LifiTransactionStatus,
  substatus?: string,
  substatusMessage?: string,
) {
  if (status === 'DONE' && substatus === 'COMPLETED') {
    return undefined
  }

  return substatusMessage
}

export function convertLifiStatusToTxnStatus(
  status?: LifiTransactionStatus,
  substatus?: string,
): TXN_STATUS {
  if (!status) {
    return TXN_STATUS.PENDING
  }

  if (status === 'PENDING') {
    return TXN_STATUS.PENDING
  }

  if (status === 'DONE' && substatus === 'COMPLETED') {
    return TXN_STATUS.SUCCESS
  }

  return TXN_STATUS.FAILED
}

export function convertLifiStatusToTransferState(
  status?: LifiTransactionStatus,
  substatus?: string,
): TRANSFER_STATE {
  if (!status) {
    return TRANSFER_STATE.TRANSFER_PENDING
  }

  if (status === 'PENDING') {
    return TRANSFER_STATE.TRANSFER_PENDING
  }

  if (status === 'DONE' && substatus === 'COMPLETED') {
    return TRANSFER_STATE.TRANSFER_SUCCESS
  }

  return TRANSFER_STATE.TRANSFER_FAILURE
}

export function getLifiTransferSequence(res: LifiTrackerResponse) {
  const state = convertLifiStatusToTxnStatus(res.status, res.substatus)
  const displayError = convertLifiErrorToDisplayError(
    res.status,
    res.substatus,
    res.substatusMessage,
  )
  const cleanTransferSequence: TransferInfo = {
    src_chain_id: res.sending.chainId.toString(),
    dst_chain_id: res.receiving.chainId.toString(),
    packet_txs: {
      send_tx: LifiPacketFromJSON(res.sending, res.lifiExplorerLink),
      receive_tx: LifiPacketFromJSON(res.receiving, res.lifiExplorerLink),
      acknowledge_tx: null,
      timeout_tx: null,
      error:
        state === TXN_STATUS.FAILED
          ? {
              code: 0,
              message: displayError ?? 'Transaction failed',
              type: 'PACKET_ERROR_UNKNOWN',
              details: {
                acknowledgementError: {
                  code: 0,
                  message: displayError ?? 'Transaction failed',
                },
              },
            }
          : null,
    },
    state: convertLifiStatusToTransferState(res.status, res.substatus),
  }

  return cleanTransferSequence
}
