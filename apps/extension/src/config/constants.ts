import { WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'

export const walletLabels: Record<WALLETTYPE, string> = {
  [WALLETTYPE.SEED_PHRASE_IMPORTED]: 'Imported',
  [WALLETTYPE.LEDGER]: 'Ledger',
  [WALLETTYPE.PRIVATE_KEY]: 'Imported',
  [WALLETTYPE.SEED_PHRASE]: '',
}

export const PriorityChains: Array<SupportedChain> = [
  'cosmos',
  'osmosis',
  'celestia',
  'dydx',
  'injective',
  'stargaze',
]

export const FIXED_FEE_CHAINS = ['mayachain', 'thorchain']
