import { Colors } from '~/theme/colors'

import ArrowBack from './arrow-back.svg'
import ArrowDown from './arrow-down.svg'
import CardDividerDarkMode from './card-divider-dark-mode.svg'
import CardDividerLightMode from './card-divider-light-mode.svg'
import CheckCosmos from './check-cosmos.svg'
import CheckGreen from './check-green.svg'
import CheckJuno from './check-juno.svg'
import CheckOsmosis from './check-osmosis.svg'
import CheckRed from './check-red.svg'
import CheckSecret from './check-secret.svg'
import CMDShiftL from './cmd-shift-l.svg'
import ConnectedSitesIcon from './connected-sites.svg'
import Contacts from './contacts.svg'
import CopiedSvg from './copied'
import Copied from './copied.svg'
import CopySvg from './copy'
import CopyGray200 from './copy-gray-200.svg'
import CopyGray600 from './copy-gray-600.svg'
import Cross from './cross.svg'
import CrossFilled from './cross-filled.svg'
import DarkTheme from './dark-theme.svg'
import Data from './data.svg'
import DefaultWebsiteIcon from './default-website-icon.svg'
import Delete from './delete.svg'
import DeleteRed from './delete-red.svg'
import DownArrow from './down-arrow.svg'
import dropUpDarkModeIcon from './drop-up-dark-mode.svg'
import dropUpLightModeIcon from './drop-up-light-mode.svg'
import EditItems from './edit-items.svg'
import Explore from './explore.svg'
import FlashOn from './flash-on.svg'
import Globe from './globe.svg'
import HardwareWallet from './hardware-wallet.svg'
import HeartIcon from './heart.svg'
import HeartOutlineIcon from './heart-outline.svg'
import HelpIcon from './help.svg'
import IconRight from './icon-right-gray-400.svg'
import KeyDark from './key-dark.svg'
import KeyLight from './key-light.svg'
import KeyVpn from './key-vpn.svg'
import LeapQrIcon from './leap-qr-icon.svg'
import LeapReward from './leap-reward.svg'
import Ledger from './ledger.svg'
import LightTheme from './light-theme.svg'
import LineDividerDarkMode from './line-divider-dark-mode.svg'
import LineDividerLightMode from './line-divider-light-mode.svg'
import LockFilled from './lock-fill.svg'
import Menu from './menu.svg'
import Messages from './messages.svg'
import NFTFallBackImage from './nft-fallback-image.svg'
import NFTImageLoading from './nft-image-loading.svg'
import NFTVerifiedCollection from './nft-verified-collection.svg'
import NoSearchResult from './no-search-result.svg'
import NotAllowed from './not-allowed.svg'
import Pin from './pin.svg'
import PinToExtension from './pin-to-extension.svg'
import PlusIcon from './plus.svg'
import RadioButtonUnchecked from './radio-button-unchecked.svg'
import RightArrow from './right-arrow.svg'
import RightArrowCollapsed from './right-arrow-collapsed.svg'
import Search from './search.svg'
import SearchIcon from './search-gray-400-icon.svg'
import SideNavIcon from './side-nav-icon.svg'
import SuggestChainIcon from './suggest-chain-icon.svg'
import TextSnippet from './text-snippet.svg'
import Tick from './tick.svg'
import Timer from './timer.svg'
import Validator from './validator.svg'
import VisibilityOffIcon from './visibility-off.svg'
import VisibilityOff from './visibility-off.svg'
import Wallet0 from './wallet-0.svg'
import Wallet1 from './wallet-1.svg'
import Wallet2 from './wallet-2.svg'
import Wallet3 from './wallet-3.svg'
import Wallet4 from './wallet-4.svg'
import Wallet5 from './wallet-5.svg'
import WalletIconGreen from './wallet-green.svg'
import WalletIcon2 from './wallet-icon.svg'
import WalletIcon from './wallet-sample.svg'
import WalletIconWhite from './wallet-white.svg'
import Warning from './warning.svg'

export const ChainChecks: Record<string, string> = {
  cosmos: CheckCosmos,
  secret: CheckSecret,
  juno: CheckJuno,
  osmosis: CheckOsmosis,
  akash: CheckCosmos,
  axelar: CheckCosmos,
  persistence: CheckCosmos,
  stargaze: CheckCosmos,
  emoney: CheckCosmos,
  sifchain: CheckCosmos,
  irisnet: CheckCosmos,
  sommelier: CheckCosmos,
  comdex: CheckCosmos,
  crescent: CheckCosmos,
  cryptoorg: CheckCosmos,
  assetmantle: CheckCosmos,
  starname: CheckCosmos,
  umee: CheckCosmos,
  injective: CheckCosmos,
  mars: CheckCosmos,
  sei: CheckCosmos,
}

export {
  ArrowBack,
  ArrowDown,
  CardDividerDarkMode,
  CardDividerLightMode,
  CheckGreen,
  CheckRed,
  CMDShiftL,
  ConnectedSitesIcon,
  Contacts,
  Copied,
  CopiedSvg,
  CopyGray200,
  CopyGray600,
  CopySvg,
  Cross,
  CrossFilled,
  DarkTheme,
  Data,
  DefaultWebsiteIcon,
  Delete,
  DeleteRed,
  DownArrow,
  dropUpDarkModeIcon,
  dropUpLightModeIcon,
  EditItems,
  Explore,
  FlashOn,
  Globe,
  HardwareWallet,
  HeartIcon,
  HeartOutlineIcon,
  HelpIcon,
  IconRight,
  KeyDark,
  KeyLight,
  KeyVpn,
  LeapQrIcon,
  LeapReward,
  Ledger,
  LightTheme,
  LineDividerDarkMode,
  LineDividerLightMode,
  LockFilled,
  Menu,
  Messages,
  NFTFallBackImage,
  NFTImageLoading,
  NFTVerifiedCollection,
  NoSearchResult,
  NotAllowed,
  Pin,
  PinToExtension,
  PlusIcon,
  RadioButtonUnchecked,
  RightArrow,
  RightArrowCollapsed,
  Search,
  SearchIcon,
  SideNavIcon,
  SuggestChainIcon,
  TextSnippet,
  Tick,
  Timer,
  Validator,
  VisibilityOff,
  VisibilityOffIcon,
  WalletIcon,
  WalletIcon2,
  WalletIconGreen,
  WalletIconWhite,
  Warning,
}

export const getWalletIconAtIndex = (ind: number) => {
  const wallets = [Wallet0, Wallet1, Wallet2, Wallet3, Wallet4, Wallet5]
  return wallets[ind % Colors.walletColors.length] ?? Wallet0
}
