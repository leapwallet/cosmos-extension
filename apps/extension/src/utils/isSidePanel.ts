export const BRANDS_SUPPORTING_SIDE_PANEL = ['Google Chrome', 'Microsoft Edge', 'Brave']

export function isSidePanel() {
  return window.location.pathname.includes('sidepanel.html')
}

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
