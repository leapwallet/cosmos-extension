import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'

import { LEDGER_DISABLED_COINTYPES } from '../config/config'

export function isLedgerEnabled(chain: SupportedChain, coinType: string, chains: ChainInfo[]) {
  if (LEDGER_DISABLED_COINTYPES.includes(coinType)) return false
  return true
}
