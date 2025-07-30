import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'

export const isCosmosLedgerChain = (chain: ChainInfo) => {
  return (
    chain?.bip44 &&
    chain.bip44.coinType !== '60' &&
    chain.bip44.coinType !== '931' &&
    chain.bip44.coinType !== '0' &&
    chain.bip44.coinType !== '1' &&
    chain.bip44.coinType !== '637' &&
    chain.bip44.coinType !== '501' &&
    chain.bip44.coinType !== '784'
  )
}

export const isEvmLedgerChain = (chain: ChainInfo) => {
  return chain?.evmOnlyChain || chain?.bip44?.coinType === '60'
}

export function getLedgerEnabledCosmosChainsKey(chains: ChainInfo[]): SupportedChain[] {
  const cosmosOnlyChainsKey = chains.reduce((_cosmosOnlyChainsKey, chain) => {
    if (isCosmosLedgerChain(chain)) {
      _cosmosOnlyChainsKey.push(chain?.key)
    }

    return _cosmosOnlyChainsKey
  }, [] as SupportedChain[])

  return cosmosOnlyChainsKey
}

export function getLedgerEnabledCosmosChainsIds(chains: ChainInfo[]) {
  const cosmosOnlyChainsIds = chains.reduce((_cosmosOnlyChainsIds, chain) => {
    if (isCosmosLedgerChain(chain)) {
      _cosmosOnlyChainsIds.push(chain?.chainId)
    }

    return _cosmosOnlyChainsIds
  }, [] as string[])

  return cosmosOnlyChainsIds
}

export function getLedgerEnabledEvmChainsKey(chains: ChainInfo[]): SupportedChain[] {
  const evmOnlyChainsKey = chains.reduce((_evmOnlyChainsKey, chain) => {
    if (isEvmLedgerChain(chain)) {
      _evmOnlyChainsKey.push(chain.key)
    }

    return _evmOnlyChainsKey
  }, [] as SupportedChain[])

  return evmOnlyChainsKey
}

export function getLedgerEnabledEvmChainsIds(chains: ChainInfo[]) {
  const evmOnlyChainsIds = chains.reduce((_evmOnlyChainsIds, chain) => {
    if (isEvmLedgerChain(chain)) {
      _evmOnlyChainsIds.push(chain.chainId)
    }

    return _evmOnlyChainsIds
  }, [] as string[])

  return evmOnlyChainsIds
}
