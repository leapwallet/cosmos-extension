import { BannerAD } from '@leapwallet/cosmos-wallet-hooks'

// session storage key for storing the numia banner impression info
export const NUMIA_IMPRESSION_INFO = 'numia-impression-info'
export const SPINDL_IMPRESSION_INFO = 'spindl-impression-info'
// session storage key for storing the mixpanel banner views info
export const MIXPANEL_BANNER_VIEWS_INFO = 'mixpanel-banner-views-info'
// seconds

export type BannerADData = BannerAD & {
  logo?: string
}

export const getMixpanelBannerId = (bannerId: string, campaignId?: number) => {
  return bannerId.includes('numia') ? `numia-campaign-${campaignId}` : bannerId
}

export const getMixpanelPositionId = (bannerId: string, banner?: BannerAD) => {
  return bannerId.includes('numia') ? banner?.attributes?.position_id : banner?.position_id
}

export const getDisplayAds = (bannerAds: BannerAD[], disabledBannerAds: string[] | null) => {
  return bannerAds.filter((ad) => {
    const date = new Date()
    const startDate = new Date(ad.start_date)
    const endDate = new Date(ad.end_date)
    const isCorrectTime = date >= startDate && date <= endDate
    return disabledBannerAds !== null ? !disabledBannerAds.includes(ad.id) && isCorrectTime : false
  })
}
