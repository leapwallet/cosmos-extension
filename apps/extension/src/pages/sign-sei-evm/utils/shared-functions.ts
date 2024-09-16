import { MessageTypes } from 'config/message-types'
import { NavigateFunction } from 'react-router'
import { isSidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

export function handleRejectClick(navigate: NavigateFunction) {
  Browser.runtime.sendMessage({
    type: MessageTypes.signSeiEvmResponse,
    payload: { status: 'error', data: 'User rejected the transaction' },
  })

  if (isSidePanel()) {
    navigate('/home')
  } else {
    window.close()
  }
}
