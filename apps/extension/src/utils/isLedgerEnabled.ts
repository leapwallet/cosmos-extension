import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'

import { LEDGER_DISABLED_COINTYPES } from '../config/config'
import {
  getLedgerEnabledEvmChainsIds,
  getLedgerEnabledEvmChainsKey,
} from './getLedgerEnabledEvmChains'

export function isLedgerEnabled(chain: SupportedChain, coinType: string, chains: ChainInfo[]) {
  const ledgerEnabledEvmChains = getLedgerEnabledEvmChainsKey(chains)
  if (ledgerEnabledEvmChains.includes(chain)) return true

  if (LEDGER_DISABLED_COINTYPES.includes(coinType)) return false
  return true
}

export function isLedgerEnabledChainId(chainId: string, coinType: string, chains: ChainInfo[]) {
  const ledgerEnabledEvmChainsIds = getLedgerEnabledEvmChainsIds(chains)
  if (ledgerEnabledEvmChainsIds.includes(chainId)) return true

  if (ledgerEnabledEvmChainsIds.includes(coinType)) return false
  return true
}
