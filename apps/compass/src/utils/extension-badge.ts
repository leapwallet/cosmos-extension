import browser from 'webextension-polyfill'

export function setBadgeText(text: string) {
  browser.action.setBadgeBackgroundColor({ color: '#00F' }).then(() => {
    browser.action.setBadgeText({ text: text })
  })
}
