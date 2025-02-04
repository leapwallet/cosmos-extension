import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'

export function getLedgerEnabledEvmChainsKey(chains: ChainInfo[]): SupportedChain[] {
  const evmOnlyChainsKey = chains.reduce((_evmOnlyChainsKey, chain) => {
    if (chain.evmOnlyChain || chain.bip44.coinType === '60') {
      _evmOnlyChainsKey.push(chain.key)
    }

    return _evmOnlyChainsKey
  }, [] as SupportedChain[])

  return evmOnlyChainsKey
}

export function getLedgerEnabledEvmChainsIds(chains: ChainInfo[]) {
  const evmOnlyChainsIds = chains.reduce((_evmOnlyChainsIds, chain) => {
    if (chain.evmOnlyChain || chain.bip44.coinType === '60') {
      _evmOnlyChainsIds.push(chain.chainId)
    }

    return _evmOnlyChainsIds
  }, [] as string[])

  return evmOnlyChainsIds
}
