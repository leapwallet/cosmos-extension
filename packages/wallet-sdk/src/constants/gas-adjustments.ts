import { SupportedChain } from './chain-infos';

export type GasAdjustments = Record<SupportedChain, number>;

/**
 * Gas adjustment for each network
 */
export const gasAdjustments: GasAdjustments = {
  chihuahua: 1.7,
  cosmos: 1.5,
  osmosis: 1.5,
  secret: 1.5,
  juno: 1.5,
  akash: 1.5,
  axelar: 1.5,
  emoney: 1.5,
  irisnet: 1.5,
  persistenceNew: 1.5,
  persistence: 1.5,
  stargaze: 1.5,
  sifchain: 1.5,
  sommelier: 1.5,
  umee: 1.5,
  starname: 1.5,
  cryptoorg: 1.5,
  comdex: 1.5,
  assetmantle: 1.5,
  crescent: 1.5,
  kujira: 1.5,
  injective: 1.5,
  mars: 1.5,
  sei: 1.5,
  seiTestnet2: 1.5,
  stride: 1.5,
  agoric: 1.5,
  cheqd: 1.5,
  likecoin: 1.5,
  gravitybridge: 1.5,
  fetchhub: 1.5,
  desmos: 1.5,
  teritori: 1.5,
  jackal: 1.5,
  evmos: 1.5,
  bitsong: 1.5,
  bitcanna: 1.5,
  canto: 1.5,
  decentr: 1.5,
  carbon: 1.6,
  kava: 1.5,
  omniflix: 1.5,
  passage: 1.5,
  archway: 1.5,
  terra: 1.5,
  quasar: 1.5,
  neutron: 1.5,
  coreum: 1.5,
  mainCoreum: 1.5,
  quicksilver: 1.5,
  kyve: 1.5,
  onomy: 1.5,
  migaloo: 1.5,
  noble: 1.5,
  impacthub: 3.0,
  planq: 1.5,
  nomic: 1.5,
  nolus: 1.8,
  chain4energy: 1.5,
  gitopia: 1.5,
  nibiru: 1.5,
  mayachain: 1.5,
  empowerchain: 1.5,
  dydx: 1.5,
  celestia: 1.5,
  sge: 1.5,
  xpla: 1.5,
  provenance: 1.5,
  aura: 1.5,
  kichain: 1.5,
  sentinel: 1.5,
  bandchain: 1.5,
  composable: 1.5,
  seiDevnet: 1.5,
  dymension: 1.5,
  pryzmtestnet: 1.5,
  thorchain: 1.5,
  odin: 1.5,
  saga: 1.5,
  initia: 1.5,
  humans: 1.5,
  lava: 1.5,
  mantra: 1.5,
  ethereum: 1,
  forma: 1,
  civitia: 1.5,
  milkyway: 1.5,
  minimove: 1.5,
  miniwasm: 1.5,
  arbitrum: 1,
  polygon: 1,
  base: 1,
  optimism: 1,
  blast: 1,
  manta: 1,
  lightlink: 1,
  unichain: 1,
  bitcoin: 1,
  bitcoinSignet: 1,
  flame: 1,
  avalanche: 1,
  bsc: 1,
  elys: 1.5,
  babylon: 1.5,
  movement: 1,
  aptos: 1,
  movementBardock: 1,
};
