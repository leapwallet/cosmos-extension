/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  LifiTrackerResponse,
  LifiTransactionStatus,
  TRANSFER_STATE,
  TXN_STATUS,
} from '@leapwallet/elements-core'
import { LifiPacketTxnSeq, LifiTransactionSubState } from 'types/swap'

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
  const cleanTransferSequence: LifiPacketTxnSeq = {
    type: 'lifiTransfer',
    srcChainID: res.sending.chainId.toString(),
    destChainID: res.receiving.chainId.toString(),
    packetTxs: {
      sendTx: {
        chainID: res.sending.chainId.toString(),
        txHash: res.sending.txHash,
        explorerLink: res.lifiExplorerLink,
      },
      receiveTx: {
        chainID: res.receiving.chainId.toString(),
        txHash: res.receiving.txHash,
        explorerLink: res.lifiExplorerLink,
      },
    },
    state: convertLifiStatusToTransferState(res.status, res.substatus),
    originalState: (res.substatus ?? 'UNKNOWN_ERROR') as LifiTransactionSubState,
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
  }

  return cleanTransferSequence
}
