import { DEFAULT_STD_FEE } from '@injectivelabs/sdk-ts';

import { SupportedChain } from './chain-infos';

export const INJECTIVE_DEFAULT_STD_FEE = DEFAULT_STD_FEE;

export const defaultGasPriceStep = {
  low: 0.01,
  average: 0.025,
  high: 0.04,
};

type GasEstimates = {
  DEFAULT_GAS_TRANSFER: number;
  DEFAULT_GAS_IBC: number;
  DEFAULT_GAS_STAKE: number;
};

export const DEFAULT_GAS_REDELEGATE = 300_000;

export const DefaultGasEstimates = {
  DEFAULT_GAS_TRANSFER: 100_000,
  DEFAULT_GAS_IBC: 180_000,
  DEFAULT_GAS_STAKE: 160_000,
};

export const defaultGasEstimates: Record<SupportedChain, GasEstimates> = {
  cosmos: { ...DefaultGasEstimates, DEFAULT_GAS_TRANSFER: 80_000 },
  osmosis: DefaultGasEstimates,
  juno: { ...DefaultGasEstimates, DEFAULT_GAS_TRANSFER: 80_000 },
  stargaze: DefaultGasEstimates,
  sifchain: { ...DefaultGasEstimates, DEFAULT_GAS_TRANSFER: 120_000 },
  secret: DefaultGasEstimates,
  axelar: DefaultGasEstimates,
  akash: { ...DefaultGasEstimates, DEFAULT_GAS_STAKE: 220_000 },
  assetmantle: DefaultGasEstimates,
  comdex: DefaultGasEstimates,
  crescent: DefaultGasEstimates,
  cryptoorg: DefaultGasEstimates,
  emoney: DefaultGasEstimates,
  irisnet: DefaultGasEstimates,
  persistenceNew: DefaultGasEstimates,
  persistence: DefaultGasEstimates,
  sommelier: DefaultGasEstimates,
  starname: DefaultGasEstimates,
  umee: DefaultGasEstimates,
  kujira: DefaultGasEstimates,
  injective: DefaultGasEstimates,
  mars: DefaultGasEstimates,
  sei: DefaultGasEstimates,
  stride: DefaultGasEstimates,
  agoric: DefaultGasEstimates,
  cheqd: DefaultGasEstimates,
  likecoin: DefaultGasEstimates,
  gravitybridge: DefaultGasEstimates,
  chihuahua: { DEFAULT_GAS_TRANSFER: 100_000, DEFAULT_GAS_STAKE: 100_000, DEFAULT_GAS_IBC: 100_000 },
  fetchhub: DefaultGasEstimates,
  desmos: DefaultGasEstimates,
  teritori: DefaultGasEstimates,
  jackal: DefaultGasEstimates,
  evmos: { ...DefaultGasEstimates, DEFAULT_GAS_STAKE: 500_000 },
  bitsong: DefaultGasEstimates,
  bitcanna: DefaultGasEstimates,
  canto: {
    DEFAULT_GAS_TRANSFER: 3_000_000,
    DEFAULT_GAS_STAKE: 3_000_000,
    DEFAULT_GAS_IBC: 3_000_000,
  },
  decentr: DefaultGasEstimates,
  carbon: {
    DEFAULT_GAS_TRANSFER: 120_000,
    DEFAULT_GAS_STAKE: 250_000,
    DEFAULT_GAS_IBC: 250_000,
  },
  cudos: DefaultGasEstimates,
  kava: DefaultGasEstimates,
  omniflix: DefaultGasEstimates,
  passage: DefaultGasEstimates,
  archway: DefaultGasEstimates,
  terra: DefaultGasEstimates,
  quasar: DefaultGasEstimates,
  neutron: DefaultGasEstimates,
  coreum: DefaultGasEstimates,
  mainCoreum: DefaultGasEstimates,
  quicksilver: DefaultGasEstimates,
  migaloo: DefaultGasEstimates,
  kyve: DefaultGasEstimates,
  seiTestnet2: {
    DEFAULT_GAS_TRANSFER: 300_000,
    DEFAULT_GAS_STAKE: 300_000,
    DEFAULT_GAS_IBC: 300_000,
  },
  onomy: DefaultGasEstimates,
  noble: DefaultGasEstimates,
  impacthub: DefaultGasEstimates,
  planq: { ...DefaultGasEstimates, DEFAULT_GAS_STAKE: 200_000 },
  nomic: DefaultGasEstimates,
  nolus: DefaultGasEstimates,
  chain4energy: DefaultGasEstimates,
  gitopia: DefaultGasEstimates,
  nibiru: DefaultGasEstimates,
  mayachain: DefaultGasEstimates,
  empowerchain: DefaultGasEstimates,
  dydx: DefaultGasEstimates,
  celestia: DefaultGasEstimates,
  sge: DefaultGasEstimates,
  xpla: DefaultGasEstimates,
  provenance: DefaultGasEstimates,
  aura: DefaultGasEstimates,
  kichain: DefaultGasEstimates,
  sentinel: DefaultGasEstimates,
  bandchain: DefaultGasEstimates,
  composable: DefaultGasEstimates,
  seiDevnet: DefaultGasEstimates,
  dymension: DefaultGasEstimates,
  pryzmtestnet: DefaultGasEstimates,
  thorchain: DefaultGasEstimates,
  odin: DefaultGasEstimates,
};
