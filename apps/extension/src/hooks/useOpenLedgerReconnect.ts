import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { closeSidePanel } from 'utils/closeSidePanel'
import { isSidePanel } from 'utils/isSidePanel'
import browser from 'webextension-polyfill'

export const useOpenLedgerReconnect = () => {
  const navigate = useNavigate()

  return useCallback(async () => {
    const views = browser.extension.getViews({ type: 'popup' })
    const hasNoPopups = views.length === 0
    const isStandAlonePopupWindow =
      hasNoPopups && window.outerHeight === 600 && window.outerWidth === 400
    const isCurrentWindowTypePopup = views.findIndex((popup) => popup === window) !== -1
    const thisIsAPopup = isStandAlonePopupWindow || isCurrentWindowTypePopup
    if (!thisIsAPopup && !isSidePanel()) {
      navigate('/reconnect-ledger')
    } else {
      if (!isSidePanel()) {
        const activeWindow = await browser.windows.getAll()
        const nonPopupWindow = activeWindow.find((window) => window.type !== 'popup')
        if (nonPopupWindow) {
          browser.tabs.create({
            url: browser.runtime.getURL('index.html#/reconnect-ledger'),
            windowId: nonPopupWindow.id,
          })
        }
        window.close()
        return
      }
      window.open('index.html#/reconnect-ledger', '_blank')
      closeSidePanel()
    }
  }, [navigate])
}
