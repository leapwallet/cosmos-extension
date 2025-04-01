import { TXN_STATUS } from '@leapwallet/elements-core'
import { StatusState } from '@skip-go/client'

export function convertSkipStatusToTxnStatus(state: StatusState): TXN_STATUS {
  switch (state) {
    case 'STATE_COMPLETED':
    case 'STATE_COMPLETED_SUCCESS':
      return TXN_STATUS.SUCCESS
    case 'STATE_COMPLETED_ERROR':
    case 'STATE_PENDING_ERROR':
    case 'STATE_ABANDONED':
      return TXN_STATUS.FAILED
    case 'STATE_SUBMITTED':
    case 'STATE_PENDING':
    case 'STATE_RECEIVED':
    case 'STATE_UNKNOWN':
    default:
      return TXN_STATUS.PENDING
  }
}
