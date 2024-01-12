import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'

export const LEAP_API_BASEURL = 'https://staging-api.leapwallet.io'
export const DEFAULT_GAS_IBC = 180000
export const DEFAULT_GAS_TRANSFER = 80000
export const DEFAULT_GAS_STAKE = 150000
export const DEFAULT_SWAP_FEE = 0.004
export const ON_RAMP_SUPPORT_CHAINS = ['osmosis', 'juno', 'kujira']
export const KADO_BUY_SUPPORT_CHAINS: SupportedChain[] = [
  'cosmos',
  'juno',
  'osmosis',
  'secret',
  'injective',
  'stargaze',
  'comdex',
  'terra',
  'migaloo',
  'agoric',
]
export const LEDGER_NAME_EDITED_SUFFIX = '%LEDGER_NAME_EDITED%'
export const LEDGER_NAME_EDITED_SUFFIX_REGEX = new RegExp(LEDGER_NAME_EDITED_SUFFIX)

export const QUICK_SEARCH_DISABLED_PAGES = [
  '/sign',
  '/approveConnection',
  '/suggestChain',
  '/add-token',
  '/add-secret-token',
]

export const RECAPTCHA_CHAINS = ['pryzmtestnet']
export const LEDGER_DISABLED_COINTYPES = ['60', '931']
