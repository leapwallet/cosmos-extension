import { ClockIcon } from 'icons/clock-icon'
import { CompassIcon2 } from 'icons/compass-icon'
import { GalleryIcon } from 'icons/gallery-icon'
import { HomeIcon } from 'icons/home-icon'
import { SwapIconBottomNav } from 'icons/swap-icon'
import activityOffOn from 'lottie-files/bottom-nav/activity-off-on.json'
import activityOnOff from 'lottie-files/bottom-nav/activity-on-off.json'
import compassOffOn from 'lottie-files/bottom-nav/compass-off-on.json'
import compassOnOff from 'lottie-files/bottom-nav/compass-on-off.json'
import homeOffOn from 'lottie-files/bottom-nav/home-off-on.json'
import homeOnOff from 'lottie-files/bottom-nav/home-on-off.json'
import nftOffOn from 'lottie-files/bottom-nav/nft-off-on.json'
import nftOnOff from 'lottie-files/bottom-nav/nft-on-off.json'
import swapOffOn from 'lottie-files/bottom-nav/swap-off-on.json'
import swapOnOff from 'lottie-files/bottom-nav/swap-on-off.json'

export enum BottomNavLabel {
  Home = 'Home',
  NFTs = 'NFTs',
  Activity = 'Activity',
  Swap = 'Swap',
  Rewards = 'Rewards',
}
export const allBottomNavItems = [
  {
    label: BottomNavLabel.Home,
    lottie: {
      on: homeOffOn,
      off: homeOnOff,
    },
    Icon: HomeIcon,
    path: '/home',
    visibleOn: new Set([]),
  },
  {
    label: BottomNavLabel.NFTs,
    lottie: {
      on: nftOffOn,
      off: nftOnOff,
    },
    Icon: GalleryIcon,
    path: '/nfts',
  },
  {
    label: BottomNavLabel.Swap,
    lottie: {
      on: swapOffOn,
      off: swapOnOff,
    },
    Icon: SwapIconBottomNav,
    path: '/swap',
    params: 'pageSource=bottomNav',
  },
  {
    label: BottomNavLabel.Rewards,
    lottie: {
      on: compassOffOn,
      off: compassOnOff,
    },
    Icon: CompassIcon2,
    path: '/alpha',
  },
  {
    label: BottomNavLabel.Activity,
    lottie: {
      on: activityOffOn,
      off: activityOnOff,
    },
    Icon: ClockIcon,
    path: '/activity',
  },
]

export const bottomNavItemsForWatchWallet = allBottomNavItems.filter(
  (item) => item.label !== BottomNavLabel.Swap,
)

export const routeToLabelMap = allBottomNavItems.reduce((acc, item) => {
  acc[item.path] = item.label

  item.visibleOn?.forEach((path) => {
    acc[path] = item.label
  })

  return acc
}, {} as Record<string, BottomNavLabel>)
