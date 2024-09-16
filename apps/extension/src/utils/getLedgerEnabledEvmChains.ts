import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { LEDGER_ENABLED_EVM_CHAIN_IDS, LEDGER_ENABLED_EVM_CHAINS } from 'config/config'

export function getLedgerEnabledEvmChainsKey(chains: ChainInfo[]): SupportedChain[] {
  const evmOnlyChainsKey = chains.reduce((_evmOnlyChainsKey, chain) => {
    if (chain.evmOnlyChain) {
      _evmOnlyChainsKey.push(chain.key)
    }

    return _evmOnlyChainsKey
  }, [] as SupportedChain[])

  return [...LEDGER_ENABLED_EVM_CHAINS, ...evmOnlyChainsKey]
}

export function getLedgerEnabledEvmChainsIds(chains: ChainInfo[]) {
  const evmOnlyChainsIds = chains.reduce((_evmOnlyChainsIds, chain) => {
    if (chain.evmOnlyChain) {
      _evmOnlyChainsIds.push(chain.chainId)
    }

    return _evmOnlyChainsIds
  }, [] as string[])

  return [...LEDGER_ENABLED_EVM_CHAIN_IDS, ...evmOnlyChainsIds]
}
