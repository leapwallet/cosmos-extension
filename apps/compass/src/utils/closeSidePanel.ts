import { isSidePanel, isSidePanelSupported } from './isSidePanel'

export function closeSidePanel(executeInsideSidePanel: boolean = true) {
  if (isSidePanelSupported() && (!executeInsideSidePanel || isSidePanel())) {
    chrome.sidePanel?.setOptions({ enabled: false })
  }
}
