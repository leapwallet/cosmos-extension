import { MessageTypes } from 'config/message-types'
import { NavigateFunction } from 'react-router-dom'
import { isSidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

export async function handleRejectClick(navigate: NavigateFunction, payloadId?: number) {
  await Browser.runtime.sendMessage({
    type: MessageTypes.signBitcoinResponse,
    payloadId,
    payload: { status: 'error', data: 'User rejected the transaction' },
  })

  if (isSidePanel()) {
    navigate('/home')
  } else {
    window.close()
  }
}
