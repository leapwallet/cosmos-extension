/* eslint-disable no-unused-vars */
export enum EventName {
  PageView = 'Page View',
  BannerView = 'Banner View',
  BannerClick = 'Banner Click',
  BannerClose = 'Banner Close',
  ButtonClick = 'Button Click',
  DappTxnInit = 'dApp Transaction Initiated',
  DappTxnApproved = 'dApp Transaction Approved',
  DappTxnRejected = 'dApp Transaction Rejected',
  OnboardingStarted = 'Onboarding Started',
  OnboardingMethod = 'Onboarding Method Chosen',
  OnboardingCompleted = 'Onboarding Completed',
  OnboardingClicked = 'Onboarding CTA Clicked',
  QuickSearchOpen = 'Quick Search Open',
  QuickSearchClick = 'Quick Search Click',
  QuickSearchClose = 'Quick Search Close',
  FeeValidationFailed = 'Fee Validation Failed',
}

export enum ButtonType {
  HOME = 'home',
  ADD_FUNDS = 'zero balance wallet - add funds',
  CHAIN_MANAGEMENT = 'chain management',
}

export enum ButtonName {
  IBC_SWAP = 'ibc swaps',
  RECEIVE_ASSETS = 'receive assets',
  RECEIVE = 'receive',
  BRIDGE = 'bridge',
  BUY = 'fiat on-ramp',
  MOBILE_APP = 'mobile app',
  LEAPBOARD = 'leapboard',
  EXPLORE_DEFI = 'dive into defi',
  EXPLORE_NFTS = 'explore nfts',
  EXPLORE_TOKENS = 'explore tokens',
  LAUNCH_EXTENSION = 'launch extension',
  FOLLOW_LEAP = 'follow Leap on X',
  ADD_CHAIN_FROM_STORE = 'add chain from store',
  ADD_NEW_CHAIN = 'add new chain',
  MANAGE_CHAIN = 'manage chain',
}

export enum PageName {
  Home = 'Home',
  Send = 'Send',
  Swap = 'Swap',
  Governance = 'Governance',
  Stake = 'Stake',
  Activity = 'Activity',
  Earn = 'Earn',
  NFT = 'NFT Collections',
  SyncWithMobileApp = 'Sync with Mobile App',
}
