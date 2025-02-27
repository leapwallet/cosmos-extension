import Browser from 'webextension-polyfill'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendMessageToTab(message: any) {
  const tabs = await Browser.tabs.query({
    status: 'complete',
    active: true,
    currentWindow: true,
  })

  for (const tab of tabs) {
    try {
      if (tab.active && !tab.discarded && tab.id) {
        await Browser.tabs.sendMessage(tab.id, message)
      }
    } catch (_) {
      //
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendMessageToAllTabs(message: any) {
  const tabs = await Browser.tabs.query({
    status: 'complete',
  })

  for (const tab of tabs) {
    try {
      if (tab.id) {
        await Browser.tabs.sendMessage(tab.id, message)
      }
    } catch (_) {
      //
    }
  }
}
