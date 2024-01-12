/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Platform } from '../connectors';

export const platforms: Record<string, Platform> = {
  cosmoshub: Platform.CosmosHub,
  cosmos: Platform.CosmosHub, // Keep this
  osmosis: Platform.Osmosis,
  secret: Platform.Secret,
  secretnetwork: Platform.Secret,
  juno: Platform.Juno,
  stargaze: Platform.Stargaze,
  agoric: Platform.Agoric,
  terra: Platform.Terra,
  kava: Platform.Kava,
  injective: Platform.Injective,
  evmos: Platform.Evmos,
  akash: Platform.Akash,
  irisnet: Platform.IrisNet,
  persistenceNew: Platform.Persistence,
  persistence: Platform.Persistence,
  starname: Platform.Starname,
  sommelier: Platform.Sommelier,
  comdex: Platform.Comdex,
  umee: Platform.Umee,
  sifchain: Platform.Sifchain,
  kujira: Platform.Kujira,
  bitsong: Platform.BitSong,
  sentinel: Platform.Sentinel,
  shentu: Platform.Shentu,
  bandchain: Platform.Band,
  bostrom: Platform.Bostrom,
  cerberus: Platform.Cerberus,
  cheqd: Platform.Cheqd,
  chihuahua: Platform.Chihuahua,
  decentr: Platform.Decentr,
  desmos: Platform.Desmos,
  dig: Platform.Dig,
  emoney: Platform.EMoney,
  assetmantle: Platform.AssetMantle,
  likecoin: Platform.LikeCoin,
  gravitybridge: Platform.GravityBridge,
  fetchhub: Platform.FetchHub,
  teritori: Platform.Teritori,
  stride: Platform.Stride,
  bitcanna: Platform.BitCanna,
  crescent: Platform.Crescent,
  canto: Platform.Canto,
  carbon: Platform.Carbon,
  cudos: Platform.Cudos,
  coreum: Platform.Coreum,
  mainCoreum: Platform.Coreum,
  axelar: Platform.Axelar,
  archway: Platform.Archway,
  omniflix: Platform.OmniFlix,
  noble: Platform.Noble,
  kyve: Platform.Kyve,
  migaloo: Platform.Migaloo,
  quasar: Platform.Quasar,
  passage: Platform.Passage,
  neutron: Platform.Neutron,
  onomy: Platform.Onomy,
  quicksilver: Platform.QuickSilver,
  provenance: Platform.Provenance,
  kichain: Platform.Ki,

  // @ts-ignore
  aura: 'AURA',
  // @ts-ignore
  seiTestnet2: 'SEI_TESTNET_2',
  // @ts-ignore
  impacthub: 'IMPACT_HUB',

  //@ts-ignore
  jackal: 'JACKAL',
  //@ts-ignore
  planq: 'PLANQ',

  //@ts-ignore
  nomic: 'NOMIC',
  //@ts-ignore
  nibiru: 'NIBIRU',
  //@ts-ignore
  odin: 'ODIN_CHAIN',
  // @ts-ignore
  mayachain: 'MAYA_CHAIN',
  // @ts-ignore
  empowerchain: 'EMPOWER_CHAIN',
  //@ts-ignore
  dydx: 'DYDX',
  // @ts-ignore
  gitopia: 'GITOPIA',
  // @ts-ignore
  sge: 'SGE',
  // @ts-ignore
  celestia: 'CELESTIA',
  // @ts-ignore
  xpla: 'XPLA',
  // @ts-ignore
  composable: 'COMPOSABLE',
  // @ts-ignore
  pryzmtestnet: 'PRYZM',
  // @ts-ignore
  thorchain: 'THOR_CHAIN',
};

export const platformToChain: Record<Platform, string> = {
  [Platform.CosmosHub]: 'cosmos',
  [Platform.Osmosis]: 'osmosis',
  [Platform.Agoric]: 'agoric',
  [Platform.Terra]: 'terra',
  [Platform.Kava]: 'kava',
  [Platform.Injective]: 'injective',
  [Platform.Evmos]: 'evmos',
  [Platform.Akash]: 'akash',
  [Platform.IrisNet]: 'irisnet',
  [Platform.Persistence]: 'persistence',
  [Platform.Starname]: 'starname',
  [Platform.Sommelier]: 'sommelier',
  [Platform.Comdex]: 'comdex',
  [Platform.Umee]: 'umee',
  [Platform.Sifchain]: 'sifchain',
  [Platform.Kujira]: 'kujira',
  [Platform.BitSong]: 'bitsong',
  [Platform.Cheqd]: 'cheqd',
  [Platform.Chihuahua]: 'chihuahua',
  [Platform.Decentr]: 'decentr',
  [Platform.Desmos]: 'desmos',
  [Platform.EMoney]: 'emoney',
  [Platform.AssetMantle]: 'assetmantle',
  [Platform.LikeCoin]: 'likecoin',
  [Platform.GravityBridge]: 'gravitybridge',
  [Platform.FetchHub]: 'fetchhub',
  [Platform.Teritori]: 'teritori',
  [Platform.Stride]: 'stride',
  [Platform.BitCanna]: 'bitcanna',
  [Platform.Crescent]: 'crescent',
  [Platform.Canto]: 'canto',
  [Platform.Carbon]: 'carbon',
  [Platform.Cudos]: 'cudos',
  [Platform.Stargaze]: 'stargaze',
  [Platform.Secret]: 'secret',
  [Platform.Juno]: 'juno',
  [Platform.Coreum]: 'coreum',
  [Platform.Axelar]: 'axelar',
  [Platform.Passage]: 'passage',
  [Platform.OmniFlix]: 'omniflix',
  [Platform.Archway]: 'archway',
  [Platform.Quasar]: 'quasar',
  [Platform.Neutron]: 'neutron',
  [Platform.QuickSilver]: 'quicksilver',
  [Platform.Onomy]: 'onomy',
  [Platform.Kyve]: 'kyve',
  [Platform.Noble]: 'noble',
  [Platform.Migaloo]: 'migaloo',
  [Platform.Provenance]: 'provenance',
  [Platform.Ki]: 'kichain',
  [Platform.Sentinel]: 'sentinel',
  [Platform.Band]: 'bandchain',

  // @ts-ignore
  AURA: 'aura',
  SEI_TESTNET_2: 'seiTestnet2',
  IMPACT_HUB: 'impacthub',
  JACKAL: 'jackal',
  PLANQ: 'planq',
  NOMIC: 'nomic',
  NIBIRU: 'nibiru',
  MAYA_CHAIN: 'mayachain',
  EMPOWER_CHAIN: 'empowerchain',
  DYDX: 'dydx',
  GITOPIA: 'gitopia',
  SGE: 'sge',
  CELESTIA: 'celestia',
  XPLA: 'xpla',
  COMPOSABLE: 'composable',
  PRYZM: 'pryzmtestnet',
  THOR_CHAIN: 'thorchain',
  ODIN_CHAIN: 'odin',
};
