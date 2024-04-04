import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'

import {
  LEDGER_DISABLED_COINTYPES,
  LEDGER_ENABLED_EVM_CHAIN_IDS,
  LEDGER_ENABLED_EVM_CHAINS,
} from '../config/config'

export function isLedgerEnabled(chain: SupportedChain, coinType: string) {
  if (LEDGER_ENABLED_EVM_CHAINS.includes(chain)) return true
  if (LEDGER_DISABLED_COINTYPES.includes(coinType)) return false
  return true
}

export function isLedgerEnabledChainId(chainId: string, coinType: string) {
  if (LEDGER_ENABLED_EVM_CHAIN_IDS.includes(chainId)) return true
  if (LEDGER_ENABLED_EVM_CHAIN_IDS.includes(coinType)) return false
  return true
}
