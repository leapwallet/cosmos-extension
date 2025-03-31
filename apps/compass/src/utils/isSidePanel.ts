import { captureException } from '@sentry/react'
import { ButtonName, ButtonType, EventName } from 'config/analytics'
import mixpanel from 'mixpanel-browser'
import browser from 'webextension-polyfill'
export const BRANDS_SUPPORTING_SIDE_PANEL = ['Google Chrome', 'Microsoft Edge', 'Brave']

export function isSidePanel() {
  return window.location.pathname.includes('sidepanel.html')
}

export const sidePanel = isSidePanel()

declare global {
  interface Navigator {
    userAgentData?: {
      brands: { brand: string; version: string }[]
      mobile: boolean
      platform: string
    }
  }
}

export function isSidePanelSupported() {
  const brands = navigator.userAgentData?.brands?.map(({ brand }) => brand) ?? []
  return BRANDS_SUPPORTING_SIDE_PANEL.some((brand) => brands.includes(brand)) && !!chrome?.sidePanel
}

export const sidePanelSupported = isSidePanelSupported()

export const isInExpandView = browser.extension.getViews({ type: 'tab' }).length > 0

export const handleSidePanelClick = async () => {
  if (!isSidePanelSupported() || sidePanel) {
    if (sidePanel) {
      await chrome.sidePanel.setPanelBehavior({
        openPanelOnActionClick: false,
      })
      try {
        mixpanel.track(EventName.ButtonClick, {
          buttonType: ButtonType.SIDE_PANEL,
          buttonName: ButtonName.SIDE_PANEL_CLOSED,
          time: Date.now() / 1000,
        })
      } catch (e) {
        captureException(e)
      }
    }
    window.close()
    return
  }
  if (!chrome.windows) {
    return
  }
  const currentWindow = await chrome.windows.getCurrent()
  const windowId = currentWindow?.id
  if (!windowId || !chrome.sidePanel) {
    return
  }
  await chrome.sidePanel.setOptions({
    path: 'sidepanel.html#/home',
    enabled: true,
  })
  await chrome.sidePanel.open({ windowId })
  await chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true,
  })
  try {
    mixpanel.track(EventName.ButtonClick, {
      buttonType: ButtonType.SIDE_PANEL,
      buttonName: ButtonName.SIDE_PANEL_OPENED,
      time: Date.now() / 1000,
    })
  } catch (e) {
    captureException(e)
  }
  window.close()
}
