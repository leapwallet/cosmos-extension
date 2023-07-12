import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'

import CosmoStation from './cosmo-station.svg'
import GenericDark from './generic-dark.svg'
import GenericLight from './generic-light.svg'
import JunoSwap from './juno-swap.svg'
import Keplr from './keplr.svg'
import LeapCosmos from './leap-cosmos.svg'
import LeapDarkMode from './leap-custom-dark-mode.svg'
import LeapLightMode from './leap-custom-light-mode.svg'
import LeapLogo from './leap-logo.svg'
import Metamask from './metamask.svg'
import TerraStation from './terra-station.svg'

const ChainLogos: Record<string, string | undefined> = {
  cosmos: ChainInfos.cosmos.chainSymbolImageUrl,
  secret: ChainInfos.secret.chainSymbolImageUrl,
  juno: ChainInfos.juno.chainSymbolImageUrl,
  osmosis: ChainInfos.osmosis.chainSymbolImageUrl,
  axelar: ChainInfos.axelar.chainSymbolImageUrl,
  akash: ChainInfos.akash.chainSymbolImageUrl,
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
  kava: ChainInfos.kava.chainSymbolImageUrl,
}

export const getChainImage = (name: unknown | SupportedChain) => {
  let img

  if (ChainLogos[name as SupportedChain]) img = ChainLogos[name as SupportedChain]
  else img = GenericLight

  return img
}

export {
  ChainLogos,
  CosmoStation,
  GenericDark,
  GenericLight,
  JunoSwap,
  Keplr,
  LeapCosmos,
  LeapDarkMode,
  LeapLightMode,
  LeapLogo,
  Metamask,
  TerraStation,
}
