import { MessageTypes } from 'config/message-types'
import { NavigateFunction } from 'react-router'
import { isSidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

export async function handleRejectClick(
  navigate: NavigateFunction,
  payloadId?: number,
  donotClose?: boolean,
) {
  await Browser.runtime.sendMessage({
    type: MessageTypes.signSeiEvmResponse,
    payloadId,
    payload: { status: 'error', data: 'User rejected the transaction' },
  })

  if (!donotClose) {
    if (isSidePanel()) {
      navigate('/home')
    } else {
      window.close()
    }
  }
}
