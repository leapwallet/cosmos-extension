import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants'

import Appstore from './appstore.svg'
import ArchId from './archId.svg'
import Bidds from './bidds.png'
import CompassCircle from './compass-circle.svg'
import CosmoStation from './cosmo-station.svg'
import Dashboard from './dashboard.svg'
import DegeNS from './degens.svg'
import GenericDark from './generic-dark.svg'
import GenericLight from './generic-light.svg'
import IBCDomains from './ibc-domains.svg'
import ICNS from './icns.svg'
import ImgNotAvailableDark from './img-not-available-dark.svg'
import ImgNotAvailableLight from './img-not-available-light.svg'
import JunoSwap from './juno-swap.svg'
import Keplr from './keplr.svg'
import LeapCosmos from './leap-cosmos.svg'
import LeapDarkMode from './leap-custom-dark-mode.svg'
import LeapLightMode from './leap-custom-light-mode.svg'
import LeapLogo from './leap-logo.svg'
import LeapLogo28 from './leap-logo-28.svg'
import LedgerEvmChains from './ledger-evm-chains.svg'
import Metamask from './metamask.svg'
import NamedSkip from './named-skip.svg'
import NftLogo from './nft-logo.svg'
import NomicFullnameLogo from './nomic-fullname-logo.svg'
import Osmosis from './osmosis.svg'
import Pallet from './pallet.svg'
import Playstore from './playstore.svg'
import SeiV2 from './sei-v2.svg'
import SNS from './sns.svg'
import SpaceId from './space-id.svg'
import StargazeNames from './stargaze-names.svg'
import TerraStation from './terra-station.svg'
import XLogo from './X_logo.svg'
import XLogoDark from './X_logo_dark.svg'

const ChainLogos: Record<string, string | undefined> = {
  cosmos: ChainInfos.cosmos.chainSymbolImageUrl,
  secret: ChainInfos.secret.chainSymbolImageUrl,
  juno: ChainInfos.juno.chainSymbolImageUrl,
  osmosis: ChainInfos.osmosis.chainSymbolImageUrl,
  axelar: ChainInfos.axelar.chainSymbolImageUrl,
  akash: ChainInfos.akash.chainSymbolImageUrl,
  persistenceNew: ChainInfos.persistenceNew.chainSymbolImageUrl,
  persistence: ChainInfos.persistence.chainSymbolImageUrl,
  stargaze: ChainInfos.stargaze.chainSymbolImageUrl,
  emoney: ChainInfos.emoney.chainSymbolImageUrl,
  sifchain: ChainInfos.sifchain.chainSymbolImageUrl,
  irisnet: ChainInfos.irisnet.chainSymbolImageUrl,
  sommelier: ChainInfos.sommelier.chainSymbolImageUrl,
  comdex: ChainInfos.comdex.chainSymbolImageUrl,
  crescent: ChainInfos.crescent.chainSymbolImageUrl,
  cryptoorg: ChainInfos.cryptoorg.chainSymbolImageUrl,
  assetmantle: ChainInfos.assetmantle.chainSymbolImageUrl,
  starname: ChainInfos.starname.chainSymbolImageUrl,
  umee: ChainInfos.umee.chainSymbolImageUrl,
  injective: ChainInfos.injective.chainSymbolImageUrl,
  sei: ChainInfos.sei.chainSymbolImageUrl,
  kujira: ChainInfos.kujira.chainSymbolImageUrl,
  stride: ChainInfos.stride.chainSymbolImageUrl,
  cheqd: ChainInfos.cheqd.chainSymbolImageUrl,
  agoric: ChainInfos.agoric.chainSymbolImageUrl,
  likecoin: ChainInfos.likecoin.chainSymbolImageUrl,
  gravitybridge: ChainInfos.gravitybridge.chainSymbolImageUrl,
  chihuahua: ChainInfos.chihuahua.chainSymbolImageUrl,
  fetchhub: ChainInfos.fetchhub.chainSymbolImageUrl,
  desmos: ChainInfos.desmos.chainSymbolImageUrl,
  teritori: ChainInfos.teritori.chainSymbolImageUrl,
  jackal: ChainInfos.jackal.chainSymbolImageUrl,
  bitsong: ChainInfos.bitsong.chainSymbolImageUrl,
  evmos: ChainInfos.evmos.chainSymbolImageUrl,
  canto: ChainInfos.canto.chainSymbolImageUrl,
  bitcanna: ChainInfos.bitcanna.chainSymbolImageUrl,
  decentr: ChainInfos.decentr.chainSymbolImageUrl,
  carbon: ChainInfos.carbon.chainSymbolImageUrl,
  kava: ChainInfos.kava.chainSymbolImageUrl,
  omniflix: ChainInfos.omniflix.chainSymbolImageUrl,
  passage: ChainInfos.passage.chainSymbolImageUrl,
  archway: ChainInfos.archway.chainSymbolImageUrl,
  terra: ChainInfos.terra.chainSymbolImageUrl,
  quasar: ChainInfos.quasar.chainSymbolImageUrl,
  neutron: ChainInfos.neutron.chainSymbolImageUrl,
  mainCoreum: ChainInfos.mainCoreum.chainSymbolImageUrl,
  coreum: ChainInfos.coreum.chainSymbolImageUrl,
  quicksilver: ChainInfos.quicksilver.chainSymbolImageUrl,
  migaloo: ChainInfos.migaloo.chainSymbolImageUrl,
  kyve: ChainInfos.kyve.chainSymbolImageUrl,
  onomy: ChainInfos.onomy.chainSymbolImageUrl,
  seiTestnet2: ChainInfos.seiTestnet2.chainSymbolImageUrl,
  noble: ChainInfos.noble.chainSymbolImageUrl,
  impacthub: ChainInfos.impacthub.chainSymbolImageUrl,
  planq: ChainInfos.planq.chainSymbolImageUrl,
  nibiru: ChainInfos.nibiru.chainSymbolImageUrl,
  mayachain: ChainInfos.mayachain.chainSymbolImageUrl,
  empowerchain: ChainInfos.empowerchain.chainSymbolImageUrl,
  dydx: ChainInfos.dydx.chainSymbolImageUrl,
  celestia: ChainInfos.celestia.chainSymbolImageUrl,
  sge: ChainInfos.sge.chainSymbolImageUrl,
  nomic: ChainInfos.nomic.chainSymbolImageUrl,
  xpla: ChainInfos.xpla.chainSymbolImageUrl,
  provenance: ChainInfos.provenance.chainSymbolImageUrl,
  aura: ChainInfos.aura.chainSymbolImageUrl,
  kichain: ChainInfos.kichain.chainSymbolImageUrl,
  sentinel: ChainInfos.sentinel.chainSymbolImageUrl,
  bandchain: ChainInfos.bandchain.chainSymbolImageUrl,
  seiDevnet: ChainInfos.seiDevnet.chainSymbolImageUrl,
  dymension: ChainInfos.dymension.chainSymbolImageUrl,
  pryzmtestnet: ChainInfos.pryzmtestnet.chainSymbolImageUrl,
  thorchain: ChainInfos.thorchain.chainSymbolImageUrl,
  odin: ChainInfos.odin.chainSymbolImageUrl,
  saga: ChainInfos.saga.chainSymbolImageUrl,
  initia: ChainInfos.initia.chainSymbolImageUrl,
  humans: ChainInfos.humans.chainSymbolImageUrl,
}

export const getChainImage = (name: string) => {
  if (name in ChainLogos) {
    return ChainLogos[name as SupportedChain]
  }
  const chainInfo = ChainInfos[name as SupportedChain]
  if (chainInfo) {
    return chainInfo.chainSymbolImageUrl
  }
  return GenericLight
}

export const getSwapProviderImage = (name: SupportedChain) => {
  switch (name) {
    case 'juno':
      return JunoSwap
    case 'osmosis':
      return Osmosis
    default:
      return GenericLight
  }
}

export const getNameServiceLogo = (name: string) => {
  switch (name) {
    case 'icns':
      return ICNS
    case 'ibcDomains':
      return IBCDomains
    case 'stargazeNames':
      return StargazeNames
    case 'archIds':
      return ArchId
    case 'spaceIds':
      return SpaceId
    case 'sns':
      return SNS
    case 'degeNS':
      return DegeNS
    case 'bdd':
      return Bidds
    default:
      return GenericLight
  }
}

export {
  Appstore,
  ArchId,
  Bidds,
  ChainLogos,
  CompassCircle,
  CosmoStation,
  Dashboard,
  DegeNS,
  GenericDark,
  GenericLight,
  IBCDomains,
  ICNS,
  ImgNotAvailableDark,
  ImgNotAvailableLight,
  JunoSwap,
  Keplr,
  LeapCosmos,
  LeapDarkMode,
  LeapLightMode,
  LeapLogo,
  LeapLogo28,
  LedgerEvmChains,
  Metamask,
  NamedSkip,
  NftLogo,
  NomicFullnameLogo,
  Pallet,
  Playstore,
  SeiV2,
  SNS,
  StargazeNames,
  TerraStation,
  XLogo,
  XLogoDark,
}
