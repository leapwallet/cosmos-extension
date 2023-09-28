import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'

import ArchId from './archId.svg'
import CompassCircle from './compass-circle.svg'
import CosmoStation from './cosmo-station.svg'
import GenericDark from './generic-dark.svg'
import GenericLight from './generic-light.svg'
import IBCDomains from './ibc-domains.svg'
import ICNS from './icns.svg'
import JunoSwap from './juno-swap.svg'
import Keplr from './keplr.svg'
import LeapCosmos from './leap-cosmos.svg'
import LeapDarkMode from './leap-custom-dark-mode.svg'
import LeapLightMode from './leap-custom-light-mode.svg'
import LeapLogo from './leap-logo.svg'
import LeapLogo28 from './leap-logo-28.svg'
import Metamask from './metamask.svg'
import NftLogo from './nft-logo.svg'
import Osmosis from './osmosis.svg'
import SpaceId from './space-id.svg'
import StargazeNames from './stargaze-names.svg'
import TerraStation from './terra-station.svg'

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
  mars: ChainInfos.mars.chainSymbolImageUrl,
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
  cudos: ChainInfos.cudos.chainSymbolImageUrl,
  kava: ChainInfos.kava.chainSymbolImageUrl,
  omniflix: ChainInfos.omniflix.chainSymbolImageUrl,
  passage: ChainInfos.passage.chainSymbolImageUrl,
  archway: ChainInfos.archway.chainSymbolImageUrl,
  terra: ChainInfos.terra.chainSymbolImageUrl,
  quasar: ChainInfos.quasar.chainSymbolImageUrl,
  neutron: ChainInfos.neutron.chainSymbolImageUrl,
  coreum: ChainInfos.coreum.chainSymbolImageUrl,
  mainCoreum: ChainInfos.mainCoreum.chainSymbolImageUrl,
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
  celestiatestnet3: ChainInfos.celestiatestnet3.chainSymbolImageUrl,
  sge: ChainInfos.sge.chainSymbolImageUrl,
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
    default:
      return GenericLight
  }
}

export {
  ArchId,
  ChainLogos,
  CompassCircle,
  CosmoStation,
  GenericDark,
  GenericLight,
  IBCDomains,
  ICNS,
  JunoSwap,
  Keplr,
  LeapCosmos,
  LeapDarkMode,
  LeapLightMode,
  LeapLogo,
  LeapLogo28,
  Metamask,
  NftLogo,
  StargazeNames,
  TerraStation,
}
