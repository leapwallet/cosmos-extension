import { ChainInfo, SupportedChain } from '../constants';

export function getEvmChainIdMap(chains: Record<SupportedChain, ChainInfo>, isCompass: boolean) {
  const chainIdsMap: Record<string, { key: string; isTestnet: boolean }> = {};
  Object.values(chains).forEach((chain) => {
    if (chain.evmOnlyChain || (isCompass && ['seiDevnet', 'seiTestnet2'].includes(chain.key)) || chain.key === 'xrpl') {
      if (chain.evmChainId) {
        chainIdsMap[chain.evmChainId] = { key: chain.key, isTestnet: false };
      }

      if (chain.evmChainIdTestnet) {
        chainIdsMap[chain.evmChainIdTestnet] = { key: chain.key, isTestnet: true };
      }
    }
  });

  return chainIdsMap;
}
