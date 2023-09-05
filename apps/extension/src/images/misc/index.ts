import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'

import AddCircle from './add-circle.svg'
import AddContact from './add-contact.svg'
import ArrowBack from './arrow-back.svg'
import ArrowDown from './arrow-down.svg'
import Blockchain from './blockchain.svg'
import CardDividerDarkMode from './card-divider-dark-mode.svg'
import CardDividerLightMode from './card-divider-light-mode.svg'
import CheckCompass from './check-compass.svg'
import CheckCosmos from './check-cosmos.svg'
import CheckGreen from './check-green.svg'
import CheckJuno from './check-juno.svg'
import CheckOsmosis from './check-osmosis.svg'
import CheckRed from './check-red.svg'
import CheckSecret from './check-secret.svg'
import CMDShiftL from './cmd-shift-l.svg'
import CompassCopied from './compass-copied.svg'
import CompassNftVerifiedCollection from './compass-nft-verified-collection.svg'
import CompassPinExtension from './compass-pin-extension.png'
import CompassReward from './compass-reward.svg'
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
import ExpandContent from './expand-content.svg'
import Explore from './explore.svg'
import FilledArrowDown from './filled-arrow-down.svg'
import FilledFavStar from './filled-fav-star.svg'
import FilledKey from './filled-key.svg'
import FilledPen from './filled-pen.svg'
import FlashOn from './flash-on.svg'
import Gear from './gear.svg'
import Globe from './globe.svg'
import GreenTick from './green-tick.svg'
import GreyCross from './grey-cross.svg'
import HardwareWallet from './hardware-wallet.svg'
import HeartIcon from './heart.svg'
import HeartOutlineIcon from './heart-outline.svg'
import HelpIcon from './help.svg'
import HideNft from './hide-nft.svg'
import IBC from './ibc.svg'
import IbcUnion from './ibc-union.svg'
import IconRight from './icon-right-gray-400.svg'
import InfoCircle from './info-circle.svg'
import KeyDark from './key-dark.svg'
import KeyLight from './key-light.svg'
import KeyVpn from './key-vpn.svg'
import Language from './language.svg'
import LeapQrIcon from './leap-qr-icon.svg'
import LeapReward from './leap-reward.svg'
import Ledger from './ledger.svg'
import LightTheme from './light-theme.svg'
import LineDividerDarkMode from './line-divider-dark-mode.svg'
import LineDividerLightMode from './line-divider-light-mode.svg'
import LockFilled from './lock-fill.svg'
import LockGreen from './lock-green.svg'
import Menu from './menu.svg'
import Messages from './messages.svg'
import NFTFallBackImage from './nft-fallback-image.svg'
import NFTImageLoading from './nft-image-loading.svg'
import NftProfile from './nft-profile.svg'
import NFTVerifiedCollection from './nft-verified-collection.svg'
import NoSearchResult from './no-search-result.svg'
import NotAllowed from './not-allowed.svg'
import OpenLink from './open-link.svg'
import OutlinedFavStar from './outlined-fav-start.svg'
import Pin from './pin.svg'
import PinToExtension from './pin-to-extension.svg'
import PkWallet from './pk-wallet.svg'
import PlusIcon from './plus.svg'
import RadioButtonUnchecked from './radio-button-unchecked.svg'
import RemoveCircle from './remove-circle.svg'
import RightArrow from './right-arrow.svg'
import RightArrowCollapsed from './right-arrow-collapsed.svg'
import Search from './search.svg'
import SearchIcon from './search-gray-400-icon.svg'
import Sell from './sell.svg'
import Settings from './settings.svg'
import SideNavIcon from './side-nav-icon.svg'
import SortIcon from './sort.svg'
import SuggestChainIcon from './suggest-chain-icon.svg'
import TextSnippet from './text-snippet.svg'
import Tick from './tick.svg'
import Timer from './timer.svg'
import UnhideNft from './unhide-nft.svg'
import Validator from './validator.svg'
import Verified from './verified.svg'
import VerticalDots from './vertical-dots.svg'
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
  likecoin: CheckCosmos,
  agoric: CheckCosmos,
  cheqd: CheckCosmos,
  seiTestnet2: isCompassWallet() ? CheckCompass : CheckCosmos,
}

export {
  AddCircle,
  AddContact,
  ArrowBack,
  ArrowDown,
  Blockchain,
  CardDividerDarkMode,
  CardDividerLightMode,
  CheckCompass,
  CheckCosmos,
  CheckGreen,
  CheckRed,
  CMDShiftL,
  CompassCopied,
  CompassNftVerifiedCollection,
  CompassPinExtension,
  CompassReward,
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
  ExpandContent,
  Explore,
  FilledArrowDown,
  FilledFavStar,
  FilledKey,
  FilledPen,
  FlashOn,
  Gear,
  Globe,
  GreenTick,
  GreyCross,
  HardwareWallet,
  HeartIcon,
  HeartOutlineIcon,
  HelpIcon,
  HideNft,
  IBC,
  IbcUnion,
  IconRight,
  InfoCircle,
  KeyDark,
  KeyLight,
  KeyVpn,
  Language,
  LeapQrIcon,
  LeapReward,
  Ledger,
  LightTheme,
  LineDividerDarkMode,
  LineDividerLightMode,
  LockFilled,
  LockGreen,
  Menu,
  Messages,
  NFTFallBackImage,
  NFTImageLoading,
  NftProfile,
  NFTVerifiedCollection,
  NoSearchResult,
  NotAllowed,
  OpenLink,
  OutlinedFavStar,
  Pin,
  PinToExtension,
  PkWallet,
  PlusIcon,
  RadioButtonUnchecked,
  RemoveCircle,
  RightArrow,
  RightArrowCollapsed,
  Search,
  SearchIcon,
  Sell,
  Settings,
  SideNavIcon,
  SortIcon,
  SuggestChainIcon,
  TextSnippet,
  Tick,
  Timer,
  UnhideNft,
  Validator,
  Verified,
  VerticalDots,
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
