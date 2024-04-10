import { MessageTypes } from 'config/message-types'
import Browser from 'webextension-polyfill'

export function handleRejectClick() {
  Browser.runtime.sendMessage({
    type: MessageTypes.signSeiEvmResponse,
    payload: { status: 'error', data: 'User rejected the transaction' },
  })

  setTimeout(() => {
    window.close()
  }, 1000)
}
