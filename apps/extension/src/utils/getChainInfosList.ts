import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'

export function getChainInfosList(chainInfos: Record<SupportedChain, ChainInfo>) {
  return Object.values(chainInfos)
    .filter((chain) => chain.enabled)
    .map((chainInfo) => ({
      addressPrefix: chainInfo.addressPrefix,
      coinType: chainInfo.bip44.coinType,
      key: chainInfo.key,
    }))
}
